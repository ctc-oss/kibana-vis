import { euiPaletteColorBlind } from '@elastic/eui/lib/services';
import { Graph, KibanaData } from '@kibana-enhanced-vis/data-builder';

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

export interface BumpParams {
  colorScheme: string | '10color';
  curveType: string | 'linear';
  lineWidth: number | 3;
  pointSize: number | 10;
  pointBorderWidth: number | 3;
}

export const queryMap = new Map<string, string>();
export const buildBumpData = ({ rows, aggs }: KibanaData): Graph => {
  const json: Graph = {
    data: [],
    keys: [],
  };

  const metricId = aggs.aggs.find((x) => x.schema === 'metric')?.id;
  const groupingId = aggs.aggs.find((x) => x.schema === 'grouping')?.id;
  const timeId = aggs.aggs.find((x) => x.schema === 'time')?.id;

  if (!metricId || !groupingId || !timeId) return json;

  const timeColId = `col-0-${timeId}`;
  const groupColId = `col-${timeId}-${groupingId}`;
  const valueColId = `col-${groupingId}-${metricId}`;

  const timeBuckets = Array.from(new Set<string>(rows.map((x) => x[timeColId])));
  const compareValues = (one: any, two: any) => (one > two ? 1 : two > one ? -1 : 0);
  const rankedByBucket = timeBuckets.reduce(
    (all, x) => ({
      ...all,
      [x]: rows
        .filter((r) => r[timeColId] == x)
        .sort((a, b) => compareValues(a[valueColId], b[valueColId]))
        .map((y) => y[groupColId]),
    }),
    {}
  );

  json.keys = Array.from(new Set<string>(rows.map((x) => x[groupColId])));
  json.data = json.keys.map((id) => {
    const _data = rows
      .filter((x) => x[groupColId] === id)
      .map((d) => ({ x: d[timeColId], y: rankedByBucket[d[timeColId]].indexOf(id) + 1 }));
    return { id, data: _data };
  });

  return json;
};
