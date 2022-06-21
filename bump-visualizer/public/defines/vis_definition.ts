import { AggGroupNames } from '../../../../src/plugins/data/public';
import { i18n } from '@kbn/i18n';
import { VIS_EVENT_TO_TRIGGER } from '../../../../src/plugins/visualizations/public';
import { BumpVisualizerOptions } from '../components/Options';
import toExpressionAst from './ast';

// Definition context for the visualizer plugin
const VIS_DEFINITION = {
  name: 'bumpVisualizer',
  title: i18n.translate('bumpVisualizer.visTitle', {
    defaultMessage: 'Bump Chart',
  }),
  description: i18n.translate('bumpVisualizer.visDescription', {
    defaultMessage:
      'Display ranked data over time in a bump chart.',
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
    optionsTemplate: BumpVisualizerOptions,
    schemas: [
      {
        group: AggGroupNames.Metrics,
        title: i18n.translate('visTypeBump.bump.metricTitle', { defaultMessage: 'Value' }),
        name: 'metric',
        aggFilter: ['count'],
        min: 1,
        max: 1,
        defaults: [{ schema: 'metric', type: 'count' }],
      },
      {
        group: AggGroupNames.Buckets,
        title: i18n.translate('visTypeBump.bump.timeTitle', { defaultMessage: 'Time' }),
        name: 'time',
        min: 1,
        max: 1,
        aggFilter: ['date_histogram'],
        defaults: [{ schema: 'time', type: 'date_histogram' }],
      },
      {
        group: AggGroupNames.Buckets,
        title: i18n.translate('visTypeBump.bump.groupingTitle', { defaultMessage: 'Grouping' }),
        name: 'grouping',
        min: 1,
        max: 1,
        aggFilter: ['terms'],
      },
    ],
  },
  requiresSearch: true,
  responseHandler: 'none',
  hierarchicalData: () => true,
};

export default VIS_DEFINITION;
