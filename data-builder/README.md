# `data-builder`

## Description

**data-builder** is a simple library that helps to query and format data for use with Kibana plugins.

## Usage

`buildGraphData` takes in two parameters, `visData` and `formatter`. `visData` has the following structure:

```ts
{
  columns: any[];
  rows: any[];
  aggs: IAggConfigs;
}
```

As the IAggsConfig object is not passed from the AST, the `data` object from `VisToExpressionAst` should be sent directly to this function. This can be done by storing a copy of `vis.data` elsewhere (shown below), or by calling the function directly within the AST generation of your plugin.

```ts
// In the same file as the AST generator
let visData;
export const getVisData() {
  return visData;
}

// In the AST generator...
const toExpressionAst: VisToExpressionAst<ParamsObject> = (vis) => {
  // ...
  visData = vis.data;
}

// Elsewhere in your plugin...
buildGraphData(visData, graphFormatterFn);
```

The second parameter contains a formatter function, used to properly structure the results of the query before returning it. This function is **required**, and the data builder will only return a valid structure if a formatter function is provided:

```ts
export interface ParsedKibanaData {
  vertexData: VertexContainer[];
  fieldData: FieldContainer[];
  bucketIDs: string[];
  rows: any[];
  idsOfInterest: string[];
}

export type JsonFormatFn = (kibanaData: ParsedKibanaData) => Graph | any;
```

The returned value from the format function can be of type `Graph` or any type that you choose:

```ts
export interface Graph {
  keys: string[];
  data: any[];
}
```
