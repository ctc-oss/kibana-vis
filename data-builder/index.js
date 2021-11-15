"use strict";
exports.__esModule = true;
var lodash_1 = require("lodash");
/**
 * Helper function that trims down the name for each metric.
 * @param str full metric description
 * @returns abbreviated name for said metric
 */
var replaceMetricString = function (str) {
    return str
        .replace('Average ', '')
        .replace('Unique count of ', '(count) ')
        .replace('Max ', '(max) ')
        .replace('Min ', '(min) ')
        .replace('Sum of ', '(sum) ');
};
/**
 * Builds data for a graph, and returns the result of passing said data through
 * a provided formatter (either a Graph structure or any other object).
 * @param visData The datatable passed to the visualization by Kibana (plus aggregate configs)
 * @param formatter Formatter for the datatable (JsonFormatFn)
 * @returns A formatted object for a graph, provided that formatter returns a value
 */
var buildGraphData = function (visData, formatter) {
    if (!visData.aggs || visData.aggs.aggs.length <= 1)
        return {};
    var rows = visData.rows;
    var columns = visData.columns;
    var graphData = columns.map(function (col) {
        return {
            id: col.id,
            name: replaceMetricString(col.name),
            srcParams: col.meta.sourceParams,
            type: col.meta.type
        };
    });
    var vertexData = graphData.filter(function (gdata) { return gdata.srcParams.schema === 'vertex'; });
    var fieldData = graphData.filter(function (gdata) { return gdata.srcParams.schema === 'field'; });
    var bucketIDs = fieldData.map(function (f) { return f.id; });
    var metricIDs = (0, lodash_1.uniq)(vertexData.map(function (m) { return m.srcParams.id; }));
    // Get the last field ID in order to generate the prefix,
    // as the desired combo of data is indexed with the last bucket ID.
    var lastID = bucketIDs[bucketIDs.length - 1];
    var lastIDNum = parseInt(lastID.substr(4, 2), 10);
    var lastIDPrefix = lastID.substr(0, lastID.lastIndexOf('-') - 2);
    var colPrefix = lastIDPrefix.slice(-1) !== '-' ? lastIDPrefix + '-' : lastIDPrefix;
    var idsOfInterest = metricIDs.map(function (m, i) { return colPrefix + (lastIDNum + i + 1) + '-' + m; });
    return formatter({ vertexData: vertexData, fieldData: fieldData, bucketIDs: bucketIDs, rows: rows, columns: columns, idsOfInterest: idsOfInterest });
};
exports["default"] = buildGraphData;
