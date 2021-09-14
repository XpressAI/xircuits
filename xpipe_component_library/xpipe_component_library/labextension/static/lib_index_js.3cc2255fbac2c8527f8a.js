"use strict";
(self["webpackChunkxpipe_component_library"] = self["webpackChunkxpipe_component_library"] || []).push([["lib_index_js"],{

/***/ "./lib/TrayItemWidget.js":
/*!*******************************!*\
  !*** ./lib/TrayItemWidget.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tray": () => (/* binding */ Tray),
/* harmony export */   "Tray2": () => (/* binding */ Tray2),
/* harmony export */   "TrayItemWidget": () => (/* binding */ TrayItemWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);


const Tray = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	color: black;
	font-family: Helvetica, Arial;
	padding: 5px;
	width: auto;
	margin: 0px 10px;
	border: solid 1px ${(p) => p.color};
	border-radius: 5px;
	margin-bottom: 2px;
	cursor: pointer;
`;
const Tray2 = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	font-size: 13px;
	height: 35px;
	width: 120px;
	border-radius: 16px;
	border: none;
	box-shadow: 1px 1px 0px 2px rgba (0,0,0,0.3);
	background: rgb(192,255,0);
	cursor: pointer;
`;
class TrayItemWidget extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(Tray, { color: this.props.color || "white", draggable: true, onDragStart: (event) => {
                event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
                this.forceUpdate();
            }, className: "tray-item" }, this.props.name));
    }
}


/***/ }),

/***/ "./lib/TrayWidget.js":
/*!***************************!*\
  !*** ./lib/TrayWidget.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Tray": () => (/* binding */ Tray),
/* harmony export */   "TrayWidget": () => (/* binding */ TrayWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);


const Tray = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	min-width: 100px;
	background: rgb(255, 255, 255);
	flex-grow: 1;
	flex-shrink: 1;
	max-height: auto;
	overflow-y: auto;
`;
class TrayWidget extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
    render() {
        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Tray, null, this.props.children);
    }
}


/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/application */ "webpack/sharing/consume/default/@jupyterlab/application");
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _test__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./test */ "./lib/test.js");




/**
 * Initialization data for the xpipe_component_library extension.
 */
const xpipe_component_library = {
    id: 'xpipe_component_library:plugin',
    autoStart: true,
    requires: [_jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__.ILabShell, _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__.ILayoutRestorer],
    activate: (app, labShell, restorer) => {
        console.log('JupyterLab extension xpipe_component_library3 is activated!');
        const widget = _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.ReactWidget.create(react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_test__WEBPACK_IMPORTED_MODULE_3__["default"], null));
        widget.id = 'xpipe-component-library';
        restorer.add(widget, widget.id);
        labShell.add(widget, "left", { rank: 1000 });
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (xpipe_component_library);


/***/ }),

/***/ "./lib/test.js":
/*!*********************!*\
  !*** ./lib/test.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Body": () => (/* binding */ Body),
/* harmony export */   "Content": () => (/* binding */ Content),
/* harmony export */   "default": () => (/* binding */ DetailedAccordion)
/* harmony export */ });
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @material-ui/core */ "webpack/sharing/consume/default/@material-ui/core/@material-ui/core");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _material_ui_icons_ExpandMore__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @material-ui/icons/ExpandMore */ "./node_modules/@material-ui/icons/ExpandMore.js");
/* harmony import */ var _material_ui_core_Divider__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @material-ui/core/Divider */ "./node_modules/@material-ui/core/esm/Divider/Divider.js");
/* harmony import */ var _TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./TrayItemWidget */ "./lib/TrayItemWidget.js");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _TrayWidget__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TrayWidget */ "./lib/TrayWidget.js");
/* harmony import */ var _material_ui_core_TextField__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @material-ui/core/TextField */ "./node_modules/@material-ui/core/esm/TextField/TextField.js");
/* harmony import */ var _material_ui_lab_Autocomplete__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @material-ui/lab/Autocomplete */ "./node_modules/@material-ui/lab/esm/Autocomplete/Autocomplete.js");









const useStyles = (0,_material_ui_core__WEBPACK_IMPORTED_MODULE_0__.makeStyles)(theme => ({
    root: {
        width: '100%',
        height: 5,
        color: "rgb(255,255,255)"
    },
    heading: {
        fontSize: theme.typography.pxToRem(14)
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(14),
        color: theme.palette.text.secondary
    },
    icon: {
        verticalAlign: 'bottom',
        height: 5,
        width: 5
    },
    details: {
        alignItems: 'center'
    },
    column: {
        flexBasis: '40%'
    },
    helper: {
        borderLeft: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(0, 1)
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline'
        }
    }
}));
const Body = (_emotion_styled__WEBPACK_IMPORTED_MODULE_2___default().div) `
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  min-height: 100%;
  background-color:black;
  height: auto;
  overflow-y: auto;
`;
const Content = (_emotion_styled__WEBPACK_IMPORTED_MODULE_2___default().div) `
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    max-height:auto;
    'border-top': '4px solid #dfe2e5'
`;
const componentList = [
    { task: 'Read Data Set', id: 1 },
    { task: 'Augment Image Data', id: 2 },
    { task: 'Train/Test Split', id: 3 },
    { task: 'Train Face Detector', id: 4 },
    { task: 'Train Object Detector', id: 5 },
    { task: 'Evaluate mAP', id: 6 },
    { task: "Run Notebook", id: 7 },
    { task: "If", id: 8 },
    { task: "Math Operation", id: 9 },
    { task: "Convert to Aurora", id: 10 },
    { task: "Get Hyper-parameter String Value", id: 11 },
    { task: "Get Hyper-parameter Int Value", id: 12 },
    { task: "Get Hyper-parameter Float Value", id: 13 },
    { task: "Create Object Detector Model", id: 14 },
    { task: "Debug Image", id: 15 },
    { task: "Reached Target Accuracy", id: 16 },
    { task: "Literal True", id: 17 },
    { task: "Literal False", id: 18 }
];
const headerList = [
    { task: 'General', id: 1 }
];
function DetailedAccordion() {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement(Body, null,
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement(Content, null,
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayWidget__WEBPACK_IMPORTED_MODULE_3__.TrayWidget, null,
                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { style: {}, className: "test2" },
                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_material_ui_lab_Autocomplete__WEBPACK_IMPORTED_MODULE_4__["default"], { id: "accordion_search_bar", freeSolo: true, options: componentList.map(option => option.task), renderInput: params => (react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_material_ui_core_TextField__WEBPACK_IMPORTED_MODULE_5__["default"], Object.assign({}, params, { label: "Search..", margin: "normal", variant: "outlined", onFocus: event => {
                                setSearchTerm(event.target.value);
                                console.log(searchTerm);
                            }, onChange: event => {
                                if (searchTerm != event.target.value) {
                                    setSearchTerm(event.target.value);
                                    console.log(event.target.value);
                                }
                            }, onBlur: event => {
                                if (searchTerm != event.target.value) {
                                    setSearchTerm(event.target.value);
                                    console.log(event.target.value);
                                }
                            } }))) })),
                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__.Accordion, null,
                        headerList.filter((val) => {
                            if (searchTerm == "") {
                                return val;
                            }
                            else if (val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                return val;
                            }
                        }).map((val) => {
                            return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__.AccordionSummary, { expandIcon: react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_material_ui_icons_ExpandMore__WEBPACK_IMPORTED_MODULE_6__["default"], null), "aria-controls": "panel1c-content", id: "panel1c-header" },
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: classes.column },
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_material_ui_core__WEBPACK_IMPORTED_MODULE_0__.Typography, { className: classes.secondaryHeading }, val.task))));
                        }),
                        componentList.filter((val) => {
                            if (searchTerm == "") {
                                return val;
                            }
                            else if (val.task.toLowerCase().includes(searchTerm.toLowerCase())) {
                                return val;
                            }
                        }).map((val) => {
                            if (val.id == 1) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'in', name: 'Read Data Set' }, name: "Read Data Set", color: "rgb(192,255,0)" })));
                            }
                            else if (val.id == 2) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'out', name: 'Augment Image Data' }, name: "Argument Image Data", color: "rgb(0,102,204)" })));
                            }
                            else if (val.id == 3) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'split', name: 'Train/Test Split' }, name: "Train/Test Split", color: "rgb(255,153,102)" })));
                            }
                            else if (val.id == 4) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'train', name: 'Train Face Detector' }, name: "Train Face Detector", color: "rgb(255,102,102)" })));
                            }
                            else if (val.id == 5) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'train', name: 'Train Object Detector' }, name: "Train Object Detector", color: "rgb(15,255,255)" })));
                            }
                            else if (val.id == 6) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'eval', name: 'Evaluate mAP' }, name: "Evaluate mAP", color: "rgb(255,204,204)" })));
                            }
                            else if (val.id == 7) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'runnb', name: 'Run Notebook' }, name: "Run Notebook", color: "rgb(153,204,51)" })));
                            }
                            else if (val.id == 8) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'if', name: 'If' }, name: "If", color: "rgb(255,153,0)" })));
                            }
                            else if (val.id == 9) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'math', name: 'Math Operation' }, name: "Math Operation", color: "rgb(255,204,0)" })));
                            }
                            else if (val.id == 10) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'convert', name: 'Convert to Aurora' }, name: "Convert to Aurora", color: "rgb(204,204,204)" })));
                            }
                            else if (val.id == 11) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'string', name: 'Get Hyper-parameter String Value' }, name: "Get Hyper-parameter String Value", color: "rgb(153,204,204)" })));
                            }
                            else if (val.id == 12) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'int', name: 'Get Hyper-parameter Int Value' }, name: "Get Hyper-parameter Int Value", color: "rgb(153,0,102)" })));
                            }
                            else if (val.id == 13) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'float', name: 'Get Hyper-parameter Float Value' }, name: "Get Hyper-parameter Float Value", color: "rgb(102,51,102)" })));
                            }
                            else if (val.id == 14) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'model', name: 'Create Object Detector Model' }, name: "Create Object Detector Model", color: "rgb(102,102,102)" })));
                            }
                            else if (val.id == 15) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'debug', name: 'Debug Image' }, name: "Debug Image", color: "rgb(255,102,0)" })));
                            }
                            else if (val.id == 16) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'enough', name: 'Reached Target Accuracy' }, name: "Reached Target Accuracy", color: "rgb(51,51,51)" })));
                            }
                            else if (val.id == 17) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'literal', name: 'Literal True' }, name: "Literal True", color: "rgb(21,21,51)" })));
                            }
                            else if (val.id == 18) {
                                return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null,
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_7__.TrayItemWidget, { model: { type: 'literal', name: 'Literal False' }, name: "Literal False", color: "rgb(21,21,51)" })));
                            }
                        }),
                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_material_ui_core_Divider__WEBPACK_IMPORTED_MODULE_8__["default"], null)))))));
}
;


/***/ })

}]);
//# sourceMappingURL=lib_index_js.3cc2255fbac2c8527f8a.js.map