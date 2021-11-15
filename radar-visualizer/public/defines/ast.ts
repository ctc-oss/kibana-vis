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
import { RadarRenderValue } from '../components/Renderer';
import { StateParamsObject } from '../components/Options';
import { VisData } from '../../../../src/plugins/visualizations/public';
import type { Datatable } from '../../../../src/plugins/expressions/public';

type Input = Datatable;

export interface RadarInspectorAdapters extends Adapters {
  requests: RequestAdapter;
}

interface Arguments {
  visParams: string | null;
}

export type RadarExpressionFunctionDefinition = ExpressionFunctionDefinition<
  'radar',
  Input,
  Arguments,
  Promise<ExpressionValueRender<RadarRenderValue>>
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
    aggs: vis.data.aggs!.aggs.map((agg) => buildExpression(agg.toExpressionAst())),
  });

  visData = vis.data;
  const radar = buildExpressionFunction<RadarExpressionFunctionDefinition>('radar', {
    visParams: JSON.stringify(vis.params),
  });

  const ast = buildExpression([esaggs, radar]);

  return ast.toAst();
};

export default toExpressionAst;
