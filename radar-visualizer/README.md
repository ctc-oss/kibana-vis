# `radar-visualizer`

A React visualization for Kibana - plots data using a Radar chart.
**3** or more metrics are required for data to be accurately visualized.

## Installation

- First, download the plugin's .zip file for your version of Kibana (see: [Releases](https://github.com/ctc-oss/kibana-vis/releases)).
- Next, extract the .zip file into the plugins folder of your Kibana server (`<KIBANA_FOLDER>/plugins`).
- Then, start your Kibana server.
- Done!

## Usage

### Taking Screenshots

To take a snapshot of the current state of the graph, press Shift + P or click "Save As SVG" above the legend.
It will generate an SVG file containing the current state and prompt a download to your device.

### Configuration

The default color scheme is **20-color (distinct)**. There is a small assortment of color schemes in the Options panel, in case the default color scheme is not preferred. The legend and graph will re-color upon clicking **Update**.

The user can also choose to update the dot size, grid level count, radar shape (circular/linear) and more in the Options panel.

### Customizing Buckets w/ Templates (Handlebars)

Custom labels are utilized in the plugin as a way to associate prefixes, suffixes, and binary values with each bucket. For example, if a bucket consists of number-only values, it might help to use a suffix for the bucket - this will allow for a more readable and digestible legend. This plugin uses Handlebars to parse the template provided in each custom label.

- **Prefixes**

  `<prefix>{{value}}`

  - With `<prefix>` being the desired prefix for each bucket's value: (e.g., `mode{{value}}` will show modeX, modeY, modeZ, etc.)

- **Suffixes**

  `{{value}}<suffix>`

  - With `<suffix>` being the desired suffix for each bucket's value (e.g., `{{value}}batch` will show 100batch, 128batch, etc.)

- **Binary Option**

  `{{#unless value}}<zero>{{/unless}}`

  `{{#if value}}<non_zero>{{else}}<zero>{{/if}}`

  - With the binary option, there are two possible choices - the unless template, and the if/else template. The unless template will return the `<zero>` string if `value` returns a falsy value (0, null, undefined, etc.).
  - `<zero>` represents the text that will replace the value when `value === 0`.
  - `<non_zero>` represents the text that will replace the value when `value !== 0`.

### Multiple buckets

**NOTE**: For multiple buckets, the bucket at the _top_ of the list is considered to be the beginning of the string for each item in the legend. Conversely, the _last_ bucket in the list will be the terminating string for each item in the legend.

---

## Scripts

<dl>
  <dt><code>yarn kbn bootstrap</code></dt>
  <dd>Execute this to install node_modules and setup the dependencies in your plugin and in Kibana</dd>

  <dt><code>yarn plugin-helpers build</code></dt>
  <dd>Execute this to create a distributable version of this plugin that can be installed in Kibana</dd>
</dl>
