var _JUPYTERLAB;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "webpack/container/entry/xircuits":
/*!***********************!*\
  !*** container entry ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var moduleMap = {
	"./index": () => {
		return Promise.all([__webpack_require__.e("vendors-node_modules_lodash_lodash_js"), __webpack_require__.e("vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_css-loader_dist_runtime_cssW-72eba1"), __webpack_require__.e("vendors-node_modules_krc-pagination_styles_css-node_modules_rc-dialog_assets_bootstrap_css-no-49e9b7"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30"), __webpack_require__.e("lib_index_js")]).then(() => (() => ((__webpack_require__(/*! ./lib/index.js */ "./lib/index.js")))));
	},
	"./extension": () => {
		return Promise.all([__webpack_require__.e("vendors-node_modules_lodash_lodash_js"), __webpack_require__.e("vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_css-loader_dist_runtime_cssW-72eba1"), __webpack_require__.e("vendors-node_modules_krc-pagination_styles_css-node_modules_rc-dialog_assets_bootstrap_css-no-49e9b7"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30"), __webpack_require__.e("lib_index_js")]).then(() => (() => ((__webpack_require__(/*! ./lib/index.js */ "./lib/index.js")))));
	},
	"./style": () => {
		return Promise.all([__webpack_require__.e("vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_css-loader_dist_runtime_cssW-72eba1"), __webpack_require__.e("style_index_js")]).then(() => (() => ((__webpack_require__(/*! ./style/index.js */ "./style/index.js")))));
	}
};
var get = (module, getScope) => {
	__webpack_require__.R = getScope;
	getScope = (
		__webpack_require__.o(moduleMap, module)
			? moduleMap[module]()
			: Promise.resolve().then(() => {
				throw new Error('Module "' + module + '" does not exist in container.');
			})
	);
	__webpack_require__.R = undefined;
	return getScope;
};
var init = (shareScope, initScope) => {
	if (!__webpack_require__.S) return;
	var name = "default"
	var oldScope = __webpack_require__.S[name];
	if(oldScope && oldScope !== shareScope) throw new Error("Container initialization failed as it has already been initialized with a different share scope");
	__webpack_require__.S[name] = shareScope;
	return __webpack_require__.I(name, initScope);
};

// This exports getters to disallow modifications
__webpack_require__.d(exports, {
	get: () => (get),
	init: () => (init)
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "." + {"vendors-node_modules_lodash_lodash_js":"c665123921a81a39dd50","vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_css-loader_dist_runtime_cssW-72eba1":"874cd565273391e4aa19","vendors-node_modules_krc-pagination_styles_css-node_modules_rc-dialog_assets_bootstrap_css-no-49e9b7":"6237bb7955064b6be43a","webpack_sharing_consume_default_react":"f1fb04fd62b3f8f8252f","webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30":"c638ad11c8a027ab64dc","lib_index_js":"26dcae8a8ee9d7d24d36","style_index_js":"28f401ec3ae15e8dacf0","vendors-node_modules_emotion_react_dist_emotion-react_browser_esm_js":"762d4ff54c0c44274c20","node_modules_babel_runtime_helpers_esm_extends_js-node_modules_emotion_hash_dist_hash_browser-9b455e0":"7640cde78e0e6d194007","vendors-node_modules_emotion_styled_dist_emotion-styled_browser_esm_js":"7460bcbc9e0ed6731a65","webpack_sharing_consume_default_emotion_react_emotion_react-_8f22":"2532571945c143a4fd75","webpack_sharing_consume_default_emotion_react_emotion_react-_1cec":"42a10740f3031f0ec641","vendors-node_modules_projectstorm_geometry_dist_index_js":"c285b23fcab6eabdfdb1","vendors-node_modules_projectstorm_react-canvas-core_dist_index_js":"fcdf8b87bd820419b487","webpack_sharing_consume_default_emotion_styled_emotion_styled":"c31a1efdeaeffdfd56e8","vendors-node_modules_projectstorm_react-diagrams-core_dist_index_js":"8e19dfeb0de76cfe2c7d","vendors-node_modules_projectstorm_react-diagrams-defaults_dist_index_js":"2858db4713d5424ddc97","webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4cd6":"0d77f52057fa78293be3","webpack_sharing_consume_default_emotion_react_emotion_react-webpack_sharing_consume_default_e-2f734f":"9563dc6d7211dc99b182","vendors-node_modules_projectstorm_react-diagrams-routing_dist_index_js":"4918ae44d3ce332c2c79","webpack_sharing_consume_default_projectstorm_react-diagrams-defaults_projectstorm_react-diagr-28113e":"2060371fe5102686c3c9","webpack_sharing_consume_default_dagre_dagre-webpack_sharing_consume_default_pathfinding_pathfinding":"852c66b9d6def7f7f01e","webpack_sharing_consume_default_projectstorm_react-diagrams-routing_projectstorm_react-diagra-ba726c":"05faed0a2b3f78808c42","node_modules_projectstorm_react-diagrams_dist_index_js-_5db60":"32d17b74b9ebd6af963e","vendors-node_modules_dagre_index_js":"686bd37127faa28b0940","node_modules_krc-pagination_lib_index_js-_31c90":"95f5ce6c38563d4fbeed","vendors-node_modules_pathfinding_index_js":"d1a4dc01f0a8c15af0bd","vendors-node_modules_react-accessible-accordion_dist_es_index_js":"ac278cac02c0b71b6e09","vendors-node_modules_react-image-gallery_build_image-gallery_js":"2ba429dc5e13fd1d59aa","vendors-node_modules_prop-types_index_js":"4d0484a6b1db7d2d3523","vendors-node_modules_react-numeric-input_index_js":"11b46d1c6c815325b495","vendors-node_modules_react-portal-tooltip_lib_index_js":"10b53ba7cf699da5d4e2","webpack_sharing_consume_default_react-dom":"671382a00e45b65a6bb6","vendors-node_modules_react-switch_index_js":"7e36cca83b07673415b7","node_modules_react-textarea-autosize_dist_react-textarea-autosize_browser_esm_js-_6e100":"afc845bf115c128d03d1","vendors-node_modules_react-toggle_dist_component_index_js":"69537a5502749b82f607","node_modules_projectstorm_react-diagrams_dist_index_js-_5db61":"a336794cdea78eb5883a","node_modules_krc-pagination_lib_index_js-_31c91":"3d183a93174f197a7643","node_modules_react-textarea-autosize_dist_react-textarea-autosize_browser_esm_js-_6e101":"c0eeda060982bc0e79bb","node_modules_babel_runtime_helpers_esm_extends_js-node_modules_emotion_hash_dist_hash_browser-9b455e1":"0018bf2b61e10a007763"}[chunkId] + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "xircuits:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			;
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/sharing */
/******/ 	(() => {
/******/ 		__webpack_require__.S = {};
/******/ 		var initPromises = {};
/******/ 		var initTokens = {};
/******/ 		__webpack_require__.I = (name, initScope) => {
/******/ 			if(!initScope) initScope = [];
/******/ 			// handling circular init calls
/******/ 			var initToken = initTokens[name];
/******/ 			if(!initToken) initToken = initTokens[name] = {};
/******/ 			if(initScope.indexOf(initToken) >= 0) return;
/******/ 			initScope.push(initToken);
/******/ 			// only runs once
/******/ 			if(initPromises[name]) return initPromises[name];
/******/ 			// creates a new share scope if needed
/******/ 			if(!__webpack_require__.o(__webpack_require__.S, name)) __webpack_require__.S[name] = {};
/******/ 			// runs all init snippets from all modules reachable
/******/ 			var scope = __webpack_require__.S[name];
/******/ 			var warn = (msg) => (typeof console !== "undefined" && console.warn && console.warn(msg));
/******/ 			var uniqueName = "xircuits";
/******/ 			var register = (name, version, factory, eager) => {
/******/ 				var versions = scope[name] = scope[name] || {};
/******/ 				var activeVersion = versions[version];
/******/ 				if(!activeVersion || (!activeVersion.loaded && (!eager != !activeVersion.eager ? eager : uniqueName > activeVersion.from))) versions[version] = { get: factory, from: uniqueName, eager: !!eager };
/******/ 			};
/******/ 			var initExternal = (id) => {
/******/ 				var handleError = (err) => (warn("Initialization of sharing external failed: " + err));
/******/ 				try {
/******/ 					var module = __webpack_require__(id);
/******/ 					if(!module) return;
/******/ 					var initFn = (module) => (module && module.init && module.init(__webpack_require__.S[name], initScope))
/******/ 					if(module.then) return promises.push(module.then(initFn, handleError));
/******/ 					var initResult = initFn(module);
/******/ 					if(initResult && initResult.then) return promises.push(initResult['catch'](handleError));
/******/ 				} catch(err) { handleError(err); }
/******/ 			}
/******/ 			var promises = [];
/******/ 			switch(name) {
/******/ 				case "default": {
/******/ 					register("@emotion/react", "11.7.1", () => (Promise.all([__webpack_require__.e("vendors-node_modules_emotion_react_dist_emotion-react_browser_esm_js"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("node_modules_babel_runtime_helpers_esm_extends_js-node_modules_emotion_hash_dist_hash_browser-9b455e0")]).then(() => (() => (__webpack_require__(/*! ./node_modules/@emotion/react/dist/emotion-react.browser.esm.js */ "./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"))))));
/******/ 					register("@emotion/styled", "11.6.0", () => (Promise.all([__webpack_require__.e("vendors-node_modules_emotion_styled_dist_emotion-styled_browser_esm_js"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_8f22"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_1cec")]).then(() => (() => (__webpack_require__(/*! ./node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js */ "./node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js"))))));
/******/ 					register("@projectstorm/react-canvas-core", "6.6.1", () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_geometry_dist_index_js"), __webpack_require__.e("vendors-node_modules_lodash_lodash_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-canvas-core_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_emotion_styled_emotion_styled"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_8f22")]).then(() => (() => (__webpack_require__(/*! ./node_modules/@projectstorm/react-canvas-core/dist/index.js */ "./node_modules/@projectstorm/react-canvas-core/dist/index.js"))))));
/******/ 					register("@projectstorm/react-diagrams-defaults", "6.6.1", () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_geometry_dist_index_js"), __webpack_require__.e("vendors-node_modules_lodash_lodash_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-core_dist_index_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-defaults_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_emotion_styled_emotion_styled"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4cd6"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-webpack_sharing_consume_default_e-2f734f")]).then(() => (() => (__webpack_require__(/*! ./node_modules/@projectstorm/react-diagrams-defaults/dist/index.js */ "./node_modules/@projectstorm/react-diagrams-defaults/dist/index.js"))))));
/******/ 					register("@projectstorm/react-diagrams-routing", "6.6.1", () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_geometry_dist_index_js"), __webpack_require__.e("vendors-node_modules_lodash_lodash_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-core_dist_index_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-routing_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_emotion_styled_emotion_styled"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4cd6"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-diagrams-defaults_projectstorm_react-diagr-28113e"), __webpack_require__.e("webpack_sharing_consume_default_dagre_dagre-webpack_sharing_consume_default_pathfinding_pathfinding")]).then(() => (() => (__webpack_require__(/*! ./node_modules/@projectstorm/react-diagrams-routing/dist/index.js */ "./node_modules/@projectstorm/react-diagrams-routing/dist/index.js"))))));
/******/ 					register("@projectstorm/react-diagrams", "6.6.1", () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_geometry_dist_index_js"), __webpack_require__.e("vendors-node_modules_lodash_lodash_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-core_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_emotion_styled_emotion_styled"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4cd6"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-diagrams-defaults_projectstorm_react-diagr-28113e"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-diagrams-routing_projectstorm_react-diagra-ba726c"), __webpack_require__.e("node_modules_projectstorm_react-diagrams_dist_index_js-_5db60")]).then(() => (() => (__webpack_require__(/*! ./node_modules/@projectstorm/react-diagrams/dist/index.js */ "./node_modules/@projectstorm/react-diagrams/dist/index.js"))))));
/******/ 					register("dagre", "0.8.5", () => (__webpack_require__.e("vendors-node_modules_dagre_index_js").then(() => (() => (__webpack_require__(/*! ./node_modules/dagre/index.js */ "./node_modules/dagre/index.js"))))));
/******/ 					register("krc-pagination", "1.0.1", () => (Promise.all([__webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("node_modules_krc-pagination_lib_index_js-_31c90")]).then(() => (() => (__webpack_require__(/*! ./node_modules/krc-pagination/lib/index.js */ "./node_modules/krc-pagination/lib/index.js"))))));
/******/ 					register("pathfinding", "0.4.18", () => (__webpack_require__.e("vendors-node_modules_pathfinding_index_js").then(() => (() => (__webpack_require__(/*! ./node_modules/pathfinding/index.js */ "./node_modules/pathfinding/index.js"))))));
/******/ 					register("react-accessible-accordion", "4.0.0", () => (Promise.all([__webpack_require__.e("vendors-node_modules_react-accessible-accordion_dist_es_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react")]).then(() => (() => (__webpack_require__(/*! ./node_modules/react-accessible-accordion/dist/es/index.js */ "./node_modules/react-accessible-accordion/dist/es/index.js"))))));
/******/ 					register("react-image-gallery", "1.2.7", () => (Promise.all([__webpack_require__.e("vendors-node_modules_react-image-gallery_build_image-gallery_js"), __webpack_require__.e("webpack_sharing_consume_default_react")]).then(() => (() => (__webpack_require__(/*! ./node_modules/react-image-gallery/build/image-gallery.js */ "./node_modules/react-image-gallery/build/image-gallery.js"))))));
/******/ 					register("react-numeric-input", "2.2.3", () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-numeric-input_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react")]).then(() => (() => (__webpack_require__(/*! ./node_modules/react-numeric-input/index.js */ "./node_modules/react-numeric-input/index.js"))))));
/******/ 					register("react-portal-tooltip", "2.4.7", () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-portal-tooltip_lib_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_react-dom")]).then(() => (() => (__webpack_require__(/*! ./node_modules/react-portal-tooltip/lib/index.js */ "./node_modules/react-portal-tooltip/lib/index.js"))))));
/******/ 					register("react-switch", "6.0.0", () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-switch_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react")]).then(() => (() => (__webpack_require__(/*! ./node_modules/react-switch/index.js */ "./node_modules/react-switch/index.js"))))));
/******/ 					register("react-textarea-autosize", "8.3.3", () => (Promise.all([__webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("node_modules_react-textarea-autosize_dist_react-textarea-autosize_browser_esm_js-_6e100")]).then(() => (() => (__webpack_require__(/*! ./node_modules/react-textarea-autosize/dist/react-textarea-autosize.browser.esm.js */ "./node_modules/react-textarea-autosize/dist/react-textarea-autosize.browser.esm.js"))))));
/******/ 					register("react-toggle", "4.1.2", () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-toggle_dist_component_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react")]).then(() => (() => (__webpack_require__(/*! ./node_modules/react-toggle/dist/component/index.js */ "./node_modules/react-toggle/dist/component/index.js"))))));
/******/ 					register("xircuits", "1.2.0", () => (Promise.all([__webpack_require__.e("vendors-node_modules_lodash_lodash_js"), __webpack_require__.e("vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_css-loader_dist_runtime_cssW-72eba1"), __webpack_require__.e("vendors-node_modules_krc-pagination_styles_css-node_modules_rc-dialog_assets_bootstrap_css-no-49e9b7"), __webpack_require__.e("webpack_sharing_consume_default_react"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30"), __webpack_require__.e("lib_index_js")]).then(() => (() => (__webpack_require__(/*! ./lib/index.js */ "./lib/index.js"))))));
/******/ 				}
/******/ 				break;
/******/ 			}
/******/ 			if(!promises.length) return initPromises[name] = 1;
/******/ 			return initPromises[name] = Promise.all(promises).then(() => (initPromises[name] = 1));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/consumes */
/******/ 	(() => {
/******/ 		var parseVersion = (str) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			var p=p=>{return p.split(".").map((p=>{return+p==p?+p:p}))},n=/^([^-+]+)?(?:-([^+]+))?(?:\+(.+))?$/.exec(str),r=n[1]?p(n[1]):[];return n[2]&&(r.length++,r.push.apply(r,p(n[2]))),n[3]&&(r.push([]),r.push.apply(r,p(n[3]))),r;
/******/ 		}
/******/ 		var versionLt = (a, b) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			a=parseVersion(a),b=parseVersion(b);for(var r=0;;){if(r>=a.length)return r<b.length&&"u"!=(typeof b[r])[0];var e=a[r],n=(typeof e)[0];if(r>=b.length)return"u"==n;var t=b[r],f=(typeof t)[0];if(n!=f)return"o"==n&&"n"==f||("s"==f||"u"==n);if("o"!=n&&"u"!=n&&e!=t)return e<t;r++}
/******/ 		}
/******/ 		var rangeToString = (range) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			var r=range[0],n="";if(1===range.length)return"*";if(r+.5){n+=0==r?">=":-1==r?"<":1==r?"^":2==r?"~":r>0?"=":"!=";for(var e=1,a=1;a<range.length;a++){e--,n+="u"==(typeof(t=range[a]))[0]?"-":(e>0?".":"")+(e=2,t)}return n}var g=[];for(a=1;a<range.length;a++){var t=range[a];g.push(0===t?"not("+o()+")":1===t?"("+o()+" || "+o()+")":2===t?g.pop()+" "+g.pop():rangeToString(t))}return o();function o(){return g.pop().replace(/^\((.+)\)$/,"$1")}
/******/ 		}
/******/ 		var satisfy = (range, version) => {
/******/ 			// see webpack/lib/util/semver.js for original code
/******/ 			if(0 in range){version=parseVersion(version);var e=range[0],r=e<0;r&&(e=-e-1);for(var n=0,i=1,a=!0;;i++,n++){var f,s,g=i<range.length?(typeof range[i])[0]:"";if(n>=version.length||"o"==(s=(typeof(f=version[n]))[0]))return!a||("u"==g?i>e&&!r:""==g!=r);if("u"==s){if(!a||"u"!=g)return!1}else if(a)if(g==s)if(i<=e){if(f!=range[i])return!1}else{if(r?f>range[i]:f<range[i])return!1;f!=range[i]&&(a=!1)}else if("s"!=g&&"n"!=g){if(r||i<=e)return!1;a=!1,i--}else{if(i<=e||s<g!=r)return!1;a=!1}else"s"!=g&&"n"!=g&&(a=!1,i--)}}var t=[],o=t.pop.bind(t);for(n=1;n<range.length;n++){var u=range[n];t.push(1==u?o()|o():2==u?o()&o():u?satisfy(u,version):!o())}return!!o();
/******/ 		}
/******/ 		var ensureExistence = (scopeName, key) => {
/******/ 			var scope = __webpack_require__.S[scopeName];
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) throw new Error("Shared module " + key + " doesn't exist in shared scope " + scopeName);
/******/ 			return scope;
/******/ 		};
/******/ 		var findVersion = (scope, key) => {
/******/ 			var versions = scope[key];
/******/ 			var key = Object.keys(versions).reduce((a, b) => {
/******/ 				return !a || versionLt(a, b) ? b : a;
/******/ 			}, 0);
/******/ 			return key && versions[key]
/******/ 		};
/******/ 		var findSingletonVersionKey = (scope, key) => {
/******/ 			var versions = scope[key];
/******/ 			return Object.keys(versions).reduce((a, b) => {
/******/ 				return !a || (!versions[a].loaded && versionLt(a, b)) ? b : a;
/******/ 			}, 0);
/******/ 		};
/******/ 		var getInvalidSingletonVersionMessage = (scope, key, version, requiredVersion) => {
/******/ 			return "Unsatisfied version " + version + " from " + (version && scope[key][version].from) + " of shared singleton module " + key + " (required " + rangeToString(requiredVersion) + ")"
/******/ 		};
/******/ 		var getSingleton = (scope, scopeName, key, requiredVersion) => {
/******/ 			var version = findSingletonVersionKey(scope, key);
/******/ 			return get(scope[key][version]);
/******/ 		};
/******/ 		var getSingletonVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			var version = findSingletonVersionKey(scope, key);
/******/ 			if (!satisfy(requiredVersion, version)) typeof console !== "undefined" && console.warn && console.warn(getInvalidSingletonVersionMessage(scope, key, version, requiredVersion));
/******/ 			return get(scope[key][version]);
/******/ 		};
/******/ 		var getStrictSingletonVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			var version = findSingletonVersionKey(scope, key);
/******/ 			if (!satisfy(requiredVersion, version)) throw new Error(getInvalidSingletonVersionMessage(scope, key, version, requiredVersion));
/******/ 			return get(scope[key][version]);
/******/ 		};
/******/ 		var findValidVersion = (scope, key, requiredVersion) => {
/******/ 			var versions = scope[key];
/******/ 			var key = Object.keys(versions).reduce((a, b) => {
/******/ 				if (!satisfy(requiredVersion, b)) return a;
/******/ 				return !a || versionLt(a, b) ? b : a;
/******/ 			}, 0);
/******/ 			return key && versions[key]
/******/ 		};
/******/ 		var getInvalidVersionMessage = (scope, scopeName, key, requiredVersion) => {
/******/ 			var versions = scope[key];
/******/ 			return "No satisfying version (" + rangeToString(requiredVersion) + ") of shared module " + key + " found in shared scope " + scopeName + ".\n" +
/******/ 				"Available versions: " + Object.keys(versions).map((key) => {
/******/ 				return key + " from " + versions[key].from;
/******/ 			}).join(", ");
/******/ 		};
/******/ 		var getValidVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			var entry = findValidVersion(scope, key, requiredVersion);
/******/ 			if(entry) return get(entry);
/******/ 			throw new Error(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
/******/ 		};
/******/ 		var warnInvalidVersion = (scope, scopeName, key, requiredVersion) => {
/******/ 			typeof console !== "undefined" && console.warn && console.warn(getInvalidVersionMessage(scope, scopeName, key, requiredVersion));
/******/ 		};
/******/ 		var get = (entry) => {
/******/ 			entry.loaded = 1;
/******/ 			return entry.get()
/******/ 		};
/******/ 		var init = (fn) => (function(scopeName, a, b, c) {
/******/ 			var promise = __webpack_require__.I(scopeName);
/******/ 			if (promise && promise.then) return promise.then(fn.bind(fn, scopeName, __webpack_require__.S[scopeName], a, b, c));
/******/ 			return fn(scopeName, __webpack_require__.S[scopeName], a, b, c);
/******/ 		});
/******/ 		
/******/ 		var load = /*#__PURE__*/ init((scopeName, scope, key) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return get(findVersion(scope, key));
/******/ 		});
/******/ 		var loadFallback = /*#__PURE__*/ init((scopeName, scope, key, fallback) => {
/******/ 			return scope && __webpack_require__.o(scope, key) ? get(findVersion(scope, key)) : fallback();
/******/ 		});
/******/ 		var loadVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
/******/ 		});
/******/ 		var loadSingleton = /*#__PURE__*/ init((scopeName, scope, key) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return getSingleton(scope, scopeName, key);
/******/ 		});
/******/ 		var loadSingletonVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return getSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadStrictVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return getValidVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadStrictSingletonVersionCheck = /*#__PURE__*/ init((scopeName, scope, key, version) => {
/******/ 			ensureExistence(scopeName, key);
/******/ 			return getStrictSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) return fallback();
/******/ 			return get(findValidVersion(scope, key, version) || warnInvalidVersion(scope, scopeName, key, version) || findVersion(scope, key));
/******/ 		});
/******/ 		var loadSingletonFallback = /*#__PURE__*/ init((scopeName, scope, key, fallback) => {
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) return fallback();
/******/ 			return getSingleton(scope, scopeName, key);
/******/ 		});
/******/ 		var loadSingletonVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) return fallback();
/******/ 			return getSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var loadStrictVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			var entry = scope && __webpack_require__.o(scope, key) && findValidVersion(scope, key, version);
/******/ 			return entry ? get(entry) : fallback();
/******/ 		});
/******/ 		var loadStrictSingletonVersionCheckFallback = /*#__PURE__*/ init((scopeName, scope, key, version, fallback) => {
/******/ 			if(!scope || !__webpack_require__.o(scope, key)) return fallback();
/******/ 			return getStrictSingletonVersion(scope, scopeName, key, version);
/******/ 		});
/******/ 		var installedModules = {};
/******/ 		var moduleToHandlerMapping = {
/******/ 			"webpack/sharing/consume/default/react": () => (loadSingletonVersionCheck("default", "react", [1,17,0,1])),
/******/ 			"webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30": () => (loadStrictVersionCheckFallback("default", "@projectstorm/react-canvas-core", [1,6,6,1], () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_geometry_dist_index_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-canvas-core_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_emotion_styled_emotion_styled"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_8f22")]).then(() => (() => (__webpack_require__(/*! @projectstorm/react-canvas-core */ "./node_modules/@projectstorm/react-canvas-core/dist/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/application": () => (loadSingletonVersionCheck("default", "@jupyterlab/application", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/filebrowser": () => (loadSingletonVersionCheck("default", "@jupyterlab/filebrowser", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/apputils": () => (loadSingletonVersionCheck("default", "@jupyterlab/apputils", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/launcher": () => (loadSingletonVersionCheck("default", "@jupyterlab/launcher", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/docmanager": () => (loadSingletonVersionCheck("default", "@jupyterlab/docmanager", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/translation": () => (loadSingletonVersionCheck("default", "@jupyterlab/translation", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/rendermime": () => (loadSingletonVersionCheck("default", "@jupyterlab/rendermime", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/ui-components": () => (loadSingletonVersionCheck("default", "@jupyterlab/ui-components", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@lumino/coreutils": () => (loadSingletonVersionCheck("default", "@lumino/coreutils", [1,1,5,3])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/docregistry": () => (loadVersionCheck("default", "@jupyterlab/docregistry", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@lumino/signaling": () => (loadSingletonVersionCheck("default", "@lumino/signaling", [1,1,4,3])),
/******/ 			"webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams": () => (loadStrictVersionCheckFallback("default", "@projectstorm/react-diagrams", [1,6,6,1], () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_geometry_dist_index_js"), __webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-core_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_emotion_styled_emotion_styled"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4cd6"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-diagrams-defaults_projectstorm_react-diagr-28113e"), __webpack_require__.e("webpack_sharing_consume_default_projectstorm_react-diagrams-routing_projectstorm_react-diagra-ba726c"), __webpack_require__.e("node_modules_projectstorm_react-diagrams_dist_index_js-_5db61")]).then(() => (() => (__webpack_require__(/*! @projectstorm/react-diagrams */ "./node_modules/@projectstorm/react-diagrams/dist/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715": () => (loadStrictVersionCheckFallback("default", "@emotion/styled", [1,11,3,0], () => (Promise.all([__webpack_require__.e("vendors-node_modules_emotion_styled_dist_emotion-styled_browser_esm_js"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_8f22"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_1cec")]).then(() => (() => (__webpack_require__(/*! @emotion/styled */ "./node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js"))))))),
/******/ 			"webpack/sharing/consume/default/react-image-gallery/react-image-gallery": () => (loadStrictVersionCheckFallback("default", "react-image-gallery", [1,1,2,7], () => (__webpack_require__.e("vendors-node_modules_react-image-gallery_build_image-gallery_js").then(() => (() => (__webpack_require__(/*! react-image-gallery */ "./node_modules/react-image-gallery/build/image-gallery.js"))))))),
/******/ 			"webpack/sharing/consume/default/react-portal-tooltip/react-portal-tooltip": () => (loadStrictVersionCheckFallback("default", "react-portal-tooltip", [1,2,4,7], () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-portal-tooltip_lib_index_js"), __webpack_require__.e("webpack_sharing_consume_default_react-dom")]).then(() => (() => (__webpack_require__(/*! react-portal-tooltip */ "./node_modules/react-portal-tooltip/lib/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/krc-pagination/krc-pagination": () => (loadStrictVersionCheckFallback("default", "krc-pagination", [1,1,0,1], () => (__webpack_require__.e("node_modules_krc-pagination_lib_index_js-_31c91").then(() => (() => (__webpack_require__(/*! krc-pagination */ "./node_modules/krc-pagination/lib/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/react-toggle/react-toggle": () => (loadStrictVersionCheckFallback("default", "react-toggle", [1,4,1,2], () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-toggle_dist_component_index_js")]).then(() => (() => (__webpack_require__(/*! react-toggle */ "./node_modules/react-toggle/dist/component/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/logconsole": () => (loadSingletonVersionCheck("default", "@jupyterlab/logconsole", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/coreutils": () => (loadSingletonVersionCheck("default", "@jupyterlab/coreutils", [1,5,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/services": () => (loadSingletonVersionCheck("default", "@jupyterlab/services", [1,6,1,9])),
/******/ 			"webpack/sharing/consume/default/@lumino/messaging": () => (loadSingletonVersionCheck("default", "@lumino/messaging", [1,1,4,3])),
/******/ 			"webpack/sharing/consume/default/@lumino/widgets": () => (loadSingletonVersionCheck("default", "@lumino/widgets", [1,1,19,0])),
/******/ 			"webpack/sharing/consume/default/react-numeric-input/react-numeric-input": () => (loadStrictVersionCheckFallback("default", "react-numeric-input", [1,2,2,3], () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-numeric-input_index_js")]).then(() => (() => (__webpack_require__(/*! react-numeric-input */ "./node_modules/react-numeric-input/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/react-textarea-autosize/react-textarea-autosize": () => (loadStrictVersionCheckFallback("default", "react-textarea-autosize", [1,8,3,3], () => (__webpack_require__.e("node_modules_react-textarea-autosize_dist_react-textarea-autosize_browser_esm_js-_6e101").then(() => (() => (__webpack_require__(/*! react-textarea-autosize */ "./node_modules/react-textarea-autosize/dist/react-textarea-autosize.browser.esm.js"))))))),
/******/ 			"webpack/sharing/consume/default/react-switch/react-switch": () => (loadStrictVersionCheckFallback("default", "react-switch", [1,6,0,0], () => (Promise.all([__webpack_require__.e("vendors-node_modules_prop-types_index_js"), __webpack_require__.e("vendors-node_modules_react-switch_index_js")]).then(() => (() => (__webpack_require__(/*! react-switch */ "./node_modules/react-switch/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/react-accessible-accordion/react-accessible-accordion": () => (loadStrictVersionCheckFallback("default", "react-accessible-accordion", [1,4,0,0], () => (__webpack_require__.e("vendors-node_modules_react-accessible-accordion_dist_es_index_js").then(() => (() => (__webpack_require__(/*! react-accessible-accordion */ "./node_modules/react-accessible-accordion/dist/es/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/debugger": () => (loadSingletonVersionCheck("default", "@jupyterlab/debugger", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@jupyterlab/outputarea": () => (loadVersionCheck("default", "@jupyterlab/outputarea", [1,3,1,9])),
/******/ 			"webpack/sharing/consume/default/@emotion/react/@emotion/react?8f22": () => (loadFallback("default", "@emotion/react", () => (Promise.all([__webpack_require__.e("vendors-node_modules_emotion_react_dist_emotion-react_browser_esm_js"), __webpack_require__.e("node_modules_babel_runtime_helpers_esm_extends_js-node_modules_emotion_hash_dist_hash_browser-9b455e1")]).then(() => (() => (__webpack_require__(/*! @emotion/react */ "./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"))))))),
/******/ 			"webpack/sharing/consume/default/@emotion/react/@emotion/react?1cec": () => (loadStrictVersionCheckFallback("default", "@emotion/react", [1,11,0,0,,"rc",0], () => (__webpack_require__.e("vendors-node_modules_emotion_react_dist_emotion-react_browser_esm_js").then(() => (() => (__webpack_require__(/*! @emotion/react */ "./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"))))))),
/******/ 			"webpack/sharing/consume/default/@emotion/styled/@emotion/styled?ffb9": () => (loadFallback("default", "@emotion/styled", () => (Promise.all([__webpack_require__.e("vendors-node_modules_emotion_styled_dist_emotion-styled_browser_esm_js"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_8f22"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_1cec")]).then(() => (() => (__webpack_require__(/*! @emotion/styled */ "./node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js"))))))),
/******/ 			"webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4cd6": () => (loadFallback("default", "@projectstorm/react-canvas-core", () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_react-canvas-core_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_8f22")]).then(() => (() => (__webpack_require__(/*! @projectstorm/react-canvas-core */ "./node_modules/@projectstorm/react-canvas-core/dist/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/@emotion/styled/@emotion/styled?c8aa": () => (loadStrictVersionCheckFallback("default", "@emotion/styled", [1,11], () => (Promise.all([__webpack_require__.e("vendors-node_modules_emotion_styled_dist_emotion-styled_browser_esm_js"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_8f22"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-_1cec")]).then(() => (() => (__webpack_require__(/*! @emotion/styled */ "./node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js"))))))),
/******/ 			"webpack/sharing/consume/default/@emotion/react/@emotion/react?6062": () => (loadStrictVersionCheckFallback("default", "@emotion/react", [1,11], () => (Promise.all([__webpack_require__.e("vendors-node_modules_emotion_react_dist_emotion-react_browser_esm_js"), __webpack_require__.e("node_modules_babel_runtime_helpers_esm_extends_js-node_modules_emotion_hash_dist_hash_browser-9b455e1")]).then(() => (() => (__webpack_require__(/*! @emotion/react */ "./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"))))))),
/******/ 			"webpack/sharing/consume/default/@projectstorm/react-diagrams-defaults/@projectstorm/react-diagrams-defaults": () => (loadStrictVersionCheckFallback("default", "@projectstorm/react-diagrams-defaults", [1,6,6,1], () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-defaults_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_emotion_react_emotion_react-webpack_sharing_consume_default_e-2f734f")]).then(() => (() => (__webpack_require__(/*! @projectstorm/react-diagrams-defaults */ "./node_modules/@projectstorm/react-diagrams-defaults/dist/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/pathfinding/pathfinding": () => (loadStrictVersionCheckFallback("default", "pathfinding", [2,0,4,18], () => (__webpack_require__.e("vendors-node_modules_pathfinding_index_js").then(() => (() => (__webpack_require__(/*! pathfinding */ "./node_modules/pathfinding/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/dagre/dagre": () => (loadStrictVersionCheckFallback("default", "dagre", [2,0,8,5], () => (__webpack_require__.e("vendors-node_modules_dagre_index_js").then(() => (() => (__webpack_require__(/*! dagre */ "./node_modules/dagre/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/@projectstorm/react-diagrams-routing/@projectstorm/react-diagrams-routing": () => (loadStrictVersionCheckFallback("default", "@projectstorm/react-diagrams-routing", [1,6,6,1], () => (Promise.all([__webpack_require__.e("vendors-node_modules_projectstorm_react-diagrams-routing_dist_index_js"), __webpack_require__.e("webpack_sharing_consume_default_dagre_dagre-webpack_sharing_consume_default_pathfinding_pathfinding")]).then(() => (() => (__webpack_require__(/*! @projectstorm/react-diagrams-routing */ "./node_modules/@projectstorm/react-diagrams-routing/dist/index.js"))))))),
/******/ 			"webpack/sharing/consume/default/react-dom": () => (loadSingletonVersionCheck("default", "react-dom", [1,17,0,1]))
/******/ 		};
/******/ 		// no consumes in initial chunks
/******/ 		var chunkMapping = {
/******/ 			"webpack_sharing_consume_default_react": [
/******/ 				"webpack/sharing/consume/default/react"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4a30": [
/******/ 				"webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4a30"
/******/ 			],
/******/ 			"lib_index_js": [
/******/ 				"webpack/sharing/consume/default/@jupyterlab/application",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/filebrowser",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/apputils",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/launcher",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/docmanager",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/translation",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/rendermime",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/ui-components",
/******/ 				"webpack/sharing/consume/default/@lumino/coreutils",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/docregistry",
/******/ 				"webpack/sharing/consume/default/@lumino/signaling",
/******/ 				"webpack/sharing/consume/default/@projectstorm/react-diagrams/@projectstorm/react-diagrams",
/******/ 				"webpack/sharing/consume/default/@emotion/styled/@emotion/styled?2715",
/******/ 				"webpack/sharing/consume/default/react-image-gallery/react-image-gallery",
/******/ 				"webpack/sharing/consume/default/react-portal-tooltip/react-portal-tooltip",
/******/ 				"webpack/sharing/consume/default/krc-pagination/krc-pagination",
/******/ 				"webpack/sharing/consume/default/react-toggle/react-toggle",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/logconsole",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/coreutils",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/services",
/******/ 				"webpack/sharing/consume/default/@lumino/messaging",
/******/ 				"webpack/sharing/consume/default/@lumino/widgets",
/******/ 				"webpack/sharing/consume/default/react-numeric-input/react-numeric-input",
/******/ 				"webpack/sharing/consume/default/react-textarea-autosize/react-textarea-autosize",
/******/ 				"webpack/sharing/consume/default/react-switch/react-switch",
/******/ 				"webpack/sharing/consume/default/react-accessible-accordion/react-accessible-accordion",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/debugger",
/******/ 				"webpack/sharing/consume/default/@jupyterlab/outputarea"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_emotion_react_emotion_react-_8f22": [
/******/ 				"webpack/sharing/consume/default/@emotion/react/@emotion/react?8f22"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_emotion_react_emotion_react-_1cec": [
/******/ 				"webpack/sharing/consume/default/@emotion/react/@emotion/react?1cec"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_emotion_styled_emotion_styled": [
/******/ 				"webpack/sharing/consume/default/@emotion/styled/@emotion/styled?ffb9"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_projectstorm_react-canvas-core_projectstorm_react-canvas-core-_4cd6": [
/******/ 				"webpack/sharing/consume/default/@projectstorm/react-canvas-core/@projectstorm/react-canvas-core?4cd6"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_emotion_react_emotion_react-webpack_sharing_consume_default_e-2f734f": [
/******/ 				"webpack/sharing/consume/default/@emotion/styled/@emotion/styled?c8aa",
/******/ 				"webpack/sharing/consume/default/@emotion/react/@emotion/react?6062"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_projectstorm_react-diagrams-defaults_projectstorm_react-diagr-28113e": [
/******/ 				"webpack/sharing/consume/default/@projectstorm/react-diagrams-defaults/@projectstorm/react-diagrams-defaults"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_dagre_dagre-webpack_sharing_consume_default_pathfinding_pathfinding": [
/******/ 				"webpack/sharing/consume/default/pathfinding/pathfinding",
/******/ 				"webpack/sharing/consume/default/dagre/dagre"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_projectstorm_react-diagrams-routing_projectstorm_react-diagra-ba726c": [
/******/ 				"webpack/sharing/consume/default/@projectstorm/react-diagrams-routing/@projectstorm/react-diagrams-routing"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_react-dom": [
/******/ 				"webpack/sharing/consume/default/react-dom"
/******/ 			]
/******/ 		};
/******/ 		__webpack_require__.f.consumes = (chunkId, promises) => {
/******/ 			if(__webpack_require__.o(chunkMapping, chunkId)) {
/******/ 				chunkMapping[chunkId].forEach((id) => {
/******/ 					if(__webpack_require__.o(installedModules, id)) return promises.push(installedModules[id]);
/******/ 					var onFactory = (factory) => {
/******/ 						installedModules[id] = 0;
/******/ 						__webpack_require__.m[id] = (module) => {
/******/ 							delete __webpack_require__.c[id];
/******/ 							module.exports = factory();
/******/ 						}
/******/ 					};
/******/ 					var onError = (error) => {
/******/ 						delete installedModules[id];
/******/ 						__webpack_require__.m[id] = (module) => {
/******/ 							delete __webpack_require__.c[id];
/******/ 							throw error;
/******/ 						}
/******/ 					};
/******/ 					try {
/******/ 						var promise = moduleToHandlerMapping[id]();
/******/ 						if(promise.then) {
/******/ 							promises.push(installedModules[id] = promise.then(onFactory)['catch'](onError));
/******/ 						} else onFactory(promise);
/******/ 					} catch(e) { onError(e); }
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"xircuits": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(!/^webpack_sharing_consume_default_(emotion_(react_emotion_react\-(_1cec|_8f22|webpack_sharing_consume_default_e\-2f734f)|styled_emotion_styled)|projectstorm_react\-(canvas\-core_projectstorm_react\-canvas\-core\-_4(a30|cd6)|diagrams\-(defaults_projectstorm_react\-diagr\-28113e|routing_projectstorm_react\-diagra\-ba726c))|react(|\-dom)|dagre_dagre\-webpack_sharing_consume_default_pathfinding_pathfinding)$/.test(chunkId)) {
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkxircuits"] = self["webpackChunkxircuits"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__("webpack/container/entry/xircuits");
/******/ 	(_JUPYTERLAB = typeof _JUPYTERLAB === "undefined" ? {} : _JUPYTERLAB).xircuits = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=remoteEntry.8d2bff91c3c35648ad4e.js.map