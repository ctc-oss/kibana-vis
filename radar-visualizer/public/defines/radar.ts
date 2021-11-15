import Handlebars from 'handlebars';
import { uniqBy } from 'lodash';
import colorString from 'color-string';
import { toSvg } from 'html-to-image';
import $ from 'jquery';

import { euiPaletteColorBlind } from '@elastic/eui/lib/services';

import { Graph, JsonFormatFn } from '@kibana-enhanced-vis/data-builder';
import { LegendItem } from '@kibana-enhanced-vis/legend';

export const COLOR_PALETTES = [
  {
    value: '10color',
    title: '10-color',
    palette: euiPaletteColorBlind(),
  },
  {
    value: '20color',
    title: '20-color',
    palette: euiPaletteColorBlind({ rotations: 2 }),
  },
  {
    value: '30color',
    title: '30-color',
    palette: euiPaletteColorBlind({ rotations: 3 }),
  },
  {
    value: '20colordistinct',
    title: '20-color (distinct)',
    palette: euiPaletteColorBlind({ rotations: 2, order: 'group', direction: 'both' }),
  },
  {
    value: '30colordistinct',
    title: '30-color (distinct)',
    palette: euiPaletteColorBlind({ rotations: 3, order: 'group', direction: 'both' }),
  },
];

export interface RadarParams {
  colorScheme: string | '20colordistinct';
  radarShape: 'circular' | 'linear' | undefined;
  curveType: string | undefined;
  gridLevels: number | undefined;
  showValues: boolean | undefined;
  borderWidth: number | undefined;
  dotBorderWidth: number | undefined;
  dotSize: number | 10;
  dotColor: string | undefined;
  showDots: boolean | undefined;
  enableDotLabel: boolean | false;
  decimalCount: number | undefined;
  legendAlignment: string | 'right';
  tooltipAlignment: string | 'center';
  fixedTooltip: boolean | false;
  animate: boolean | true;
  includedKeys: string | '';
}

export const formattedNumber = (val: number, toCount?: number) =>
  Number(val)
    .toFixed(toCount ?? 3)
    .replace(/\.?0+$/, '');

/**
 * Saves the current visualization state as an SVG file, locally downloading the image.
 * (using html-to-image)
 */
export const saveAsSVG = () => {
  const canvas = document.querySelector('.visEditor__visualization__wrapper');
  toSvg(canvas! as HTMLElement, {
    filter: (e) => {
      return e.id !== 'btnGroup' && e.id !== 'backToVis';
    },
  }).then((dataUrl) => {
    const link = document.createElement('a');
    link.download = 'graph-snapshot.svg';
    link.href = dataUrl;
    link.click();
  });
};

const valueFor = (value: string | number, fieldParams: any) => {
  const fieldType = fieldParams.type;

  const falsyValue = () => {
    switch (fieldType) {
      case 'boolean':
        return 'false';
      case 'string':
        return '';
      default:
        return '';
    }
  };

  if (value === null || value === undefined) return falsyValue();

  switch (fieldType) {
    case 'boolean':
      return Boolean(value ?? false).toString();
    case 'number':
      return isNaN(value) || typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
    case 'string':
      return value ?? '';
    default:
      return '';
  }
};

export const queryMap = new Map<string, string>();

/**
 * Builds the structure for the radar chart in the format:
 * { metric: 'metric_name', bucket_val0: ..., bucket_val1: ..., bucket_val{n}: ... }
 *
 * @param kibanaData The data structure passed in by kibana-data-builder
 * @returns The formatted graph structure for nivo/radar
 */
export const buildRadarData: JsonFormatFn = ({
  vertexData,
  fieldData,
  bucketIDs,
  rows,
  idsOfInterest,
}) => {
  const json: Graph = {
    keys: [],
    data: [],
  };

  json.data = uniqBy(
    vertexData.map((v) => ({ metric: v.name })),
    'metric'
  );

  json.keys = rows.map((row) => {
    const bucketsToValues: string[] = [];
    const key = bucketIDs
      .map((bucket) => {
        const fieldInfo = fieldData.find((f) => f.id === bucket);

        const label = fieldInfo?.name.trim();
        const value = valueFor(row[bucket], fieldInfo);
        bucketsToValues.push(fieldInfo?.srcParams.params.field + ':' + `"${value}"`);

        try {
          if (label!.indexOf('{{') >= 0) {
            return Handlebars.compile(label)({ value: row[bucket] });
          }

          return row[bucket];
        } catch {
          return row[bucket];
        }
      })
      .filter((part) => part) // Remove nulls and empties
      .join('/');

    queryMap.set(key, bucketsToValues.join(' and '));

    json.data = json.data.map((x, i) => ({
      ...x,
      [key]: row[idsOfInterest[i]],
    }));

    return key;
  });

  return json;
};

/**
 * Updates the radar opacity for each layer when highlighted in the legend.
 *
 * @param isEntering Whether the user is entering the layer or exiting
 * @param legendModel The current legend model
 * @param key The specific legend key that is being updated
 * @param dotColor Dot color for the radar
 * @param colorScheme Current color scheme for the radar
 */
export const updateRadarOpacity = (
  isEntering: boolean,
  legendModel: Record<string, LegendItem>,
  key: string,
  dotColor: string,
  colorScheme: string
) => {
  const colorFormat = legendModel[key].color;
  const colorDescriptor = colorString.get(colorFormat);
  if (colorDescriptor === null) return;

  const legendKeys = Object.keys(legendModel);
  const colors = COLOR_PALETTES.find((cs) => cs.value === colorScheme)?.palette;
  if (colors === undefined || legendKeys.length > colors.length) return;

  const graphElement = document.getElementById('graphObject')!;

  // Initially interpret as rgba (as per nivo/radar formatting)
  const fillValue = `rgba(${colorDescriptor.value[0]}, ${colorDescriptor.value[1]}, ${colorDescriptor.value[2]}, 1)`;

  // Get the SVG <path>s for this layer and increase the fill opacity
  let pathsWithFillVal = graphElement.querySelectorAll('path[fill="' + fillValue + '"]');
  if (pathsWithFillVal.length === 0) {
    // In this case, it's the color directly from the legend item
    pathsWithFillVal = graphElement.querySelectorAll('path[fill="' + colorFormat + '"]');
  }

  pathsWithFillVal.forEach((path) => {
    $(path).css('transition', 'fill-opacity 0.1s ease-in-out, stroke-opacity 0.1s ease-in-out');
    path.setAttribute('fill-opacity', isEntering ? '0.75' : '0.25');
  });

  const dotCol = dotColor === 'inherit' ? colorFormat : dotColor;

  const query =
    dotColor === 'inherit'
      ? `circle:not([fill="${dotCol}"]):not([fill="none"])`
      : `circle[fill="${dotCol}"]:not([stroke="${colorFormat}"])`;

  const dots = graphElement.querySelectorAll(query);
  dots.forEach((dot) => {
    $(dot).css('transition', 'fill-opacity 0.1s ease-in-out, stroke-opacity 0.1s ease-in-out');
    dot.setAttribute('fill-opacity', isEntering ? '0.05' : '1.0');
    dot.setAttribute('stroke-opacity', isEntering ? '0.05' : '1.0');
  });

  for (const k of legendKeys) {
    if (k === key) continue;

    const colFormat = legendModel[k].color;
    const colFormatDescriptor = colorString.get(colFormat);
    if (colFormatDescriptor) {
      // Sometimes its rgba, sometimes its hex...
      const fillValue = `rgba(${colFormatDescriptor.value[0]}, ${colFormatDescriptor.value[1]}, ${colFormatDescriptor.value[2]}, 1)`;
      let pathsWithCol = graphElement.querySelectorAll('path[fill="' + fillValue + '"]');
      if (pathsWithCol.length === 0) {
        // In this case, it's the color directly from the legend item
        pathsWithCol = graphElement.querySelectorAll('path[fill="' + colFormat + '"]');
      }
      pathsWithCol.forEach((path) => {
        path.setAttribute('fill-opacity', isEntering ? '0.05' : '0.25');
        path.setAttribute('stroke-opacity', isEntering ? '0.05' : '1');
      });
    }
  }
};
