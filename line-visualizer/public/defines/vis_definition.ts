import { AggGroupNames } from '../../../../src/plugins/data/public';
import { i18n } from '@kbn/i18n';
import { VIS_EVENT_TO_TRIGGER } from '../../../../src/plugins/visualizations/public';
import { LineVisualizerOptions } from '../components/Options';
import toExpressionAst from './ast';

// Definition context for the visualizer plugin
const VIS_DEFINITION = {
  name: 'lineVisualizer',
  title: i18n.translate('lineVisualizer.visTitle', {
    defaultMessage: 'Stacked Line',
  }),
  description: i18n.translate('lineVisualizer.visDescription', {
    defaultMessage:
      'Displays multivariate data in a line chart, supporting stacked lines and multiple categories (buckets).',
  }),
  getSupportedTriggers: () => {
    return [VIS_EVENT_TO_TRIGGER.filter];
  },
  icon: 'visualizeApp',
  visConfig: {
    defaults: {},
  },
  toExpressionAst,
  editorConfig: {
    optionsTemplate: LineVisualizerOptions,
    schemas: [
      {
        group: AggGroupNames.Metrics,
        title: 'Metric',
        name: 'vertex',
        aggFilter: ['count', 'cardinality', 'avg', 'sum', 'min', 'max'],
        min: 3,
        max: 10,
      },
      {
        group: AggGroupNames.Buckets,
        title: 'Category',
        name: 'field',
        min: 1,
        max: 10,
        aggFilter: ['terms', 'range'],
      },
    ],
  },
  requiresSearch: true,
  responseHandler: 'none',
  hierarchicalData: () => {
    return true;
  },
};

export default VIS_DEFINITION;
