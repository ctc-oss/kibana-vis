import colorString from 'color-string';

/**
 * Builds a URL for a drilldown visualization.
 * @param legend The current state of the legend (see legend module)
 * @param visData A copy of Kibana's datatable (sent to the visualization)
 * @param queryExclude What parameters to exclude from the query results
 * @param queryMap A map of keys to query strings
 * @param visType The type of visualization to route to
 */
export const getDrilldownInfo = async (
  legend: any,
  visData: any,
  queryExclude: string,
  queryMap: Map<string, any>,
  visType: string
) => {
  const currentURL = window.location.href;
  const [fullMatch, url, shortCode, vizID, gParams, fullAParams] = currentURL.match(
    /:\/\/(.+?)\/([a-z]{3})\/app\/visualize#\/edit\/(.+?)\?_g=\((.+?)\)&_a=\((.+?)$/
  );

  if (fullMatch.length) {
    const kibanaAppURL = currentURL.substring(0, currentURL.indexOf('app'));
    const kibanaApiURL = kibanaAppURL + 'api/';
    const indexPattern = await fetch(kibanaApiURL + `saved_objects/visualization/${vizID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => data.references[0].id);

    const aParams = fullAParams.substring(0, fullAParams.indexOf('vis'));

    //const filters = aParams.substring(0, aParams.indexOf(',linked'));

    const drilldownMetrics = visData.aggs.bySchemaName('dmetric');
    const drilldownBuckets = visData.aggs.bySchemaName('dbucket');

    const paramArray = [];

    if (drilldownMetrics.length) {
      const dMetric = drilldownMetrics[0];
      const metricString = `(enabled:!${dMetric.enabled ? 't' : 'f'},id:1,params:(field:${
        dMetric.params.field.spec.name
      }),schema:vertex,type:${dMetric.type.name})`;
      paramArray.push(metricString);

      if (drilldownBuckets.length) {
        const dBucket = drilldownBuckets[0];
        const bucketString = `(enabled:!${dBucket.enabled ? 't' : 'f'},id:2,params:(field:${
          dBucket.params.field.spec.name
        },missingBucket:${dBucket.params.missingBucket},missingBucketLabel:${
          dBucket.params.missingBucketLabel
        },order:${dBucket.params.order.value},orderBy:_key,otherBucket:!${
          dBucket.params.otherBucket ? 't' : 'f'
        },otherBucketLabel:${dBucket.params.otherBucketLabel},size:${
          dBucket.params.size
        }),schema:field,type:${dBucket.type.name})`;
        paramArray.push(bucketString);
      }
    }

    const paramString = paramArray.join(',');

    const [queryMatch, parentQuery] = currentURL.match(
      /query:\(language:kuery,query:(.+?)\),uiState/
    );
    const inheritedQueryString = decodeURIComponent(parentQuery).replaceAll("'", '').trim();
    const urls = Array.from(queryMap).map(([key, value]) => {
      const excludedParams = queryExclude?.split(',');
      let finalQuery =
        (inheritedQueryString.length ? `${inheritedQueryString} and ` : '') + value.query;
      excludedParams?.forEach(
        (ex) => (finalQuery = finalQuery.replace(new RegExp(`( and)? ${ex}:\"(.+?)\"`), ''))
      );

      const _aQueryParams = aParams.replace(
        /linked:!([t|f]),query:\((.+?)\),/,
        `linked:!$1,query:(language:kuery,query:'${finalQuery}'),`
      );
      const visColor = colorString.get(legend[key]?.color ?? '#32968E');
      const withVis =
        _aQueryParams +
        `vis:(aggs:!(${paramString}),params:(barColor:%23${colorString.to
          .hex(visColor.value)
          .substring(1)},excluded:'${excludedParams?.join(
          ','
        )}'),title:'[Drilldown] ${key}',type:${visType})`;

      const formattedUrl = `${kibanaAppURL}app/visualize#/create?type=${visType}&indexPattern=${indexPattern}&_g=(${gParams})&_a=(${withVis})`;
      queryMap.set(key, { query: value.query, url: formattedUrl });

      return formattedUrl;
    });
  }
};

/**
 * Sends a fetch request to Kibana's console, returning the response.
 * @param kibanaApiURL The API URL for this Kibana instance
 * @param indexTitle The title for the index pattern
 * @param query The query body itself
 * @returns The response from Kibana's console proxy API
 */
const savedObjectsRequest = async (kibanaApiURL: string, indexTitle: string, query: string) =>
  await fetch(`${kibanaApiURL}console/proxy?path=/${indexTitle}/_search&method=POST`, {
    headers: {
      'kbn-xsrf': 'true',
    },
    method: 'POST',
    body: query,
  });

interface QueryModel {
  query: string;
  key: string;
}

export interface QueryResult {
  key: string;
  results: any;
}

/**
 * Fetches an ElasticSearch query using Kibana's internal proxy API.
 * @param queryExp A JSON object containing the desired query and the key it will be associated with
 * @param callback Function that is passed the response from said query (key and results)
 */
export const fetchQuery = async (queryExp: any, callback: Function) => {
  const kibanaAppURL = window.location.href.substring(0, window.location.href.indexOf('app'));
  const kibanaApiURL = `${kibanaAppURL}api/`;
  const [visIDMatch, visualizationID] = window.location.href.match(/visualize#\/edit\/(.+?)\?_g=/);

  const indexPattern = await fetch(
    kibanaApiURL + `saved_objects/visualization/${visualizationID}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
    .then((resp) => resp.json())
    .then((data) => data.references[0].id);

  // query:(language:kuery,query:'...')
  const [fullMatch, gParams, filters, query] = window.location.href.match(
    /_g=(.+?)\)&_a=\(filters:(.+?),linked:(?:.+?),query:\(language:kuery,query:(.+?)\),uiState/
  );

  // time range
  const [timeMatch, from, to] = gParams.match(/time:\(from:(.+?),to:(.+?)\)/);

  const indexTitle = await fetch(`${kibanaApiURL}saved_objects/index-pattern/${indexPattern}`, {
    method: 'GET',
  })
    .then((resp) => resp.json())
    .then((data) => data.attributes.title);

  const decodedQuery = decodeURIComponent(query);
  const queryQuotesRemoved = queryExp.query ?? decodedQuery.slice(1, decodedQuery.length - 1);
  const queryTerms = queryQuotesRemoved
    .split(/ and|or /)
    .filter((q) => q)
    .map((q) => q.trim());

  const eqSymbolToKeyword = (equalityType: string) => {
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

  const apiQuery = `{"query": { "bool": { "filter": [ ${queryTerms.map((q) => {
    if (q.indexOf('<') !== -1 || q.indexOf('>') !== -1) {
      // Generate a range query for terms that use < or >
      const isGreater = q.indexOf('<') === -1;
      const alsoEqualTo = q.indexOf('=') !== -1;

      const equalityType = isGreater ? (alsoEqualTo ? '>=' : '>') : alsoEqualTo ? '<=' : '<';
      const equalityKeyword = eqSymbolToKeyword(equalityType);

      const [key, val] = q.split(equalityType);
      return `{ "range": { "${key.trim()}": { "${equalityKeyword}": "${val.trim()}" } } }`;
    } else {
      // Generate a term query for "key:value" expressions
      const [key, val] = q.split(':');
      return `{ "term": { "${key.trim()}":${val.trim()} } }`;
    }
  })},`;

  const filterVariables = filters.matchAll(
    /\('\$state':(?:.+?),meta:\((?:.+?),disabled:!(t|f),(?:.+?),key:(.+?),negate:!(t|f),params:\((.+?)\),type:(.+?)\),(range:\((.+?):\((.+?)\))?/g
  );
  let varIter = filterVariables.next();

  const inherited = [];
  const mustNot = [];
  while (varIter.value) {
    const filterValue = varIter.value;
    if (filterValue[5] === 'range') {
      const [filterMatch, disabled, name, negate, range, _type, _fullRange, _name, _range] =
        filterValue;
      if (disabled !== 't') {
        const rangeParams = range.split(',').reduce((prev, val) => {
          const keywordAndVal = val.split(':');
          return prev + (prev.length ? ', ' : '') + `"${keywordAndVal[0]}": "${keywordAndVal[1]}"`;
        }, '');
        (negate === 't' ? mustNot : inherited).push(
          `{ "range": { "${name.trim()}": { ${rangeParams} } } }`
        );
      }
    } else if (filterValue[5] === 'phrase') {
      const [filterMatch, disabled, name, negate, query, _type] = filterValue;
      if (disabled !== 't') {
        const splitQuery = query.split(':');
        const queryVal = splitQuery[1];
        (negate === 't' ? mustNot : inherited).push(
          `{ "term": { "${name.trim()}":"${
            queryVal.charAt(0) === '!' ? Boolean(queryVal.charAt(1) === 't').toString() : queryVal
          }" } }`
        );
      }
    }

    varIter = filterVariables.next();
  }

  const must = [];
  // handle filters with "exists"/"does not exist" operators
  const existFields = filters.matchAll(
    /\('\$state':(?:.+?),exists:\((.+?)\),meta:\((?:.+?),disabled:!(t|f),(?:.+?),key:(.+?),negate:!(t|f),type:(.+?),value:(.+?)\)/g
  );
  let filterIt = existFields.next();
  while (filterIt.value) {
    const [match, field, disabled, key, negate, type, value] = filterIt.value;
    (negate === 't' ? mustNot : must).push(`{ "exists": { "field":"${key}" } }`);

    filterIt = existFields.next();
  }

  const queryWithTimeRange =
    apiQuery +
    (inherited.length ? inherited.join(',') + ', ' : '') +
    `{ "range": { "created": { "gte": "${decodeURIComponent(from)}", "lt": "${decodeURIComponent(
      to
    )}" } } } ], "must_not": [ ${mustNot.length ? mustNot.join(',') : ''} ], "must": [ ${
      must.length ? must.join(',') : ''
    } ] } } }`;

  let resp = await savedObjectsRequest(kibanaApiURL, indexTitle, queryWithTimeRange)
    .then((resp) => resp.json())
    .catch((err) => console.log(err));

  if (!resp.hasOwnProperty('hits') || resp.hits.total.value === 0 || resp.hits.hits.length === 0) {
    // If "created" date field doesn't return results (or errored out), try searching with "timestamp"
    const queryWithTimestampField = queryWithTimeRange.replace('created', 'timestamp');
    const newResp = await savedObjectsRequest(kibanaApiURL, indexTitle, queryWithTimestampField)
      .then((res) => res.json())
      .catch((err) => console.log(err));

    callback({ results: newResp ?? {}, key: queryExp.key });
  } else {
    callback({ results: resp ?? {}, key: queryExp.key });
  }
};
