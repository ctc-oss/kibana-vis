/**
 * Builds a URL for a drilldown visualization.
 * @param legend The current state of the legend (see legend module)
 * @param visData A copy of Kibana's datatable (sent to the visualization)
 * @param queryExclude What parameters to exclude from the query results
 * @param queryMap A map of keys to query strings
 * @param visType The type of visualization to route to
 */
export declare const getDrilldownInfo: (legend: any, visData: any, queryExclude: string, queryMap: Map<string, any>, visType: string) => Promise<void>;
export interface QueryResult {
    key: string;
    results: any;
}
/**
 * Fetches an ElasticSearch query using Kibana's internal proxy API.
 * @param queryExp A JSON object containing the desired query and the key it will be associated with
 * @param callback Function that is passed the response from said query (key and results)
 */
export declare const fetchQuery: (queryExp: any, callback: Function) => Promise<void>;
