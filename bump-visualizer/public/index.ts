import type { PluginInitializerContext } from 'kibana/server';
import { BumpVisualizerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin(initializerContext: PluginInitializerContext) {
  return new BumpVisualizerPlugin(initializerContext);
}

export { BumpVisualizerPluginSetup, BumpVisualizerPluginStart } from './plugin';
