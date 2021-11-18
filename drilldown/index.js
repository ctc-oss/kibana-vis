"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.fetchQuery = exports.getDrilldownInfo = void 0;
var color_string_1 = __importDefault(require("color-string"));
/**
 * Builds a URL for a drilldown visualization.
 * @param legend The current state of the legend (see legend module)
 * @param visData A copy of Kibana's datatable (sent to the visualization)
 * @param queryExclude What parameters to exclude from the query results
 * @param queryMap A map of keys to query strings
 * @param visType The type of visualization to route to
 */
var getDrilldownInfo = function (legend, visData, queryExclude, queryMap, visType) { return __awaiter(void 0, void 0, void 0, function () {
    var currentURL, _a, fullMatch, url, shortCode, vizID, gParams, fullAParams, kibanaAppURL_1, kibanaApiURL, indexPattern_1, aParams_1, drilldownMetrics, drilldownBuckets, paramArray, dMetric, metricString, dBucket, bucketString, paramString_1, _b, queryMatch, parentQuery, inheritedQueryString_1, urls;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                currentURL = window.location.href;
                _a = currentURL.match(/:\/\/(.+?)\/([a-z]{3})\/app\/visualize#\/edit\/(.+?)\?_g=\((.+?)\)&_a=\((.+?)$/), fullMatch = _a[0], url = _a[1], shortCode = _a[2], vizID = _a[3], gParams = _a[4], fullAParams = _a[5];
                if (!fullMatch.length) return [3 /*break*/, 2];
                kibanaAppURL_1 = currentURL.substring(0, currentURL.indexOf('app'));
                kibanaApiURL = kibanaAppURL_1 + 'api/';
                return [4 /*yield*/, fetch(kibanaApiURL + ("saved_objects/visualization/" + vizID), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(function (resp) { return resp.json(); })
                        .then(function (data) { return data.references[0].id; })];
            case 1:
                indexPattern_1 = _c.sent();
                aParams_1 = fullAParams.substring(0, fullAParams.indexOf('vis'));
                drilldownMetrics = visData.aggs.bySchemaName('dmetric');
                drilldownBuckets = visData.aggs.bySchemaName('dbucket');
                paramArray = [];
                if (drilldownMetrics.length) {
                    dMetric = drilldownMetrics[0];
                    metricString = "(enabled:!" + (dMetric.enabled ? 't' : 'f') + ",id:1,params:(field:" + dMetric.params.field.spec.name + "),schema:vertex,type:" + dMetric.type.name + ")";
                    paramArray.push(metricString);
                    if (drilldownBuckets.length) {
                        dBucket = drilldownBuckets[0];
                        bucketString = "(enabled:!" + (dBucket.enabled ? 't' : 'f') + ",id:2,params:(field:" + dBucket.params.field.spec.name + ",missingBucket:" + dBucket.params.missingBucket + ",missingBucketLabel:" + dBucket.params.missingBucketLabel + ",order:" + dBucket.params.order.value + ",orderBy:_key,otherBucket:!" + (dBucket.params.otherBucket ? 't' : 'f') + ",otherBucketLabel:" + dBucket.params.otherBucketLabel + ",size:" + dBucket.params.size + "),schema:field,type:" + dBucket.type.name + ")";
                        paramArray.push(bucketString);
                    }
                }
                paramString_1 = paramArray.join(',');
                _b = currentURL.match(/query:\(language:kuery,query:(.+?)\),uiState/), queryMatch = _b[0], parentQuery = _b[1];
                inheritedQueryString_1 = decodeURIComponent(parentQuery).replaceAll("'", '').trim();
                urls = Array.from(queryMap).map(function (_a) {
                    var _b, _c;
                    var key = _a[0], value = _a[1];
                    var excludedParams = queryExclude === null || queryExclude === void 0 ? void 0 : queryExclude.split(',');
                    var finalQuery = (inheritedQueryString_1.length ? inheritedQueryString_1 + " and " : '') + value.query;
                    excludedParams === null || excludedParams === void 0 ? void 0 : excludedParams.forEach(function (ex) { return (finalQuery = finalQuery.replace(new RegExp("( and)? " + ex + ":\"(.+?)\""), '')); });
                    var _aQueryParams = aParams_1.replace(/linked:!([t|f]),query:\((.+?)\),/, "linked:!$1,query:(language:kuery,query:'" + finalQuery + "'),");
                    var visColor = color_string_1["default"].get((_c = (_b = legend[key]) === null || _b === void 0 ? void 0 : _b.color) !== null && _c !== void 0 ? _c : '#32968E');
                    var withVis = _aQueryParams +
                        ("vis:(aggs:!(" + paramString_1 + "),params:(barColor:%23" + color_string_1["default"].to
                            .hex(visColor.value)
                            .substring(1) + ",excluded:'" + (excludedParams === null || excludedParams === void 0 ? void 0 : excludedParams.join(',')) + "'),title:'[Drilldown] " + key + "',type:" + visType + ")");
                    var formattedUrl = kibanaAppURL_1 + "app/visualize#/create?type=" + visType + "&indexPattern=" + indexPattern_1 + "&_g=(" + gParams + ")&_a=(" + withVis + ")";
                    queryMap.set(key, { query: value.query, url: formattedUrl });
                    return formattedUrl;
                });
                _c.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.getDrilldownInfo = getDrilldownInfo;
/**
 * Sends a fetch request to Kibana's console, returning the response.
 * @param kibanaApiURL The API URL for this Kibana instance
 * @param indexTitle The title for the index pattern
 * @param query The query body itself
 * @returns The response from Kibana's console proxy API
 */
var savedObjectsRequest = function (kibanaApiURL, indexTitle, query) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(kibanaApiURL + "console/proxy?path=/" + indexTitle + "/_search&method=POST", {
                    headers: {
                        'kbn-xsrf': 'true'
                    },
                    method: 'POST',
                    body: query
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
/**
 * Fetches an ElasticSearch query using Kibana's internal proxy API.
 * @param queryExp A JSON object containing the desired query and the key it will be associated with
 * @param callback Function that is passed the response from said query (key and results)
 */
var fetchQuery = function (queryExp, callback) { return __awaiter(void 0, void 0, void 0, function () {
    var kibanaAppURL, kibanaApiURL, _a, visIDMatch, visualizationID, indexPattern, _b, fullMatch, gParams, filters, query, _c, timeMatch, from, to, indexTitle, decodedQuery, queryQuotesRemoved, queryTerms, eqSymbolToKeyword, apiQuery, filterVariables, varIter, inherited, mustNot, filterValue, filterMatch, disabled, name_1, negate, range, _type, _fullRange, _name, _range, rangeParams, filterMatch, disabled, name_2, negate, query_1, _type, splitQuery, queryVal, must, existFields, filterIt, _d, match, field, disabled, key, negate, type, value, queryWithTimeRange, resp, queryWithTimestampField, newResp;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                kibanaAppURL = window.location.href.substring(0, window.location.href.indexOf('app'));
                kibanaApiURL = kibanaAppURL + "api/";
                _a = window.location.href.match(/visualize#\/edit\/(.+?)\?_g=/), visIDMatch = _a[0], visualizationID = _a[1];
                return [4 /*yield*/, fetch(kibanaApiURL + ("saved_objects/visualization/" + visualizationID), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(function (resp) { return resp.json(); })
                        .then(function (data) { return data.references[0].id; })];
            case 1:
                indexPattern = _f.sent();
                _b = window.location.href.match(/_g=(.+?)\)&_a=\(filters:(.+?),linked:(?:.+?),query:\(language:kuery,query:(.+?)\),uiState/), fullMatch = _b[0], gParams = _b[1], filters = _b[2], query = _b[3];
                _c = gParams.match(/time:\(from:(.+?),to:(.+?)\)/), timeMatch = _c[0], from = _c[1], to = _c[2];
                return [4 /*yield*/, fetch(kibanaApiURL + "saved_objects/index-pattern/" + indexPattern, {
                        method: 'GET'
                    })
                        .then(function (resp) { return resp.json(); })
                        .then(function (data) { return data.attributes.title; })];
            case 2:
                indexTitle = _f.sent();
                decodedQuery = decodeURIComponent(query);
                queryQuotesRemoved = (_e = queryExp.query) !== null && _e !== void 0 ? _e : decodedQuery.slice(1, decodedQuery.length - 1);
                queryTerms = queryQuotesRemoved
                    .split(/ and|or /)
                    .filter(function (q) { return q; })
                    .map(function (q) { return q.trim(); });
                eqSymbolToKeyword = function (equalityType) {
                    switch (equalityType) {
                        case '>=':
                            return 'gte';
                        case '>':
                            return 'gt';
                        case '<':
                            return 'lt';
                        case '<=':
                            return 'lte';
                        default:
                            return 'gte';
                    }
                };
                apiQuery = "{\"query\": { \"bool\": { \"filter\": [ " + queryTerms.map(function (q) {
                    if (q.indexOf('<') !== -1 || q.indexOf('>') !== -1) {
                        // Generate a range query for terms that use < or >
                        var isGreater = q.indexOf('<') === -1;
                        var alsoEqualTo = q.indexOf('=') !== -1;
                        var equalityType = isGreater ? (alsoEqualTo ? '>=' : '>') : alsoEqualTo ? '<=' : '<';
                        var equalityKeyword = eqSymbolToKeyword(equalityType);
                        var _a = q.split(equalityType), key = _a[0], val = _a[1];
                        return "{ \"range\": { \"" + key.trim() + "\": { \"" + equalityKeyword + "\": \"" + val.trim() + "\" } } }";
                    }
                    else {
                        // Generate a term query for "key:value" expressions
                        var _b = q.split(':'), key = _b[0], val = _b[1];
                        return "{ \"term\": { \"" + key.trim() + "\":" + val.trim() + " } }";
                    }
                }) + ",";
                filterVariables = filters.matchAll(/\('\$state':(?:.+?),meta:\((?:.+?),disabled:!(t|f),(?:.+?),key:(.+?),negate:!(t|f),params:\((.+?)\),type:(.+?)\),(range:\((.+?):\((.+?)\))?/g);
                varIter = filterVariables.next();
                inherited = [];
                mustNot = [];
                while (varIter.value) {
                    filterValue = varIter.value;
                    if (filterValue[5] === 'range') {
                        filterMatch = filterValue[0], disabled = filterValue[1], name_1 = filterValue[2], negate = filterValue[3], range = filterValue[4], _type = filterValue[5], _fullRange = filterValue[6], _name = filterValue[7], _range = filterValue[8];
                        if (disabled !== 't') {
                            rangeParams = range.split(',').reduce(function (prev, val) {
                                var keywordAndVal = val.split(':');
                                return prev + (prev.length ? ', ' : '') + ("\"" + keywordAndVal[0] + "\": \"" + keywordAndVal[1] + "\"");
                            }, '');
                            (negate === 't' ? mustNot : inherited).push("{ \"range\": { \"" + name_1.trim() + "\": { " + rangeParams + " } } }");
                        }
                    }
                    else if (filterValue[5] === 'phrase') {
                        filterMatch = filterValue[0], disabled = filterValue[1], name_2 = filterValue[2], negate = filterValue[3], query_1 = filterValue[4], _type = filterValue[5];
                        if (disabled !== 't') {
                            splitQuery = query_1.split(':');
                            queryVal = splitQuery[1];
                            (negate === 't' ? mustNot : inherited).push("{ \"term\": { \"" + name_2.trim() + "\":\"" + (queryVal.charAt(0) === '!' ? Boolean(queryVal.charAt(1) === 't').toString() : queryVal) + "\" } }");
                        }
                    }
                    varIter = filterVariables.next();
                }
                must = [];
                existFields = filters.matchAll(/\('\$state':(?:.+?),exists:\((.+?)\),meta:\((?:.+?),disabled:!(t|f),(?:.+?),key:(.+?),negate:!(t|f),type:(.+?),value:(.+?)\)/g);
                filterIt = existFields.next();
                while (filterIt.value) {
                    _d = filterIt.value, match = _d[0], field = _d[1], disabled = _d[2], key = _d[3], negate = _d[4], type = _d[5], value = _d[6];
                    (negate === 't' ? mustNot : must).push("{ \"exists\": { \"field\":\"" + key + "\" } }");
                    filterIt = existFields.next();
                }
                queryWithTimeRange = apiQuery +
                    (inherited.length ? inherited.join(',') + ', ' : '') +
                    ("{ \"range\": { \"created\": { \"gte\": \"" + decodeURIComponent(from) + "\", \"lt\": \"" + decodeURIComponent(to) + "\" } } } ], \"must_not\": [ " + (mustNot.length ? mustNot.join(',') : '') + " ], \"must\": [ " + (must.length ? must.join(',') : '') + " ] } } }");
                return [4 /*yield*/, savedObjectsRequest(kibanaApiURL, indexTitle, queryWithTimeRange)
                        .then(function (resp) { return resp.json(); })["catch"](function (err) { return console.log(err); })];
            case 3:
                resp = _f.sent();
                if (!(!resp.hasOwnProperty('hits') || resp.hits.total.value === 0 || resp.hits.hits.length === 0)) return [3 /*break*/, 5];
                queryWithTimestampField = queryWithTimeRange.replace('created', 'timestamp');
                return [4 /*yield*/, savedObjectsRequest(kibanaApiURL, indexTitle, queryWithTimestampField)
                        .then(function (res) { return res.json(); })["catch"](function (err) { return console.log(err); })];
            case 4:
                newResp = _f.sent();
                callback({ results: newResp !== null && newResp !== void 0 ? newResp : {}, key: queryExp.key });
                return [3 /*break*/, 6];
            case 5:
                callback({ results: resp !== null && resp !== void 0 ? resp : {}, key: queryExp.key });
                _f.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.fetchQuery = fetchQuery;
