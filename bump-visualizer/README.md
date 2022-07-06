# `bump-visualizer`

A React visualization for Kibana - plots data using a bump chart.

## Installation

- Follow the instructions for your Kibana version under [Releases](https://github.com/ctc-oss/kibana-vis/releases).

## Usage

### Configuration

The default color scheme is **20-color (distinct)**. There is a small assortment of color schemes in the Options panel, in case the default color scheme is not preferred. The legend and graph will re-color upon clicking **Update**.

The user can also choose to update the dot size and line width in the Options panel.

## Scripts

<dl>
  <dt><code>yarn kbn bootstrap</code></dt>
  <dd>Execute this to install node_modules and setup the dependencies in your plugin and in Kibana</dd>

  <dt><code>yarn plugin-helpers build</code></dt>
  <dd>Execute this to create a distributable version of this plugin that can be installed in Kibana</dd>
</dl>
