"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.CheckboxLegend = exports.filterLegendModel = exports.allItemsVisible = exports.buildLegendModel = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var styled_components_1 = __importDefault(require("styled-components"));
// --- styled components ---
var CheckboxLegendLabel = styled_components_1["default"].label(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  cursor: pointer;\n  font-size: 0.8rem;\n  font-weight: 500;\n  align-items: center;\n  padding-left: 5px;\n  padding-top: 2px;\n  padding-right: 3px;\n  white-space: nowrap;\n"], ["\n  cursor: pointer;\n  font-size: 0.8rem;\n  font-weight: 500;\n  align-items: center;\n  padding-left: 5px;\n  padding-top: 2px;\n  padding-right: 3px;\n  white-space: nowrap;\n"])));
var LegendItemStyle = styled_components_1["default"].div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  cursor: pointer;\n  display: flex;\n  padding: 3px;\n  margin-right: 3px;\n  border-radius: 5px;\n  transition: background-color 0.2s linear;\n  opacity: ", ";\n  text-decoration: ", ";\n\n  .focus-icon {\n    opacity: 0;\n  }\n\n  &:hover .focus-icon {\n    opacity: 1;\n  }\n"], ["\n  cursor: pointer;\n  display: flex;\n  padding: 3px;\n  margin-right: 3px;\n  border-radius: 5px;\n  transition: background-color 0.2s linear;\n  opacity: ", ";\n  text-decoration: ", ";\n\n  .focus-icon {\n    opacity: 0;\n  }\n\n  &:hover .focus-icon {\n    opacity: 1;\n  }\n"])), function (props) { return (props.checked || props.showAll ? '1.0' : '0.7'); }, function (props) { return (props.checked || props.showAll ? 'none' : 'line-through'); });
var LegendDiv = styled_components_1["default"].div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  position: relative;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  right: ", ";\n  top: auto;\n"], ["\n  position: relative;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  right: ", ";\n  top: auto;\n"])), function (props) { return (props.leftAligned ? '0' : '5%'); });
var FocusIcon = styled_components_1["default"].div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  cursor: pointer;\n  text-align: center;\n  padding: 3px;\n  transition: background-color 0.3s linear;\n\n  &:hover {\n    border-radius: 5px;\n    background-color: rgba(0, 0, 0, 0.1);\n  }\n"], ["\n  cursor: pointer;\n  text-align: center;\n  padding: 3px;\n  transition: background-color 0.3s linear;\n\n  &:hover {\n    border-radius: 5px;\n    background-color: rgba(0, 0, 0, 0.1);\n  }\n"])));
var LegendEntry = styled_components_1["default"].div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  display: flex;\n\n  ", " {\n    opacity: 0;\n    transition: opacity 0.3s ease-in-out;\n  }\n\n  &:hover ", " {\n    opacity: 1;\n  }\n\n  &:hover ", " {\n    background-color: rgba(0, 0, 0, 0.1);\n    transition: background-color 0.2s linear;\n  }\n"], ["\n  display: flex;\n\n  ", " {\n    opacity: 0;\n    transition: opacity 0.3s ease-in-out;\n  }\n\n  &:hover ", " {\n    opacity: 1;\n  }\n\n  &:hover ", " {\n    background-color: rgba(0, 0, 0, 0.1);\n    transition: background-color 0.2s linear;\n  }\n"])), FocusIcon, FocusIcon, LegendItemStyle);
// --- functions ---
/**
 * Builds a legend model, given a set of keys and a color scheme
 * @param keys The list of items for the legend
 * @param colorScheme Any color scheme of preference (array of "rgb(...)" or hex values)
 * @returns A JSON object that contains the structure of the legend
 */
var buildLegendModel = function (keys, colorScheme) {
    return (keys || []).reduce(function (all, k, i) {
        var _a;
        return (__assign(__assign({}, all), (_a = {}, _a[k] = {
            color: colorScheme[i % colorScheme.length],
            checked: true
        }, _a)));
    }, {});
};
exports.buildLegendModel = buildLegendModel;
/**
 * @param legend The legend's current state
 * @returns Whether all the items in the legend are toggled on
 */
var allItemsVisible = function (legend) {
    return Object.values(legend).filter(function (item) { return !item.checked; }).length === 0;
};
exports.allItemsVisible = allItemsVisible;
/**
 * Filters the legend, returning true if the legend has changed and false otherwise.
 * @param hiddenKeys The already-hidden keys from the graph
 * @param legend The legend model object used for the graph
 * @returns Whether there are hidden keys remaining (or if there were hidden keys remaining)
 */
var filterLegendModel = function (hiddenKeys, legend) {
    var legendKeys = Object.keys(legend);
    var legendVals = Object.values(legend);
    var oldHiddenLen = hiddenKeys.length;
    legendVals.forEach(function (item, i) {
        var legendVal = legendKeys[i];
        var keyIndex = hiddenKeys.indexOf(legendVal);
        if (!item.checked && keyIndex < 0) {
            hiddenKeys.push(legendVal);
        }
        else if (item.checked && keyIndex !== -1) {
            hiddenKeys.splice(keyIndex, 1);
        }
    });
    return hiddenKeys.length > 0 || oldHiddenLen > 0;
};
exports.filterLegendModel = filterLegendModel;
var toggleCheckAll = function (legendModel, onLegendItemChecked, checked) {
    return Object.keys(legendModel)
        .filter(function (key) { return legendModel[key].checked !== checked; })
        .forEach(function (key) {
        return onLegendItemChecked({
            key: key,
            checked: checked
        });
    });
};
// --- JSX components ---
var CheckboxLegendItem = function (_a) {
    var details = _a.details, onCheck = _a.onCheck, onFocus = _a.onFocus, iconType = _a.iconType;
    var FocusElement = onFocus ? iconType ? iconType(details) : (0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD0D" }, void 0) : null;
    return ((0, jsx_runtime_1.jsxs)(LegendEntry, { children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(LegendItemStyle, __assign({ checked: details.checked, showAll: details.label === 'Show All', onClick: function () { return onCheck(details.key); } }, { children: [(0, jsx_runtime_1.jsx)(CheckboxLegendCheck, { color: details.color, checked: details.checked }, void 0), (0, jsx_runtime_1.jsx)(CheckboxLegendLabel, { children: details.label || details.key }, void 0)] }), void 0) }, void 0), onFocus ? ((0, jsx_runtime_1.jsx)(FocusIcon, __assign({ "aria-label": "Focus icon", onClick: function () { return onFocus(details); } }, { children: FocusElement }), void 0)) : null] }, void 0));
};
var CheckboxLegendCheck = function (_a) {
    var color = _a.color, checked = _a.checked;
    var width = 16;
    var height = 16;
    var strokeWidth = 2;
    var checkColor = 'white';
    var style = {
        stroke: color,
        fill: color,
        strokeWidth: strokeWidth
    };
    var checkPoints = [
        width * 0.3 + "," + height * 0.5,
        width * 0.45 + "," + height * 0.65,
        width * 0.7 + "," + height * 0.32,
    ];
    return ((0, jsx_runtime_1.jsx)("div", __assign({ style: { width: width, height: height } }, { children: (0, jsx_runtime_1.jsxs)("svg", __assign({ viewBox: "0 0 " + width + " " + height }, { children: [(0, jsx_runtime_1.jsx)("circle", { style: style, cx: width / 2, cy: height / 2, r: width / 2 - 2 }, void 0), checked ? ((0, jsx_runtime_1.jsx)("polyline", { style: __assign(__assign({}, style), { stroke: checkColor, strokeWidth: strokeWidth }), points: checkPoints.join(' ') }, void 0)) : null] }), void 0) }), void 0));
};
var CheckAllButton = function (_a) {
    var legendModel = _a.legendModel, onLegendItemChecked = _a.onLegendItemChecked;
    var allChecked = Object.keys(legendModel).reduce(function (all, x) { return legendModel[x].checked && all; }, true);
    return ((0, jsx_runtime_1.jsx)(CheckboxLegendItem, { details: {
            label: allChecked ? 'Hide All' : 'Show All',
            checked: allChecked,
            color: 'black'
        }, onCheck: toggleCheckAll.bind(null, legendModel, onLegendItemChecked, !allChecked) }, void 0));
};
var CheckboxLegend = function (_a) {
    var legendModel = _a.legendModel, onLegendItemChecked = _a.onLegendItemChecked, colorScheme = _a.colorScheme, _b = _a.isLeftAligned, isLeftAligned = _b === void 0 ? false : _b, dotColor = _a.dotColor, onMouseEnter = _a.onMouseEnter, onMouseLeave = _a.onMouseLeave, onFocus = _a.onFocus, iconType = _a.iconType;
    return ((0, jsx_runtime_1.jsxs)(LegendDiv, __assign({ leftAligned: isLeftAligned }, { children: [(0, jsx_runtime_1.jsx)(CheckAllButton, { legendModel: legendModel, onLegendItemChecked: onLegendItemChecked }, void 0), Object.keys(legendModel).map(function (key) { return ((0, jsx_runtime_1.jsx)("div", __assign({ onMouseEnter: onMouseEnter ? function () { return onMouseEnter(legendModel, key, dotColor, colorScheme); } : undefined, onMouseLeave: onMouseLeave ? function () { return onMouseLeave(legendModel, key, dotColor, colorScheme); } : undefined }, { children: (0, jsx_runtime_1.jsx)(CheckboxLegendItem, { details: __assign({ key: key }, legendModel[key]), onCheck: function () {
                        return onLegendItemChecked({
                            key: key,
                            checked: !legendModel[key].checked
                        });
                    }, onFocus: onFocus, iconType: iconType }, void 0) }), "legend-key-" + key)); })] }), void 0));
};
exports.CheckboxLegend = CheckboxLegend;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
