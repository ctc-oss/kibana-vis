import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EuiButtonEmpty, EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { ResponsiveLine } from '@nivo/line';
import { difference, isEqual, merge, pickBy, toArray } from 'lodash';
import styled from 'styled-components';
import {
  allItemsVisible,
  buildLegendModel,
  CheckboxLegend,
  filterLegendModel,
  LegendRecord,
} from '@kibana-enhanced-vis/legend';
import buildGraphData, { KibanaData, Graph } from '@kibana-enhanced-vis/data-builder';
import { fetchQuery } from '@kibana-enhanced-vis/drilldown';

import {
  buildLineData,
  COLOR_PALETTES,
  Point,
  LineParams,
  queryMap,
  RegressionLayer,
  saveAsSVG,
  updateLineOpacity,
} from '../defines/line';
import { SecondaryData } from './SecondaryTable';
import { TableView } from './TableView';

// Tooltip for format strings (bucket labels)
const tooltip = `Prefixes use the following syntax: <prefix>{{value}}
- <prefix> is any prefix string
Suffixes use the following syntax: {{value}}<suffix>
- <suffix> is any suffix string
Finally, use the following syntax to specify non-zero/zero or true/false replacements for a bucket value:
- {{#unless value}}<zero>{{/unless}}
- {{#if value}}<non_zero>{{else}}<zero>{{/if}}

Template structure must be Mustache compatible`;

interface GraphAreaProps {
  showValues: boolean;
  regStroke: string;
  isRendered: boolean;
  animate: boolean;
  pointRadius: string;
}

export const GraphArea = styled.div<GraphAreaProps>`
  width: 860px;
  height: 540px;

  text {
    font-weight: 550;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
      sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol' !important;
  }

  path {
    opacity: 0;
    ${(props) =>
      props.isRendered
        ? 'animation: fadeIn 0.2s linear forwards'
        : 'animation: fill 2.5s ease-out forwards 0.5s'};
    ${(props) => (!props.animate ? 'animation: none; opacity: 1;' : '')}
  }

  circle[r='${(props) => props.pointRadius}'] :not(circle[cx='8']) {
    opacity: 0;
    ${(props) =>
      props.isRendered
        ? 'animation: fadeIn 0.2s ease-in forwards;'
        : 'animation: fadeIn 2s ease-in forwards 1.1s;'}
    ${(props) => (!props.animate ? 'animation: none; opacity: 1' : '')}
  }

  path#regressionLine {
    stroke: ${(props) => props.regStroke};
    stroke-dashoffset: 560;
    stroke-dasharray: ${new Array(56).join('10, 5 ')};
    animation: fillDashed 2.5s ease-out forwards 1s;
    ${(props) => (!props.animate ? 'animation: none; stroke-dashoffset: 0;' : '')}
  }

  @keyframes fill {
    from {
      stroke-dashoffset: 1;
    }
    to {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  @keyframes fillDashed {
    from {
      stroke-dashoffset: 560;
    }
    to {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  div[style*='box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 2px'] {
    opacity: 1;
    animation: fadeIn 0.18s ease-in-out;
    display: ${(props) => (props.showValues ? 'default' : 'none')};
    border-radius: 8px !important;
    background: rgba(0, 0, 0, 0.85) !important;
    color: white !important;

    span[style*='background'] {
      width: 14px !important;
      height: 14px !important;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

export const GraphGroup = styled.div`
  margin: 0 auto;
  overflow: hidden;
  overflow-x: hidden;
  background-color: #fff;

  &:focus {
    outline: 0 none !important;
  }

  &:focus-visible {
    outline: 0 none !important;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  height: 40px;
`;

let lastBucketCount = -1;
const handleBucketAreaClick = (event: any) => {
  const bucketCategories = event.currentTarget;
  const bucketCustomLabels = bucketCategories.querySelectorAll('[data-test-subj$="customLabel"]');

  if (bucketCustomLabels.length !== lastBucketCount) {
    bucketCustomLabels.forEach((el: Element) => {
      el.setAttribute('title', tooltip);
    });

    lastBucketCount = bucketCustomLabels.length;
  }
};

const WaitingForData = (
  <div style={{ marginTop: 20, textAlign: 'center' }}>
    <EuiEmptyPrompt
      title={<h2>No data found</h2>}
      body="Please change your data configuration, select another date/time range, or try a different query."
    />
  </div>
);

let tooltipRef: Graph;

const changeTooltipEvent = () => {
  const tooltip = document.querySelector(
    "div[style*='box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 2px']"
  );

  if (tooltip === null) {
    return;
  }

  const valueOfDiv = (tooltip.children[0] as HTMLElement)?.innerText;
  const strippedValue = valueOfDiv.substring(3, valueOfDiv.indexOf(','));

  if (tooltip.children.length > 1) {
    tooltip.removeChild(tooltip.children[tooltip.children.length - 1]);
  }

  const average =
    tooltipRef.data
      .map((d) => d.data.filter((v: Point) => v.x === strippedValue))
      .flat()
      .reduce((prev, val) => prev + val.y, 0) / tooltipRef.keys.length;

  const divWrapper = document.createElement('div');
  divWrapper.style.paddingTop = '0.25em';
  divWrapper.style.textAlign = 'center';
  divWrapper.style.width = '100%';

  const avg = document.createElement('span');
  avg.innerText = 'avg: ';
  avg.style.display = 'inline';

  const strong = document.createElement('strong');
  strong.innerText = Number(average).toFixed(3).toString();
  avg.appendChild(strong);
  divWrapper.appendChild(avg);
  tooltip.appendChild(divWrapper);
};

const GraphCanvas = ({ visData, visParams }: { visData: KibanaData; visParams: LineParams }) => {
  const [legend, setLegend] = useState<LegendRecord>({});
  const [currentParams, setCurrentParams] = useState<LineParams>({
    colorScheme: '20colordistinct',
    curveType: 'linear',
    enableArea: false,
    decimalCount: 3,
    lineWidth: 3,
    lineOfBestFit: false,
    pointBorderWidth: 3,
    enablePoints: true,
    enablePointLabel: false,
    pointSize: 10,
    showValues: true,
    pointColor: '#ffffff',
    regLineColor: '#ff0000',
    legendAlignment: 'right',
    animate: false,
    includedKeys: '',
  });
  const [graph, setGraph] = useState<Graph>({} as Graph);
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [lastHiddenKeys, setLastHiddenKeys] = useState<string[]>([]);
  const [newKeyLen, setNewKeyLen] = useState(0);
  const [fullyRendered, setFullyRendered] = useState(false);
  const [queryResults, setQueryResults] = useState([]);
  const [dataGridView, setDataGridView] = useState(false);
  const [lastVisData, setLastVisData] = useState({} as KibanaData);
  const [secondaryView, setSecondaryView] = useState(false);
  const [secondaryData, setSecondaryData] = useState({} as SecondaryData);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const setPageIndex = useCallback(
    (pageIndex: number) => setPagination({ ...pagination, pageIndex }),
    [pagination, setPagination]
  );
  const setPageSize = useCallback(
    (pageSize: number) => setPagination({ ...pagination, pageSize, pageIndex: 0 }),
    [pagination, setPagination]
  );

  useEffect(() => {
    // Merge parameters if they have changed in the Options pane
    if (visParams) setCurrentParams(merge(currentParams, visParams));
  }, [currentParams, visParams]);

  useEffect(() => {
    queryMap.clear();
    setFullyRendered(false);
    const bucketCategories = document.querySelectorAll(
      '[data-rbd-droppable-id="agg_group_dnd_buckets"]'
    )[0];
    bucketCategories?.addEventListener('click', handleBucketAreaClick);

    const canvas = document.querySelector('.visualization') as HTMLElement;
    canvas!.style.overflowX = 'hidden';
    canvas?.addEventListener('mousemove', changeTooltipEvent);

    // Reset SVG trickery (line drawing effect) so that lines do not re-render as dashed
    setTimeout(() => {
      const paths = document.querySelectorAll('#graphObject path:not(#regressionLine)');
      paths.forEach((p) => {
        p.setAttribute('pathLength', '1');
        p.setAttribute('stroke-dasharray', '1');
      });
    }, 10);

    setTimeout(() => {
      setFullyRendered(true);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isEqual(visData, lastVisData) && dataGridView) {
      // Exit data grid view if Datatable has changed
      // (table might need re-fetched for updated results)
      setDataGridView(false);
      setLastVisData(visData);
      setQueryResults([]);
    }
    if (visData.aggs) {
      // Build up a structure to use w/ the radar chart
      setGraph(buildGraphData(visData, buildLineData));
    }
  }, [visData]);

  useEffect(() => {
    if (!isEqual(hiddenKeys, lastHiddenKeys)) {
      setGraph(buildGraphData(visData, buildLineData));
      setLastHiddenKeys(hiddenKeys);
    }
  }, [hiddenKeys, lastHiddenKeys, visData]);

  useEffect(() => {
    const currentColorScheme = COLOR_PALETTES.find((cs) => cs.value === currentParams.colorScheme);

    // Rebuild legend on color-scheme change
    if (currentColorScheme !== undefined && Object.keys(graph).length > 0) {
      setNewKeyLen(graph.keys.length);
      setLegend(buildLegendModel(graph.keys, currentColorScheme.palette));
    }
  }, [visData.aggs, visParams, currentParams.colorScheme, graph]);

  useEffect(() => {
    if (Object.keys(graph).length > 0) {
      const tempGraph = graph;
      const tempKeys = hiddenKeys;
      if (filterLegendModel(tempKeys, legend)) {
        // Filter new hidden keys out of the graph
        const newGraph = buildGraphData(visData, buildLineData);
        tempGraph.keys = difference(newGraph.keys, tempKeys);
        tempGraph.data = toArray(
          pickBy(newGraph.data, (value) => tempGraph.keys.find((k) => k === value.id) !== undefined)
        );

        setGraph(tempGraph);
        setHiddenKeys(tempKeys);
        setNewKeyLen(tempGraph.keys.length);
      }
    }
  }, [legend, graph, hiddenKeys, visData]);

  useEffect(() => {
    // If there are no new hidden keys, and the old hidden length is equal to graph key length,
    // "Show All" was checked
    if (hiddenKeys.length > 0 && allItemsVisible(legend)) {
      const newGraph = buildGraphData(visData, buildLineData);
      setGraph(newGraph);
      setNewKeyLen(newGraph.keys.length);
      setHiddenKeys([]);
    }

    // Remove invalid layers from queryResults if legend changes
    for (const qr of queryResults) {
      const key = qr.key;
      if (legend[key] === undefined) {
        setQueryResults(queryResults.filter((res) => res.key !== key));
        break;
      }
    }
  }, [legend, hiddenKeys.length, visData]);

  const leftAligned = currentParams.legendAlignment === 'left';

  useEffect(() => {
    tooltipRef = graph;
  }, [graph]);

  const chart = useMemo(
    () => (
      <GraphArea
        id="graphObject"
        showValues={currentParams.showValues}
        regStroke={currentParams.regLineColor}
        isRendered={fullyRendered}
        animate={currentParams.animate}
        pointRadius={(currentParams.pointSize / 2).toString()}
      >
        <ResponsiveLine
          curve={currentParams.curveType}
          data={graph.data}
          enableArea={currentParams.enableArea}
          areaOpacity={0.25}
          lineWidth={currentParams.lineWidth}
          colors={({ id }: { id: string }) => legend[id]?.color || 'rgba(0,0,0,0)'}
          margin={{ top: 80, right: 140, bottom: 80, left: 160 }}
          pointColor={
            currentParams.pointColor === 'inherit' ? { from: 'color' } : currentParams.pointColor
          }
          pointBorderColor={{ from: 'serieColor' }}
          pointBorderWidth={currentParams.pointBorderWidth}
          enablePoints={currentParams.enablePoints}
          enablePointLabel={currentParams.enablePointLabel}
          pointSize={currentParams.pointSize}
          useMesh
          enableCrosshair
          isInteractive
          axisBottom={{
            tickRotation: -30,
          }}
          yFormat={`>-.${currentParams.decimalCount}~f`}
          motionConfig="stiff"
          layers={
            currentParams.lineOfBestFit
              ? [
                  'grid',
                  'markers',
                  'areas',
                  RegressionLayer,
                  'crosshair',
                  'lines',
                  'axes',
                  'points',
                  'mesh',
                ]
              : ['grid', 'markers', 'areas', 'crosshair', 'lines', 'axes', 'points', 'mesh']
          }
        />
      </GraphArea>
    ),
    [newKeyLen, graph, currentParams, legend, visData]
  );

  const dataPopulated =
    (graph.data && graph.data.length > 0 && graph.keys && graph.keys.length > 0) ||
    Object.keys(legend).length > 0;

  const dataGrid = useMemo(
    () => (
      <TableView
        graph={graph}
        legend={legend}
        includedKeys={currentParams.includedKeys}
        pagination={pagination}
        queryResults={queryResults}
        secondaryData={secondaryData}
        secondaryView={secondaryView}
        setDataGridView={setDataGridView}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        setQueryResults={setQueryResults}
        setSecondaryData={setSecondaryData}
        setSecondaryView={setSecondaryView}
      />
    ),
    [dataGridView, secondaryView, queryResults, pagination]
  );

  const legendPanel =
    dataPopulated && currentParams.legendAlignment !== 'off' ? (
      <CheckboxLegend
        legendModel={legend}
        onLegendItemChecked={({ key, checked }) =>
          setLegend((prev) => ({
            ...prev,
            [key]: { ...prev[key], checked },
          }))
        }
        colorScheme={currentParams.colorScheme}
        isLeftAligned={leftAligned}
        dotColor={currentParams.dotColor ?? '#ffffff'}
        onMouseEnter={updateLineOpacity.bind(null, true)}
        onMouseLeave={updateLineOpacity.bind(null, false)}
      />
    ) : null;

  const saveAsImg = dataPopulated ? (
    <>
      <ButtonGroup id="btnGroup">
        <div>
          <EuiButtonEmpty
            iconType="image"
            color="primary"
            aria-label="Save as SVG"
            onClick={saveAsSVG}
            size="s"
          >
            Save as SVG
          </EuiButtonEmpty>
        </div>
        {graph.keys && graph.keys.length && currentParams.includedKeys.length ? (
          <div>
            <EuiButtonEmpty
              iconType={graph.keys.length > 1 ? 'aggregate' : 'inspect'}
              color="primary"
              aria-label="Compare layers"
              id="cmpLayers"
              size="s"
              onClick={() => {
                const values = [];
                graph?.keys?.forEach((vk: string) =>
                  fetchQuery({ query: queryMap.get(vk), key: vk }, (data) => {
                    values.push({ results: data.results.hits.hits, key: data.key });
                    setQueryResults([...values]);
                  })
                );

                setDataGridView(true);
              }}
            >
              {graph.keys.length > 1 ? 'Compare Selected' : 'View Layer Data'}
            </EuiButtonEmpty>
          </div>
        ) : null}
      </ButtonGroup>
      <EuiSpacer size="xs" />
    </>
  ) : null;

  const leftComponent = leftAligned ? legendPanel : chart;

  // Render Radar and Filter Panel:
  return (
    <GraphGroup
      onKeyDown={(e: any) => {
        // Shift + P
        if (e.key === 'P') {
          saveAsSVG();
        }
      }}
      tabIndex={-1}
    >
      {dataPopulated ? (
        dataGridView ? (
          <>{dataGrid}</>
        ) : (
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              {leftComponent === legendPanel ? saveAsImg : null}
              {leftComponent}
              <EuiSpacer size="xl" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {leftComponent !== legendPanel ? saveAsImg : null}
              {!leftAligned ? legendPanel : chart}
            </EuiFlexItem>
          </EuiFlexGroup>
        )
      ) : (
        WaitingForData
      )}
    </GraphGroup>
  );
};

export default GraphCanvas;
