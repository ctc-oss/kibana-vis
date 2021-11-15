import type { PluginInitializerContext } from 'kibana/server';
import { RadarVisualizerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin(initializerContext: PluginInitializerContext) {
  return new RadarVisualizerPlugin(initializerContext);
}

export { RadarVisualizerPluginSetup, RadarVisualizerPluginStart } from './plugin';
