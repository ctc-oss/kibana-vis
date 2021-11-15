# `kibana-enhanced-vis`

Kibana visualization plugins & helper modules.

## Graph Plugins

- **`radar-visualizer:`** Plot multivariate data using a radar chart.
- **`line-visualizer:`** Plot data using a line chart - supports stacked lines.

## Modules

All modules mentioned are used in `radar-visualizer` and `line-visualizer`:

- **`drilldown:`** for building comparison tables ("Compare Layers" and "View Layer Data" features).
- **`legend:`** Customizable legend component made in React.
- **`data-builder:`** Fetches and formats data, given Datatable object from a Kibana plugin.

## Installation (graph plugins)

- First, download the plugin's .zip file for your version of Kibana (see: [Releases](https://github.com/traeok/kibana-enhanced-vis/releases)).
- Next, extract the .zip file into the plugins folder of your Kibana server (`<KIBANA_FOLDER>/plugins`).
- Then, start your Kibana server.
- Done!

---

created by Trae Yelovich // <yelovict@ctc.com>
