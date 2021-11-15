import {
  EsaggsExpressionFunctionDefinition,
  IndexPatternLoadExpressionFunctionDefinition,
} from '../../../../src/plugins/data/public';
import { VisToExpressionAst } from '../../../../src/plugins/visualizations/public';
import {
  buildExpression,
  buildExpressionFunction,
  ExpressionFunctionDefinition,
  ExpressionValueRender,
} from '../../../../src/plugins/expressions/public';
import { Adapters, RequestAdapter } from '../../../../src/plugins/inspector/public';
import { LineRenderValue } from '../components/Renderer';
import { StateParamsObject } from '../components/Options';
import { VisData } from '../../../../src/plugins/visualizations/public';
import type { Datatable } from '../../../../src/plugins/expressions/public';

type Input = Datatable;

export interface LineInspectorAdapters extends Adapters {
  requests: RequestAdapter;
}

interface Arguments {
  visParams: string | null;
}

export type LineExpressionFunctionDefinition = ExpressionFunctionDefinition<
  'line',
  Input,
  Arguments,
  Promise<ExpressionValueRender<LineRenderValue>>
>;

let visData: VisData;
export const getVisData = () => {
  return visData;
};

const toExpressionAst: VisToExpressionAst<StateParamsObject> = (vis) => {
  if (vis.data.aggs?.aggs?.length === 0) {
    vis.data.aggs.createAggConfig({
      id: '1',
      enabled: true,
      type: 'count',
      schema: 'metric',
      params: {},
    });
  }

  const esaggs = buildExpressionFunction<EsaggsExpressionFunctionDefinition>('esaggs', {
    index: buildExpression([
      buildExpressionFunction<IndexPatternLoadExpressionFunctionDefinition>('indexPatternLoad', {
        id: vis.data.indexPattern!.id!,
      }),
    ]),
    metricsAtAllLevels: vis.isHierarchical(),
    partialRows: false,
    aggs: vis.data.aggs?.aggs?.map((agg) => buildExpression(agg.toExpressionAst())),
  });

  visData = vis.data;
  const line = buildExpressionFunction<LineExpressionFunctionDefinition>('line', {
    visParams: JSON.stringify(vis.params),
  });

  const ast = buildExpression([esaggs, line]);

  return ast.toAst();
};

export default toExpressionAst;
