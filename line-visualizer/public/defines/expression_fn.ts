import { i18n } from '@kbn/i18n';

import { LineExpressionFunctionDefinition } from './ast';
import { getVisData } from './ast';

const EXP_DEFINITION: LineExpressionFunctionDefinition = {
  name: 'line',
  type: 'render',
  help: i18n.translate('visTypeRadar.function.help', {
    defaultMessage: 'Line visualization',
  }),
  inputTypes: ['datatable'],
  args: {
    visParams: {
      types: ['string', 'null'],
      help: '',
    },
  },
  async fn(input, args) {
    const visData = getVisData();
    return {
      type: 'render',
      as: 'line',
      value: {
        visData: { ...input, aggs: visData.aggs },
        visParams: JSON.parse(args.visParams!),
      },
    };
  },
};

export default EXP_DEFINITION;
