// Filbert: Loose parser
//
// This module provides an alternative parser (`parse_dammit`) that
// exposes that same interface as `parse`, but will try to parse
// anything as Python, repairing syntax errors the best it can.
// There are circumstances in which it will raise an error and give
// up, but they are very rare. The resulting AST will be a mostly
// valid JavaScript AST (as per the [Mozilla parser API][api], except
// that:
//
// - Return outside functions is allowed
//
// - Bogus Identifier nodes with a name of `"✖"` are inserted whenever
//   the parser got too confused to return anything meaningful.
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
//
// The expected use for this is to *first* try `filbert.parse`, and only
// if that fails switch to `parse_dammit`. The loose parser might
// parse badly indented code incorrectly, so **don't** use it as
// your default parser.
//
// Quite a lot of filbert.js is duplicated here. The alternative was to
// add a *lot* of extra cruft to that file, making it less readable
// and slower. Copying and editing the code allowed invasive changes and 
// simplifications without creating a complicated tangle.

(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object") return mod(exports, require("./filbert")); // CommonJS
  if (typeof define == "function" && define.amd) return define(["exports", "./filbert_loose"], mod); // AMD
  mod(root.filbert_loose || (root.filbert_loose = {}), root.filbert); // Plain browser env
})(this, function(exports, filbert) {
  "use strict";

  console.log(filbert);
  var tt = filbert.tokTypes;
  var scope = filbert.scope;
  var indentHist = filbert.indentHist;

  var options, input, inputLen, fetchToken, nc;

  exports.parse_dammit = function(inpt, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    if (!options.tabSize) options.tabSize = 4;
    fetchToken = filbert.tokenize(inpt, options);
    ahead.length = 0;
    newAstIdCount = 0;
    scope.init();
    nc = filbert.getNodeCreator(startNode, startNodeFrom, finishNode, unpackTuple);
    next();
    return parseTopLevel();
  };

  function setOptions(opts) {
    options = opts || {};
    for (var opt in filbert.defaultOptions) if (!Object.prototype.hasOwnProperty.call(options, opt))
      options[opt] = filbert.defaultOptions[opt];
    sourceFile = options.sourceFile || null;
  }

  var lastEnd, token = {start: 0, end: 0}, ahead = [];
  var lastEndLoc, sourceFile;

  var newAstIdCount = 0;

  function next() {
    lastEnd = token.end;
    if (options.locations) lastEndLoc = token.endLoc;

    if (ahead.length) token = ahead.shift();
    else token = readToken();
  }

  function readToken() {
    for (;;) {
      try {
        return fetchToken();
      } catch(e) {
        if (!(e instanceof SyntaxError)) throw e;

        // Try to skip some text, based on the error message, and then continue
        var msg = e.message, pos = e.raisedAt, replace = true;
        if (/unterminated/i.test(msg)) {
          pos = lineEnd(e.pos);
          if (/string/.test(msg)) {
            replace = {start: e.pos, end: pos, type: tt.string, value: input.slice(e.pos + 1, pos)};
          } else if (/regular expr/i.test(msg)) {
            var re = input.slice(e.pos, pos);
            try { re = new RegExp(re); } catch(e) {}
            replace = {start: e.pos, end: pos, type: tt.regexp, value: re};
          } else {
            replace = false;
          }
        } else if (/invalid (unicode|regexp|number)|expecting unicode|octal literal|is reserved|directly after number/i.test(msg)) {
          while (pos < input.length && !isSpace(input.charCodeAt(pos)) && !isNewline(input.charCodeAt(pos))) ++pos;
        } else if (/character escape|expected hexadecimal/i.test(msg)) {
          while (pos < input.length) {
            var ch = input.charCodeAt(pos++);
            if (ch === 34 || ch === 39 || isNewline(ch)) break;
          }
        } else if (/unexpected character/i.test(msg)) {
          pos++;
          replace = false;
        } else if (/regular expression/i.test(msg)) {
          replace = true;
        } else {
          throw e;
        }
        resetTo(pos);
        if (replace === true) replace = {start: pos, end: pos, type: tt.name, value: "✖"};
        if (replace) {
          if (options.locations) {
            replace.startLoc = filbert.getLineInfo(input, replace.start);
            replace.endLoc = filbert.getLineInfo(input, replace.end);
          }
          return replace;
        }
      }
    }
  }

  function resetTo(pos) {
    var ch = input.charAt(pos - 1);
    var reAllowed = !ch || /[\[\{\(,;:?\/*=+\-~!|&%^<>]/.test(ch) ||
      /[enwfd]/.test(ch) && /\b(keywords|case|else|return|throw|new|in|(instance|type)of|delete|void)$/.test(input.slice(pos - 10, pos));
    fetchToken.jumpTo(pos, reAllowed);
  }

  function copyToken(token) {
    var copy = {start: token.start, end: token.end, type: token.type, value: token.value};
    if (options.locations) {
      copy.startLoc = token.startLoc;
      copy.endLoc = token.endLoc;
    }
    return copy;
  }

  function lookAhead(n) {
    // Copy token objects, because fetchToken will overwrite the one
    // it returns, and in this case we still need it
    if (!ahead.length)
      token = copyToken(token);
    while (n > ahead.length)
      ahead.push(copyToken(readToken()));
    return ahead[n-1];
  }

  var newline = /[\n\r\u2028\u2029]/;
  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  function isNewline(ch) {
    return ch === 10 || ch === 13 || ch === 8232 || ch === 8329;
  }
  
  function isSpace(ch) {
    return ch === 9 || ch === 11 || ch === 12 ||
      ch === 32 || // ' '
      ch === 35 || // '#'
      ch === 160 || // '\xa0'
      ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch));
  }
  
  function lineEnd(pos) {
    while (pos < input.length && !isNewline(input.charCodeAt(pos))) ++pos;
    return pos;
  }

  function skipLine() {
    fetchToken.jumpTo(lineEnd(token.start), false);
  }

  function Node(start) {
    this.type = null;
  }
  Node.prototype = filbert.Node.prototype;

  function SourceLocation(start) {
    this.start = start || token.startLoc || {line: 1, column: 0};
    this.end = null;
    if (sourceFile !== null) this.source = sourceFile;
  }

  function startNode() {
    var node = new Node(token.start);
    if (options.locations)
      node.loc = new SourceLocation();
    if (options.directSourceFile)
      node.sourceFile = options.directSourceFile;
    if (options.ranges)
      node.range = [token.start, 0];
    return node;
  }

  function startNodeFrom(other) {
    var node = new Node(other.start);
    if (options.locations)
      node.loc = new SourceLocation(other.loc.start);
    if (options.ranges)
      node.range = [other.range[0], 0];
    return node;
  }

  function finishNode(node, type) {
    node.type = type;
    if (options.locations)
      node.loc.end = lastEndLoc;
    if (options.ranges)
      node.range[1] = lastEnd;
    return node;
  }

  function getDummyLoc() {
    if (options.locations) {
      var loc = new SourceLocation();
      loc.end = loc.start;
      return loc;
    }
  }

  var dummyCount = 0
  function dummyIdent() {
    var dummy = new Node(token.start);
    dummy.type = "Identifier";
    dummy.end = token.start;
    dummy.name = "dummy" + dummyCount++;
    dummy.loc = getDummyLoc();
    return dummy;
  }
  function isDummy(node) { return node.name && node.name.indexOf("dummy") === 0; }

  function eat(type) {
    if (token.type === type) {
      next();
      return true;
    }
  }

  function expect(type) {
    if (eat(type)) return true;
    if (lookAhead(1).type == type) {
      next(); next();
      return true;
    }
    if (lookAhead(2).type == type) {
      next(); next(); next();
      return true;
    }
  }

  function checkLVal(expr) {
    if (expr.type === "Identifier" || expr.type === "MemberExpression") return expr;
    return dummyIdent();
  }

  // Get args for a new tuple expression

  function getTupleArgs(expr) {
    if (expr.callee && expr.callee.object && expr.callee.object.object &&
      expr.callee.object.object.name === options.runtimeParamName &&
      expr.callee.property && expr.callee.property.name === "tuple")
      return expr.arguments;
    return null;
  }

  // Unpack an lvalue tuple into indivual variable assignments
  // 'arg0, arg1 = right' becomes:
  // var tmp = right
  // arg0 = tmp[0]
  // arg1 = tmp[1]
  // ...

  function unpackTuple(tupleArgs, right) {
    var varStmts = [];

    // var tmp = right

    var tmpId = nc.createNodeSpan(right, right, "Identifier", { name: "__filbertTmp" + newAstIdCount++ });
    var tmpDecl = nc.createVarDeclFromId(right, tmpId, right);
    varStmts.push(tmpDecl);

    // argN = tmp[N]

    if (tupleArgs && tupleArgs.length > 0) {
      for (var i = 0; i < tupleArgs.length; i++) {
        var lval = tupleArgs[i];
        var subTupleArgs = getTupleArgs(lval);
        if (subTupleArgs) {
          var subLit = nc.createNodeSpan(right, right, "Literal", { value: i });
          var subRight = nc.createNodeSpan(right, right, "MemberExpression", { object: tmpId, property: subLit, computed: true });
          var subStmts = unpackTuple(subTupleArgs, subRight);
          for (var j = 0; j < subStmts.length; j++) varStmts.push(subStmts[j]);
        } else {
          checkLVal(lval);
          var indexId = nc.createNodeSpan(right, right, "Literal", { value: i });
          var init = nc.createNodeSpan(right, right, "MemberExpression", { object: tmpId, property: indexId, computed: true });
          if (lval.type === "Identifier" && !scope.exists(lval.name)) {
            scope.addVar(lval.name);
            var varDecl = nc.createVarDeclFromId(lval, lval, init);
            varStmts.push(varDecl);
          }
          else {
            var node = startNodeFrom(lval);
            node.left = lval;
            node.operator = "=";
            node.right = init;
            finishNode(node, "AssignmentExpression");
            varStmts.push(nc.createNodeFrom(node, "ExpressionStatement", { expression: node }));
          }
        }
      }
    }

    return varStmts;
  }

  // ### Statement parsing

  function parseTopLevel() {
    var node = startNode();
    node.body = [];
    while (token.type !== tt.eof) {
      var stmt = parseStatement();
      if (stmt) node.body.push(stmt);
    }
    return finishNode(node, "Program");
  }

  function parseStatement() {
    var starttype = token.type, node = startNode();

    switch (starttype) {

    case tt._break:
      next();
      return finishNode(node, "BreakStatement");

    case tt._continue:
      next();
      return finishNode(node, "ContinueStatement");

    case tt._class:
      next();
      return parseClass(node);

    case tt._def:
      next();
      return parseFunction(node);

    case tt._for:
      next();
      return parseFor(node);

    case tt._from: // Skipping from and import statements for now
      skipLine();
      next();
      return parseStatement();

    case tt._if: case tt._elif:
      next();
      if (token.type === tt.parenL) node.test = parseParenExpression();
      else node.test = parseExpression();
      expect(tt.colon);
      node.consequent = parseSuite();
      if (token.type === tt._elif)
        node.alternate = parseStatement();
      else
        node.alternate = eat(tt._else) && eat(tt.colon) ? parseSuite() : null;
      return finishNode(node, "IfStatement");

    case tt._import: // Skipping from and import statements for now
      skipLine();
      next();
      return parseStatement();

    case tt.newline:
      // TODO: parseStatement() should probably eat it's own newline
      next();
      return null;

    case tt._pass:
      next();
      return finishNode(node, "EmptyStatement");

    case tt._return:
      next();
      if (token.type === tt.newline || token.type === tt.eof) node.argument = null;
      else { node.argument = parseExpression(); }
      return finishNode(node, "ReturnStatement"); 

    case tt._while:
      next();
      if (token.type === tt.parenL) node.test = parseParenExpression();
      else node.test = parseExpression();
      expect(tt.colon);
      node.body = parseSuite();
      return finishNode(node, "WhileStatement");

    case tt.semi:
      next();
      return finishNode(node, "EmptyStatement");

    case tt.indent:
      // Unexpected indent, let's ignore it
      indentHist.undoIndent();
      next();
      return parseStatement();

    default:
      var expr = parseExpression();
      if (isDummy(expr)) {
        next();
        if (token.type === tt.eof) return finishNode(node, "EmptyStatement");
        return parseStatement();
      } else if (expr.type === "VariableDeclaration" || expr.type === "BlockStatement") {
        return expr;
      } else {
        node.expression = expr;
        return finishNode(node, "ExpressionStatement");
      }
    }
  }

  function parseSuite() {
    var node = startNode();
    node.body = [];
    if (eat(tt.newline)) {
      eat(tt.indent);
      while (!eat(tt.dedent) && token.type !== tt.eof) {
        var stmt = parseStatement();
        if (stmt) node.body.push(stmt);
      }
    } else {
      node.body.push(parseStatement());
      next();
    }
    return finishNode(node, "BlockStatement");
  }

  function parseFor(node) {
    var init = parseExpression(false, true);
    var tupleArgs = getTupleArgs(init);
    if (!tupleArgs) checkLVal(init);
    expect(tt._in);
    var right = parseExpression();
    expect(tt.colon);
    var body = parseSuite();
    finishNode(node, "BlockStatement");
    return nc.createFor(node, init, tupleArgs, right, body);
  }

  // ### Expression parsing

  function parseExpression(noComma, noIn) {
    return parseMaybeAssign(noIn);
  }

  function parseParenExpression() {
    expect(tt.parenL);
    var val = parseExpression();
    expect(tt.parenR);
    return val;
  }

  function parseMaybeAssign(noIn) {
    var left = parseMaybeTuple(noIn);
    if (token.type.isAssign) {
      var tupleArgs = getTupleArgs(left);
      if (tupleArgs) {
        next();
        var right = parseMaybeTuple(noIn);
        var blockNode = startNodeFrom(left);
        blockNode.body = unpackTuple(tupleArgs, right);
        return finishNode(blockNode, "BlockStatement");
      }

      if (scope.isClass()) {
        var thisExpr = nc.createNodeFrom(left, "ThisExpression");
        left = nc.createNodeFrom(left, "MemberExpression", { object: thisExpr, property: left });
      }

      var node = startNodeFrom(left);
      node.operator = token.value;
      node.left = checkLVal(left);
      next();
      node.right = parseMaybeTuple(noIn);

      if (node.operator === '+=' || node.operator === '*=') {
        var right = nc.createNodeSpan(node.right, node.right, "CallExpression");
        right.callee = nc.createNodeOpsCallee(right, node.operator === '+=' ? "add" : "multiply");
        right.arguments = [left, node.right];
        node.right = right;
        node.operator = '=';
      }

      if (left.type === "Identifier" && !scope.exists(left.name)) {
        scope.addVar(left.name);
        return nc.createVarDeclFromId(node.left, node.left, node.right);
      }

      return finishNode(node, "AssignmentExpression");
    }
    return left;
  }

  function parseMaybeTuple(noIn) {
    var expr = parseExprOps(noIn);
    if (token.type === tt.comma) {
      return parseTuple(noIn, expr);
    }
    return expr;
  }

  function parseExprOps(noIn) {
    return parseExprOp(parseMaybeUnary(noIn), -1, noIn);
  }

  function parseExprOp(left, minPrec, noIn) {
    var node, exprNode, right, op = token.type, val = token.value;
    var prec = op === tt._not ? tt._in.prec : op.prec;
    if (op === tt.exponentiation && prec >= minPrec) {
      node = startNodeFrom(left);
      next();
      right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
      exprNode = nc.createNodeMemberCall(node, "Math", "pow", [left, right]);
      return parseExprOp(exprNode, minPrec, noIn);
    } else if (prec != null && (!noIn || op !== tt._in)) {
      if (prec > minPrec) {
        next();
        node = startNodeFrom(left);
        if (op === tt.floorDiv) {
          right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
          finishNode(node);
          var binExpr = nc.createNodeSpan(node, node, "BinaryExpression", { left: left, operator: '/', right: right });
          exprNode = nc.createNodeMemberCall(node, "Math", "floor", [binExpr]);
        } else if (op === tt._in || op === tt._not) {
          if (op === tt._in || eat(tt._in)) {
            right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
            finishNode(node);
            var notLit = nc.createNodeSpan(node, node, "Literal", { value: op === tt._not });
            exprNode = nc.createNodeRuntimeCall(node, 'ops', 'in', [left, right, notLit]);
          } else exprNode = dummyIdent();
        } else if (op === tt.plusMin && val === '+' || op === tt.multiplyModulo && val === '*') {
          node.arguments = [left];
          node.arguments.push(parseExprOp(parseMaybeUnary(noIn), prec, noIn));
          finishNode(node, "CallExpression");
          node.callee = nc.createNodeOpsCallee(node, op === tt.plusMin ? "add" : "multiply");
          exprNode = node;
        } else {
          if (op === tt._is) {
            if (eat(tt._not)) node.operator = "!==";
            else node.operator = "===";
          } else node.operator = op.rep != null ? op.rep : val;

          // Accept '===' as '=='
          if (input[token.start - 1] === '=' && input[token.start - 2] === '=') next();

          node.left = left;
          node.right = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
          exprNode = finishNode(node, (op === tt._or || op === tt._and) ? "LogicalExpression" : "BinaryExpression");
        }
        return parseExprOp(exprNode, minPrec, noIn);
      }
    }
    return left;
  }

  function parseMaybeUnary(noIn) {
    if (token.type.prefix || token.type === tt.plusMin) {
      var prec = token.type === tt.plusMin ? tt.posNegNot.prec : token.type.prec;
      var node = startNode();
      node.operator = token.type.rep != null ? token.type.rep : token.value;
      node.prefix = true;
      next();
      node.argument = parseExprOp(parseMaybeUnary(noIn), prec, noIn);
      return finishNode(node, "UnaryExpression");
    }
    return parseSubscripts(parseExprAtom(), false);
  }

  function parseSubscripts(base, noCalls) {
    var node = startNodeFrom(base);
    if (eat(tt.dot)) {
      var id = parseIdent(true);
      if (filbert.pythonRuntime.imports[base.name] && filbert.pythonRuntime.imports[base.name][id.name]) {
        // Calling a Python import function
        var runtimeId = nc.createNodeSpan(base, base, "Identifier", { name: options.runtimeParamName });
        var importsId = nc.createNodeSpan(base, base, "Identifier", { name: "imports" });
        var runtimeMember = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeId, property: importsId, computed: false });
        node.object = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeMember, property: base, computed: false });
      } else if (base.name && base.name === scope.getThisReplace()) {
        node.object = nc.createNodeSpan(base, base, "ThisExpression");
      } else node.object = base;
      node.property = id;
      node.computed = false;
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    } else if (eat(tt.bracketL)) {
      var expr, isSlice = false;
      if (eat(tt.colon)) isSlice = true;
      else expr = parseExpression();
      if (!isSlice && eat(tt.colon)) isSlice = true;
      if (isSlice) return parseSlice(node, base, expr, noCalls);
      var subscriptCall = nc.createNodeSpan(expr, expr, "CallExpression");
      subscriptCall.callee = nc.createNodeOpsCallee(expr, "subscriptIndex");
      subscriptCall.arguments = [base, expr];
      node.object = base;
      node.property = subscriptCall;
      node.computed = true;
      expect(tt.bracketR);
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    } else if (!noCalls && eat(tt.parenL)) {
      if (scope.isUserFunction(base.name)) {
        // Unpack parameters into JavaScript-friendly parameters, further processed at runtime
        var createParamsCall = nc.createNodeRuntimeCall(node, 'utils', 'createParamsObj', parseParamsList());
        node.arguments = [createParamsCall];
      } else node.arguments = parseExprList(tt.parenR, false);
      
      if (scope.isNewObj(base.name)) finishNode(node, "NewExpression");
      else finishNode(node, "CallExpression");
      if (filbert.pythonRuntime.functions[base.name]) {
        // Calling a Python built-in function
        var runtimeId = nc.createNodeSpan(base, base, "Identifier", { name: options.runtimeParamName });
        var functionsId = nc.createNodeSpan(base, base, "Identifier", { name: "functions" });
        var runtimeMember = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeId, property: functionsId, computed: false });
        node.callee = nc.createNodeSpan(base, base, "MemberExpression", { object: runtimeMember, property: base, computed: false });
      } else node.callee = base;
      return parseSubscripts(node, noCalls);
    }
    return base;
  }

  function parseSlice(node, base, start, noCalls) {
    var end, step;
    if (!start) start = nc.createNodeFrom(node, "Literal", { value: null });
    if (token.type === tt.bracketR || eat(tt.colon)) {
      end = nc.createNodeFrom(node, "Literal", { value: null });
    } else {
      end = parseExpression();
      if (token.type !== tt.bracketR) expect(tt.colon);
    }
    if (token.type === tt.bracketR) step = nc.createNodeFrom(node, "Literal", { value: null });
    else step = parseExpression();
    expect(tt.bracketR);

    node.arguments = [start, end, step];
    var sliceId = nc.createNodeFrom(base, "Identifier", { name: "_pySlice" });
    var memberExpr = nc.createNodeSpan(base, base, "MemberExpression", { object: base, property: sliceId, computed: false });
    node.callee = memberExpr;
    return parseSubscripts(finishNode(node, "CallExpression"), noCalls);
  }

  function parseExprAtom() {
    switch (token.type) {

    case tt._dict:
      next();
      return parseDict(tt.parenR);

    case tt.name:
      return parseIdent();

    case tt.num: case tt.string: case tt.regexp:
      var node = startNode();
      node.value = token.value;
      node.raw = input.slice(token.start, token.end);
      next();
      return finishNode(node, "Literal");

    case tt._None: case tt._True: case tt._False:
      var node = startNode();
      node.value = token.type.atomValue;
      node.raw = token.type.keyword;
      next();
      return finishNode(node, "Literal");

    case tt.parenL:
      var tokStartLoc1 = token.startLoc, tokStart1 = token.start;
      next();
      if (token.type === tt.parenR) {
        var node = parseTuple(true);
        eat(tt.parenR);
        return node;
      }
      var val = parseMaybeTuple(true);
      if (options.locations) {
        val.loc.start = tokStartLoc1;
        val.loc.end = token.endLoc;
      }
      if (options.ranges)
        val.range = [tokStart1, token.end];
      expect(tt.parenR);
      return val;

    case tt.bracketL:
      return parseList();

    case tt.braceL:
      return parseDict(tt.braceR);

    default:
      return dummyIdent();
    }
  }

  // Parse list

  // Custom list object is used to simulate native Python list
  // E.g. Python '[]' becomes JavaScript 'new __pythonRuntime.objects.list();'
  // If list comprehension, build something like this:
  //(function() {
  //  var _list = [];
  //  ...
  //  _list.push(expr);
  //  return _list;
  //}());

  function parseList() {
    var node = startNode();
    node.arguments = [];
    next();

    if (!eat(tt.bracketR)) {
      var expr = parseExprOps(false);
      if (token.type === tt._for || token.type === tt._if) {

        // List comprehension
        var tmpVarSuffix = newAstIdCount++;
        expr = nc.createListCompPush(expr, tmpVarSuffix);
        var body = parseCompIter(expr, true);
        finishNode(node);
        return nc.createListCompIife(node, body, tmpVarSuffix);

      } else if (eat(tt.comma)) {
        node.arguments = [expr].concat(parseExprList(tt.bracketR, true, false));
      }
      else {
        expect(tt.bracketR);
        node.arguments = [expr];
      }
    }

    finishNode(node, "NewExpression");
    var runtimeId = nc.createNodeSpan(node, node, "Identifier", { name: options.runtimeParamName });
    var objectsId = nc.createNodeSpan(node, node, "Identifier", { name: "objects" });
    var runtimeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeId, property: objectsId, computed: false });
    var listId = nc.createNodeSpan(node, node, "Identifier", { name: "list" });
    node.callee = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeMember, property: listId, computed: false });
    return node;
  }

  // Parse a comp_iter from Python language grammar
  // 'expr' is the body to be used after unrolling the ifs and fors

  function parseCompIter(expr, first) {
    if (first && token.type !== tt._for) return dummyIdent();
    if (eat(tt.bracketR)) return expr;
    var node = startNode();
    if (eat(tt._for)) {
      var init = parseExpression(false, true);
      var tupleArgs = getTupleArgs(init);
      if (!tupleArgs) checkLVal(init);
      expect(tt._in);
      var right = parseExpression();
      var body = parseCompIter(expr, false);
      var block = nc.createNodeSpan(body, body, "BlockStatement", { body: [body] });
      finishNode(node, "BlockStatement");
      return nc.createFor(node, init, tupleArgs, right, block);
    } else if (eat(tt._if)) {
      if (token.type === tt.parenL) node.test = parseParenExpression();
      else node.test = parseExpression();
      node.consequent = parseCompIter(expr, false);
      return finishNode(node, "IfStatement");
    } else return dummyIdent();
  }

  // Parse class

  function parseClass(ctorNode) {
    // Container for class constructor and prototype functions
    var container = startNodeFrom(ctorNode);
    container.body = [];

    // Parse class signature
    ctorNode.id = parseIdent();
    ctorNode.params = [];
    var classParams = [];
    if (eat(tt.parenL)) {
      var first = true;
      while (!eat(tt.parenR) && token.type !== tt.eof) {
        if (!first) expect(tt.comma); else first = false;
        classParams.push(parseIdent());
      }
    }
    expect(tt.colon);

    // Start new namespace for class body
    scope.startClass(ctorNode.id.name);

    // Save a reference for source ranges
    var classBodyRefNode = finishNode(startNode());

    // Parse class body
    var classBlock = parseSuite();

    // Generate additional AST to implement class
    var classStmt = nc.createClass(container, ctorNode, classParams, classBodyRefNode, classBlock);

    scope.end();

    return classStmt;
  }

  // Parse dictionary
  // Custom dict object used to simulate native Python dict
  // E.g. "{'k1':'v1', 'k2':'v2'}" becomes "new __pythonRuntime.objects.dict(['k1', 'v1'], ['k2', 'v2']);"

  function parseDict(tokClose) {
    var node = startNode(), first = true, key, value;
    node.arguments = [];
    next();
    while (!eat(tokClose) && !eat(tt.newline) && token.type !== tt.eof) {
      if (!first) {
        expect(tt.comma);
      } else first = false;

      if (tokClose === tt.braceR) {
        key = parsePropertyName();
        expect(tt.colon);
        value = parseExprOps(false);
      } else if (tokClose === tt.parenR) {
        var keyId = parseIdent(true);
        key = startNodeFrom(keyId);
        key.value = keyId.name;
        finishNode(key, "Literal");
        expect(tt.eq);
        value = parseExprOps(false);
      }
      node.arguments.push(nc.createNodeSpan(key, value, "ArrayExpression", { elements: [key, value] }));
    }
    finishNode(node, "NewExpression");

    var runtimeId = nc.createNodeSpan(node, node, "Identifier", { name: options.runtimeParamName });
    var objectsId = nc.createNodeSpan(node, node, "Identifier", { name: "objects" });
    var runtimeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeId, property: objectsId, computed: false });
    var listId = nc.createNodeSpan(node, node, "Identifier", { name: "dict" });
    node.callee = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeMember, property: listId, computed: false });

    return node;
  }

  function parsePropertyName() {
    if (token.type === tt.num || token.type === tt.string) return parseExprAtom();
    if (token.type === tt.name || token.type.keyword) return parseIdent();
  }

  function parseIdent() {
    var node = startNode();
    node.name = token.type === tt.name ? token.value : token.type.keyword;
    if (!node.name) node = dummyIdent();
    next();
    return finishNode(node, "Identifier");
  }

  function parseFunction(node) {
    var suffix = newAstIdCount++;
    node.id = parseIdent();
    node.params = [];

    // Parse parameters

    var formals = [];     // In order, maybe with default value
    var argsId = null;    // *args
    var kwargsId = null;  // **kwargs
    var first = true;
    expect(tt.parenL);
    while (!eat(tt.parenR) && token.type !== tt.eof) {
      if (!first) expect(tt.comma); else first = false;
      if (token.value === '*') {
        next(); argsId = parseIdent();
      } else if (token.value === '**') {
        next(); kwargsId = parseIdent();
      } else {
        var paramId = parseIdent();
        if (eat(tt.eq))
          formals.push({ id: paramId, expr: parseExprOps(false) });
        else
          formals.push({ id: paramId, expr: null });
      }
    }
    expect(tt.colon);

    scope.startFn(node.id.name);

    // If class method, remove class instance var from params and save for 'this' replacement
    if (scope.isParentClass()) {
      var selfId = formals.shift();
      scope.setThisReplace(selfId.id.name);
    }

    var body = parseSuite();
    node.body = nc.createNodeSpan(body, body, "BlockStatement", { body: [] });

    // Add runtime parameter processing

    if (formals.length > 0 || argsId || kwargsId) {
      node.body.body.push(nc.createVarDeclFromId(node.id,
        nc.createNodeSpan(node.id, node.id, "Identifier", { name: '__formalsIndex' + suffix }),
        nc.createNodeSpan(node.id, node.id, "Literal", { value: 0 })));
      node.body.body.push(nc.createVarDeclFromId(node.id,
        nc.createNodeSpan(node.id, node.id, "Identifier", { name: '__args' + suffix }),
        nc.createNodeSpan(node.id, node.id, "Identifier", { name: 'arguments' })));
    }
    if (formals.length > 0) {
      // node.body.body.push(nc.createNodeGetParamFn(node.id, suffix));
      for (var i = 0; i < formals.length; i++) {
        var __getParamCall = nc.createNodeSpan(formals[i].id, formals[i].id, "CallExpression", {
          callee: nc.createNodeSpan(formals[i].id, formals[i].id, "Identifier", { name: '__getParam' + suffix }),
          arguments: [nc.createNodeSpan(formals[i].id, formals[i].id, "Literal", { value: formals[i].id.name })]
        });
        if (formals[i].expr) __getParamCall.arguments.push(formals[i].expr);
        node.body.body.push(nc.createVarDeclFromId(formals[i].id, formals[i].id, __getParamCall));
      }
    }
    var refNode = argsId || kwargsId;
    if (refNode) {
      if (argsId) {
        var argsAssign = nc.createVarDeclFromId(argsId, argsId, nc.createNodeSpan(argsId, argsId, "ArrayExpression", { elements: [] }));
        node.body.body.push(argsAssign);
      }
      if (kwargsId) {
        var kwargsAssign = nc.createVarDeclFromId(kwargsId, kwargsId, nc.createNodeSpan(kwargsId, kwargsId, "ObjectExpression", { properties: [] }));
        node.body.body.push(kwargsAssign);
      }
      var argsIf = nc.createNodeSpan(refNode, refNode, "IfStatement", {
        test: nc.createNodeSpan(refNode, refNode, "Identifier", { name: '__params' + suffix }),
        consequent: nc.createNodeSpan(refNode, refNode, "BlockStatement", { body: [] })
      })
      if (argsId) {
        argsIf.consequent.body.push(nc.createNodeArgsWhileConsequent(argsId, suffix));
        argsIf.alternate = nc.createNodeArgsAlternate(argsId);
      }
      if (kwargsId) {
        argsIf.consequent.body.push(nc.createNodeSpan(kwargsId, kwargsId, "ExpressionStatement", {
          expression: nc.createNodeSpan(kwargsId, kwargsId, "AssignmentExpression", {
            operator: '=', left: kwargsId, right: nc.createNodeMembIds(kwargsId, '__params' + suffix, 'keywords'),
          })
        }));
      }
      node.body.body.push(argsIf);
    }
    node.body.body.push(nc.createNodeFnBodyIife(body));

    // If class method, replace with prototype function literals
    var retNode;
    if (scope.isParentClass()) {
      finishNode(node);
      var classId = nc.createNodeSpan(node, node, "Identifier", { name: scope.getParentClassName() });
      var prototypeId = nc.createNodeSpan(node, node, "Identifier", { name: "prototype" });
      var functionId = node.id;
      var prototypeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: classId, property: prototypeId, computed: false });
      var functionMember = nc.createNodeSpan(node, node, "MemberExpression", { object: prototypeMember, property: functionId, computed: false });
      var functionExpr = nc.createNodeSpan(node, node, "FunctionExpression", { body: node.body, params: node.params });
      var assignExpr = nc.createNodeSpan(node, node, "AssignmentExpression", { left: functionMember, operator: "=", right: functionExpr });
      retNode = nc.createNodeSpan(node, node, "ExpressionStatement", { expression: assignExpr });
    } else retNode = finishNode(node, "FunctionDeclaration");

    scope.end();

    return retNode;
  }

  function parseExprList(close) {
    var elts = [];
    while (!eat(close) && !eat(tt.newline) && token.type !== tt.eof) {
      var elt = parseExprOps(false);
      if (isDummy(elt)) {
        next();
      } else {
        elts.push(elt);
      }
      while (eat(tt.comma)) {}
    }
    return elts;
  }

  function parseParamsList() {
    var elts = [], first = true;
    while (!eat(tt.parenR) && !eat(tt.newline) && token.type !== tt.eof) {
      if (!first) expect(tt.comma);
      else first = false;
      var expr = parseExprOps(false);
      if (eat(tt.eq)) {
        var right = parseExprOps(false);
        var kwId = nc.createNodeSpan(expr, right, "Identifier", { name: "__kwp" });
        var kwLit = nc.createNodeSpan(expr, right, "Literal", { value: true });
        var left = nc.createNodeSpan(expr, right, "ObjectExpression", { properties: [] });
        left.properties.push({ type: "Property", key: expr, value: right, kind: "init" });
        left.properties.push({ type: "Property", key: kwId, value: kwLit, kind: "init" });
        expr = left;
      }
      elts.push(expr);
    }
    return elts;
  }

  function parseTuple(noIn, expr) {
    var node = expr ? startNodeFrom(expr) : startNode();
    node.arguments = expr ? [expr] : [];

    // Tuple with single element has special trailing comma: t = 'hi',
    // Look ahead and eat comma in this scenario
    if (token.type === tt.comma) {
      var pos = token.start + 1;
      while (isSpace(input.charCodeAt(pos))) ++pos;
      if (pos >= inputLen || input[pos] === ';' || input[pos] === ')' || isNewline(input.charCodeAt(pos)))
        eat(tt.comma);
    }

    while (eat(tt.comma)) {
      node.arguments.push(parseExprOps(noIn));
    }
    finishNode(node, "NewExpression");

    var runtimeId = nc.createNodeSpan(node, node, "Identifier", { name: options.runtimeParamName });
    var objectsId = nc.createNodeSpan(node, node, "Identifier", { name: "objects" });
    var runtimeMember = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeId, property: objectsId, computed: false });
    var listId = nc.createNodeSpan(node, node, "Identifier", { name: "tuple" });
    node.callee = nc.createNodeSpan(node, node, "MemberExpression", { object: runtimeMember, property: listId, computed: false });

    return node;
  }
});
