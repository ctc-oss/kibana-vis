import type { PluginInitializerContext } from 'kibana/server';
import { LineVisualizerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin(initializerContext: PluginInitializerContext) {
  return new LineVisualizerPlugin(initializerContext);
}

export { LineVisualizerPluginSetup, LineVisualizerPluginStart } from './plugin';
