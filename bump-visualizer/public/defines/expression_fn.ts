import { i18n } from '@kbn/i18n';

import { BumpExpressionFunctionDefinition } from './ast';
import { getVisData } from './ast';

const EXP_DEFINITION: BumpExpressionFunctionDefinition = {
  name: 'bump',
  type: 'render',
  help: i18n.translate('visTypeBump.function.help', {
    defaultMessage: 'Bump visualization',
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
      as: 'bump',
      value: {
        visData: { ...input, aggs: visData.aggs },
        visParams: JSON.parse(args.visParams!),
      },
    };
  },
};

export default EXP_DEFINITION;
