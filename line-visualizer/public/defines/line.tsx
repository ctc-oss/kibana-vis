import Handlebars from 'handlebars';
import colorString from 'color-string';
import { toSvg } from 'html-to-image';
import { uniq } from 'lodash';
import { line } from 'd3-shape';
import { CustomLayerProps, DatumValue } from '@nivo/line';
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

export interface LineParams {
  colorScheme: string | '20colordistinct';
  curveType:
    | 'step'
    | 'linear'
    | 'basis'
    | 'cardinal'
    | 'catmullRom'
    | 'monotoneX'
    | 'monotoneY'
    | 'natural'
    | 'stepAfter'
    | 'stepBefore'
    | undefined;
  enableArea: boolean | false;
  decimalCount: number | 3;
  lineWidth: number | 3;
  lineOfBestFit: boolean | false;
  pointBorderWidth: number | 3;
  enablePoints: boolean | true;
  enablePointLabel: boolean | false;
  showValues: boolean | true;
  pointSize: number | 10;
  pointColor: string | '#ffffff';
  regLineColor: string | '#ff0000';
  legendAlignment: string | 'right';
  animate: boolean | true;
  includedKeys: string | '';
}

// Json formatter for line graph
interface LineInfo {
  id: string;
  data: any[];
}

export interface Point {
  x: string;
  y: number;
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

/**
 * Performs linear regression on a set of x and y values
 * @param xAxis Set of x values
 * @param yAxis Set of y values
 * @returns A set of y values corresponding to the best fit line for these values
 */
export const linearRegression = (xAxis: number[], yAxis: number[]) => {
  if (xAxis.length <= 0 || yAxis.length <= 0) return [];

  const accumulator = (prev: number, cur: number) => prev + cur;
  const xAvg = xAxis.reduce(accumulator) / xAxis.length;
  const yAvg = yAxis.reduce(accumulator) / yAxis.length;

  let t2 = 0;
  const t1 = xAxis.reduce((prev, cur, i) => {
    const xr = cur - xAvg;
    const yr = yAxis[i] - yAvg;

    t2 += xr * xr;
    return prev + xr * yr;
  });

  const slope = t1 / t2;
  const intercept = yAvg - slope * xAvg;

  return uniq(xAxis).map((x: number) => slope * x + intercept);
};

/**
 * Builds a regression line given a set of values, and returns the corresponding SVG element
 * @param customLayerProps A structure containing the necessary layer information
 * @returns A <path> element plotted along the best fit line for the values provided
 */
export const RegressionLayer = ({ series, xScale, yScale }: CustomLayerProps) => {
  const metrics: (DatumValue | null | undefined)[] = [];

  const data = series
    .map((s) => {
      const res = s.data.map((d) => {
        if (!metrics.find((m) => m === d.data.x)) {
          metrics.push(d.data.x);
        }
        return d;
      });

      return res;
    })
    .flat();

  const xAxis = data.map((d) => d.position.x);
  const yAxis = data.map((d) => d.data.y as number);

  const yReg = linearRegression(xAxis, yAxis);
  if (yReg.length <= 0) return null;

  const finalPoints: [number, number][] = metrics.map((_m, i) => [xAxis[i], yReg[i]!]);

  const lineGenerator = line()
    .x((_d, i) => xScale(metrics[i]))
    .y((d) => yScale(d[1]));

  return (
    <path
      id="regressionLine"
      d={lineGenerator(finalPoints)!}
      fillOpacity={0}
      stroke="#ff0000"
      strokeWidth={3}
    />
  );
};

export const queryMap = new Map<string, string>();

/**
 * Formats Kibana data into a usable structure for the line graph.
 *
 * @param kibanaData The data passed to the formatter by kibana-data-builder
 * @returns The formatted graph structure for nivo/line
 */
export const buildLineData: JsonFormatFn = ({
  vertexData,
  fieldData,
  bucketIDs,
  rows,
  idsOfInterest,
}) => {
  const json: Graph = {
    data: [],
    keys: [],
  };

  const verticesOfInterest = idsOfInterest.map((id) => {
    return vertexData.find((v) => v.id === id);
  });

  json.keys = rows.map((row) => {
    const bucketsToValues: string[] = [];
    const key = bucketIDs
      .map((bucket, i) => {
        const fieldInfo = fieldData.find((f) => f.id === bucket);
        const label = fieldInfo?.name.trim();
        const value = valueFor(row[bucket], fieldInfo);
        bucketsToValues.push(fieldInfo?.srcParams.params.field + ':' + `"${value}"`);

        try {
          if (label!.indexOf('{{') >= 0) return Handlebars.compile(label)({ value: row[bucket] });

          return row[bucket];
        } catch {
          return row[bucket];
        }
      })
      .filter((part) => part) // Remove nulls and empties
      .join('/');

    queryMap.set(key, bucketsToValues.join(' and '));
    const line: LineInfo = { id: key, data: [] };
    line.data = verticesOfInterest.map((vertex) => {
      return { x: vertex!.name, y: row[vertex!.id] };
    });

    json.data.push(line);

    return key;
  });

  return json;
};

/**
 * Updates the line opacity for each layer when highlighted in the legend.
 *
 * @param isEntering Whether the user is entering the layer or exiting
 * @param legendModel The current legend model
 * @param key The specific legend key that is being updated
 * @param dotColor Dot color for the line graph
 * @param colorScheme Current color scheme for the line graph
 */
export const updateLineOpacity = (
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
  let pathsWithFillVal = graphElement.querySelectorAll('[stroke="' + fillValue + '"]');
  if (pathsWithFillVal.length === 0) {
    // In this case, it's the color directly from the legend item
    pathsWithFillVal = graphElement.querySelectorAll('[stroke="' + colorFormat + '"]');
  }

  let filledAreasWithCol = graphElement.querySelectorAll(`path[fill="${fillValue}"]`);
  filledAreasWithCol.forEach((area) => {
    $(area).css('transition', 'fill-opacity 0.1s ease-in-out');
    area.setAttribute('fill-opacity', isEntering ? '0.75' : '0.25');
  });

  const dotCol = dotColor === 'inherit' ? colorFormat : dotColor;

  for (const k of legendKeys) {
    if (k === key) continue;

    const colFormat = legendModel[k].color;
    const colFormatDescriptor = colorString.get(colFormat);
    if (colFormatDescriptor) {
      // Sometimes its rgba, sometimes its hex...
      const fillValue = `rgba(${colFormatDescriptor.value[0]}, ${colFormatDescriptor.value[1]}, ${colFormatDescriptor.value[2]}, 1)`;
      let pathsWithCol = graphElement.querySelectorAll('[stroke="' + fillValue + '"]');
      if (pathsWithCol.length === 0) {
        // In this case, it's the color directly from the legend item
        pathsWithCol = graphElement.querySelectorAll('[stroke="' + colFormat + '"]');
      }
      pathsWithCol.forEach((path) => {
        path.setAttribute('fill-opacity', isEntering ? '0.05' : '1');
        path.setAttribute('stroke-opacity', isEntering ? '0.05' : '1');
      });

      let filledAreasWithCol = graphElement.querySelectorAll(`path[fill="${fillValue}"]`);
      filledAreasWithCol.forEach((area) => {
        area.setAttribute('fill-opacity', isEntering ? '0.05' : '0.25');
      });
    }
  }
};
