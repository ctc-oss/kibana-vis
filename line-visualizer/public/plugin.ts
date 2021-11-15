import { i18n } from '@kbn/i18n';
import type { PluginInitializerContext } from 'kibana/server';
import { CoreSetup, Plugin } from '../../../src/core/public';
import { VisualizationsSetup } from '../../../src/plugins/visualizations/public';
import { Plugin as ExpressionsPlugin } from '../../../src/plugins/expressions/public';
import { DataPublicPluginStart } from '../../../src/plugins/data/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

import LineRenderer from './components/Renderer';
import VIS_DEFINITION from './defines/vis_definition';
import EXP_DEFINITION from './defines/expression_fn';

export interface LineVisualizerPluginSetup {
  getGreeting: () => string;
}

export interface LineVisualizerPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

export interface LineVisualizerSetupDeps {
  expressions: ReturnType<ExpressionsPlugin['setup']>;
  visualizations: VisualizationsSetup;
}

export class LineVisualizerPlugin
  implements Plugin<LineVisualizerPluginSetup, LineVisualizerPluginStart>
{
  context: PluginInitializerContext;

  constructor(initContext: PluginInitializerContext) {
    this.context = initContext;
  }

  public setup(
    _core: CoreSetup,
    { expressions, visualizations }: LineVisualizerSetupDeps
  ): LineVisualizerPluginSetup {
    // Create the necessary visualization data for Kibana
    expressions.registerFunction(EXP_DEFINITION);
    expressions.registerRenderer(LineRenderer);
    visualizations.createBaseVisualization(VIS_DEFINITION);

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('LineVisualizer.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: 'lineVisualizer',
          },
        });
      },
    };
  }

  public start() {
    return {};
  }

  public stop() {}
}
