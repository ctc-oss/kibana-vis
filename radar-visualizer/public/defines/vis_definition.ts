import { AggGroupNames } from '../../../../src/plugins/data/public';
import { i18n } from '@kbn/i18n';
import { VIS_EVENT_TO_TRIGGER } from '../../../../src/plugins/visualizations/public';
import { RadarVisualizerOptions } from '../components/Options';
import toExpressionAst from './ast';

// Definition context for the visualizer plugin
const VIS_DEFINITION = {
  name: 'radarVisualizer',
  title: i18n.translate('radarVisualizer.visTitle', {
    defaultMessage: 'Radar',
  }),
  description: i18n.translate('radarVisualizer.visDescription', {
    defaultMessage:
      'Displays multivariate data in a 2D chart consisting of 3 (or more) variables, plotting polygons from the center point.',
  }),
  getSupportedTriggers: () => {
    return [VIS_EVENT_TO_TRIGGER.filter];
  },
  icon: 'bullseye',
  visConfig: {
    defaults: {},
  },
  toExpressionAst,
  editorConfig: {
    optionsTemplate: RadarVisualizerOptions,
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
