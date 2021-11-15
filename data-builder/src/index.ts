import { uniq } from 'lodash';

export interface KibanaData {
  columns: any[];
  rows: any[];
  aggs: any;
}

export interface Graph {
  keys: string[];
  data: any[];
}

interface FieldContainer {
  id: any;
  name: string;
  srcParams: any;
  type: string;
}

type VertexContainer = FieldContainer;

export interface ParsedKibanaData {
  vertexData: VertexContainer[];
  fieldData: FieldContainer[];
  bucketIDs: string[];
  rows: any[];
  columns: any[];
  idsOfInterest: string[];
}

export type JsonFormatFn = (kibanaData: ParsedKibanaData) => Graph | any;

/**
 * Helper function that trims down the name for each metric.
 * @param str full metric description
 * @returns abbreviated name for said metric
 */
const replaceMetricString = (str: string): string =>
  str
    .replace('Average ', '')
    .replace('Unique count of ', '(count) ')
    .replace('Max ', '(max) ')
    .replace('Min ', '(min) ')
    .replace('Sum of ', '(sum) ');

/**
 * Builds data for a graph, and returns the result of passing said data through
 * a provided formatter (either a Graph structure or any other object).
 * @param visData The datatable passed to the visualization by Kibana (plus aggregate configs)
 * @param formatter Formatter for the datatable (JsonFormatFn)
 * @returns A formatted object for a graph, provided that formatter returns a value
 */
const buildGraphData = (visData: KibanaData, formatter: JsonFormatFn): Graph | any => {
  if (!visData.aggs || visData.aggs!.aggs!.length <= 1) return {} as Graph;

  const rows = visData.rows;
  const columns = visData.columns;

  const graphData = columns.map((col) => {
    return {
      id: col.id,
      name: replaceMetricString(col.name),
      srcParams: col.meta.sourceParams,
      type: col.meta.type,
    };
  });

  const vertexData = graphData.filter((gdata) => gdata.srcParams.schema === 'vertex');
  const fieldData = graphData.filter((gdata) => gdata.srcParams.schema === 'field');

  const bucketIDs = fieldData.map((f) => f.id);
  const metricIDs = uniq(vertexData.map((m) => m.srcParams.id));

  // Get the last field ID in order to generate the prefix,
  // as the desired combo of data is indexed with the last bucket ID.
  const lastID = bucketIDs[bucketIDs.length - 1];
  const lastIDNum = parseInt(lastID.substr(4, 2), 10);
  const lastIDPrefix = lastID.substr(0, lastID.lastIndexOf('-') - 2);
  const colPrefix = lastIDPrefix.slice(-1) !== '-' ? lastIDPrefix + '-' : lastIDPrefix;
  const idsOfInterest = metricIDs.map(
    (m: string, i: number) => colPrefix + (lastIDNum + i + 1) + '-' + m
  );

  return formatter({ vertexData, fieldData, bucketIDs, rows, columns, idsOfInterest });
};

export default buildGraphData;
