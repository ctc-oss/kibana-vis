import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EuiButtonEmpty, EuiEmptyPrompt, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { ResponsiveRadar } from '@nivo/radar';
import { difference, isEqual, merge } from 'lodash';
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
  buildRadarData,
  COLOR_PALETTES,
  formattedNumber,
  queryMap,
  RadarParams,
  saveAsSVG,
  updateRadarOpacity,
} from '../defines/radar';
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
  tooltipAlignment: string;
  legendAlignment: string;
  fixedTooltip: boolean;
  isRendered: boolean;
  animate: boolean;
  dotRadius: string;
}

export const GraphArea = styled.div<GraphAreaProps>`
  width: 800px;
  height: 600px;

  text {
    font-weight: 550;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
      sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol' !important;
  }

  ${(props) =>
    props.fixedTooltip
      ? `div[style*='z-index: 10'] {
    position: fixed !important;
    transform: translate(0, 0) scale(0.9) !important;
    left: 0 !important;
    right: auto !important;
    bottom: 2% !important;
    top: auto !important;
  }`
      : ''}

  path {
    opacity: 0;
    animation: fill
      ${(props) => (props.isRendered ? '0.5s linear forwards' : '2s ease-out forwards 1.1s')};
    ${(props) => (!props.animate ? 'animation: none; opacity: 1' : '')}
  }

  circle[r='${(props) => props.dotRadius}'] :not(circle[cx='8']) {
    opacity: 0;
    ${(props) =>
      props.isRendered
        ? 'animation: fadeIn 0.2s ease-in forwards;'
        : 'animation: fadeIn 2s ease-in forwards 1.1s;'}
    ${(props) => (!props.animate ? 'animation: none; opacity: 1' : '')}
  }

  circle[fill='none'] {
    opacity: 0;
    stroke-dasharray: 1;
    animation: fill 0.8s linear forwards 0.2s;
    ${(props) => (!props.animate ? 'animation: none; opacity: 1; stroke-dasharray: 0;' : '')}
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

  div[style*='box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 2px'] {
    opacity: 1;
    animation: fadeIn 0.2s ease-in-out;
    padding: 5px 7px !important;
    border-radius: 8px !important;
    transform: ${(props) => {
      if (props.fixedTooltip) {
        return '';
      }

      switch (props.tooltipAlignment) {
        case 'left':
          return 'translate(-65%, 50%)';
        case 'center':
          return 'translateY(10px)';
        case 'right':
          return 'translate(225px, 50%)';
      }
    }};
    text-align: center;
    table {
      text-align: left;
      margin-top: 0.35em;

      span[style*='background'] {
        border: 1px solid rgba(255, 255, 255, 0.5);
      }
    }

    background: rgba(0, 0, 0, 0.88) !important;
    color: white !important;
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

const GraphCanvas = ({ visData, visParams }: { visData: KibanaData; visParams: RadarParams }) => {
  const [legend, setLegend] = useState<LegendRecord>({});
  const [currentParams, setCurrentParams] = useState<RadarParams>({
    colorScheme: '20colordistinct',
    radarShape: 'circular',
    curveType: 'linearClosed',
    gridLevels: 5,
    showValues: true,
    borderWidth: 3,
    dotBorderWidth: 3,
    showDots: true,
    enableDotLabel: false,
    dotSize: 10,
    dotColor: '#ffffff',
    decimalCount: 3,
    legendAlignment: 'right',
    tooltipAlignment: 'center',
    fixedTooltip: false,
    animate: false,
    includedKeys: '',
  });
  const [graph, setGraph] = useState<Graph>({} as Graph);
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [lastHiddenKeys, setLastHiddenKeys] = useState<string[]>([]);
  const [newKeyLen, setNewKeyLen] = useState(0);
  const [fullyRendered, setFullyRendered] = useState(false);
  const [lastVisData, setLastVisData] = useState({} as KibanaData);
  const [queryResults, setQueryResults] = useState([]);
  const [dataGridView, setDataGridView] = useState(false);
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

    setTimeout(() => {
      // Reset SVG trickery (line drawing effect) so that lines do not re-render as dashed
      const paths = document.querySelectorAll('#graphObject path');
      paths.forEach((p) => {
        p.setAttribute('pathLength', '1');
        p.setAttribute('stroke-dasharray', '1');
      });
      const gridLevels = document.querySelectorAll('#graphObject circle[fill="none"]');
      gridLevels.forEach((p) => p.setAttribute('pathLength', '1'));
    }, 10);

    setTimeout(() => {
      setFullyRendered(true);
    }, 3000);
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
      setGraph(buildGraphData(visData, buildRadarData));
    }
  }, [visData]);

  useEffect(() => {
    if (!isEqual(hiddenKeys, lastHiddenKeys)) {
      setGraph(buildGraphData(visData, buildRadarData));
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
        // Filter new hidden layers out of the graph
        const newGraph = buildGraphData(visData, buildRadarData);
        tempGraph.keys = difference(newGraph.keys, tempKeys);
        tempGraph.data = newGraph.data;

        setGraph(tempGraph);
        setHiddenKeys(tempKeys);
        setNewKeyLen(tempGraph.keys.length);
      }
    }
  }, [legend, graph, hiddenKeys, visData]);

  useEffect(() => {
    // If there are no new hidden keys, and the old hidden length
    // is equal to graph key length, "Show All" was checked
    if (hiddenKeys.length > 0 && allItemsVisible(legend)) {
      const newGraph = buildGraphData(visData, buildRadarData);
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

  const chart = useMemo(
    () => (
      <GraphArea
        id="graphObject"
        legendAlignment={currentParams.legendAlignment}
        tooltipAlignment={currentParams.tooltipAlignment}
        fixedTooltip={currentParams.fixedTooltip}
        isRendered={fullyRendered}
        animate={currentParams.animate}
        dotRadius={(currentParams.dotSize / 2).toString()}
      >
        <ResponsiveRadar
          curve={currentParams.curveType}
          data={graph.data}
          indexBy={'metric'}
          keys={graph.keys}
          borderWidth={currentParams.borderWidth ?? 3}
          gridLevels={currentParams.gridLevels ?? 5}
          gridShape={currentParams.radarShape}
          colors={({ key }: { key: string }) => legend[key]?.color || 'rgba(0,0,0,0)'}
          margin={{
            top: 160,
            right: 40,
            bottom: 80,
            left: 40,
          }}
          dotColor={
            currentParams.dotColor
              ? currentParams.dotColor === 'inherit'
                ? { from: 'color' }
                : currentParams.dotColor
              : '#ffffff'
          }
          dotBorderWidth={currentParams.dotBorderWidth ?? 3}
          gridLabelOffset={24}
          enableDots={currentParams.showDots}
          enableDotLabel={currentParams.enableDotLabel}
          dotLabel={(p) => `${formattedNumber(p.value, currentParams.decimalCount)}`}
          dotSize={currentParams.dotSize ?? 10}
          isInteractive={currentParams.showValues}
          tooltipFormat={(value) => formattedNumber(value, currentParams.decimalCount)}
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
        onMouseEnter={updateRadarOpacity.bind(null, true)}
        onMouseLeave={updateRadarOpacity.bind(null, false)}
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
