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
/* harmony export */   "TrayItemWidget": () => (/* binding */ TrayItemWidget)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_1__);


const Tray = (_emotion_styled__WEBPACK_IMPORTED_MODULE_1___default().div) `
	color: white;
	font-family: Helvetica, Arial;
	padding: 5px;
	width:auto;
	margin: 0px 10px;
	border: solid 1px ${(p) => p.color};
	border-radius: 5px;
	margin-bottom: 2px;
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
	min-width: 260px;
	background: rgb(20, 20, 20);
	flex-grow: 3;
	flex-shrink: 0;
	width:auto;
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
/* harmony export */   "Body": () => (/* binding */ Body),
/* harmony export */   "Content": () => (/* binding */ Content),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/application */ "webpack/sharing/consume/default/@jupyterlab/application");
/* harmony import */ var _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @emotion/styled */ "webpack/sharing/consume/default/@emotion/styled/@emotion/styled");
/* harmony import */ var _emotion_styled__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./TrayItemWidget */ "./lib/TrayItemWidget.js");
/* harmony import */ var _TrayWidget__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./TrayWidget */ "./lib/TrayWidget.js");






const Body = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		min-height: 100%;
		height: 500px;
	`;
const Content = (_emotion_styled__WEBPACK_IMPORTED_MODULE_3___default().div) `
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    'padding-top': '2em',
    'padding-bottom': '2em',
    'border-top': '1px solid #dfe2e5'
  `;
class BodyWidget extends _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.ReactWidget {
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_2___default().createElement(Body, null,
            react__WEBPACK_IMPORTED_MODULE_2___default().createElement(Content, null,
                react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayWidget__WEBPACK_IMPORTED_MODULE_4__.TrayWidget, null,
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'in', name: 'Read Data Set' }, name: "Read Data Set", color: "rgb(192,255,0)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'out', name: 'Augment Image Data' }, name: "Argument Image Data", color: "rgb(0,102,204)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'split', name: 'Train/Test Split' }, name: "Train/Test Split", color: "rgb(255,153,102)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'train', name: 'Train Face Detector' }, name: "Train Face Detector", color: "rgb(255,102,102)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'train', name: 'Train Object Detector' }, name: "Train Object Detector", color: "rgb(15,255,255)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'eval', name: 'Evaluate mAP' }, name: "Evaluate mAP", color: "rgb(255,204,204)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'runnb', name: 'Run Notebook' }, name: "Run Notebook", color: "rgb(153,204,51)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'if', name: 'If' }, name: "If", color: "rgb(255,153,0)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'math', name: 'Math Operation' }, name: "Math Operation", color: "rgb(255,204,0)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'convert', name: 'Convert to Aurora' }, name: "Convert to Aurora", color: "rgb(204,204,204)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'string', name: 'Get Hyper-parameter String Value' }, name: "Get Hyper-parameter String Value", color: "rgb(153,204,204)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'int', name: 'Get Hyper-parameter Int Value' }, name: "Get Hyper-parameter Int Value", color: "rgb(153,0,102)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'float', name: 'Get Hyper-parameter Float Value' }, name: "Get Hyper-parameter Float Value", color: "rgb(102,51,102)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'model', name: 'Create Object Detector Model' }, name: "Create Object Detector Model", color: "rgb(102,102,102)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'debug', name: 'Debug Image' }, name: "Debug Image", color: "rgb(255,102,0)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'enough', name: 'Reached Target Accuracy' }, name: "Reached Target Accuracy", color: "rgb(51,51,51)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'literal', name: 'Literal True' }, name: "Literal True", color: "rgb(21,21,51)" }),
                    react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_TrayItemWidget__WEBPACK_IMPORTED_MODULE_5__.TrayItemWidget, { model: { type: 'literal', name: 'Literal False' }, name: "Literal False", color: "rgb(21,21,51)" })))));
    }
}
/**
 * Initialization data for the xpipe_component_library extension.
 */
const xpipe_component_library = {
    id: 'xpipe_component_library:plugin',
    autoStart: true,
    requires: [_jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__.ILabShell, _jupyterlab_application__WEBPACK_IMPORTED_MODULE_0__.ILayoutRestorer],
    activate: (app, labShell, restorer) => {
        console.log('JupyterLab extension xpipe_component_library is activated!');
        const widget = new BodyWidget();
        widget.id = 'xai-jupyterlab-component-library';
        restorer.add(widget, widget.id);
        labShell.add(widget, "left", { rank: 1000 });
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (xpipe_component_library);


/***/ })

}]);
//# sourceMappingURL=lib_index_js.62487f3a88014d89cc82.js.map