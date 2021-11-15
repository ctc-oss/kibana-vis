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
declare type VertexContainer = FieldContainer;
export interface ParsedKibanaData {
    vertexData: VertexContainer[];
    fieldData: FieldContainer[];
    bucketIDs: string[];
    rows: any[];
    columns: any[];
    idsOfInterest: string[];
}
export declare type JsonFormatFn = (kibanaData: ParsedKibanaData) => Graph | any;
/**
 * Builds data for a graph, and returns the result of passing said data through
 * a provided formatter (either a Graph structure or any other object).
 * @param visData The datatable passed to the visualization by Kibana (plus aggregate configs)
 * @param formatter Formatter for the datatable (JsonFormatFn)
 * @returns A formatted object for a graph, provided that formatter returns a value
 */
declare const buildGraphData: (visData: KibanaData, formatter: JsonFormatFn) => Graph | any;
export default buildGraphData;
