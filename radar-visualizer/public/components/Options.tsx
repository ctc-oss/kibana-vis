import React, { useEffect, useMemo, useState } from 'react';
import {
  EuiBadge,
  EuiButton,
  EuiButtonGroup,
  EuiCheckbox,
  EuiColorPalettePicker,
  EuiDraggable,
  EuiDroppable,
  EuiDragDropContext,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiHorizontalRule,
  EuiIcon,
  EuiLoadingChart,
  EuiPanel,
  EuiRange,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
  euiDragDropMove,
  euiDragDropReorder,
  htmlIdGenerator,
} from '@elastic/eui';
import { difference, isEmpty, toNumber } from 'lodash';
import $ from 'jquery';
import { VisEditorOptionsProps } from '../../../../src/plugins/visualizations/public';
import { COLOR_PALETTES, queryMap } from '../defines/radar';
import { fetchQuery } from '@kibana-enhanced-vis/drilldown';
import styled from 'styled-components';

const FullBadge = styled(EuiBadge)`
  width: 100% !important;
`;

const radarShapeOpts = [
  {
    value: 'circular',
    text: 'Circular',
  },
  {
    value: 'linear',
    text: 'Linear',
  },
];

const radarCurveOpts = [
  {
    value: 'linearClosed',
    text: 'Linear',
  },
  {
    value: 'basisClosed',
    text: 'Basis',
  },
  {
    value: 'cardinalClosed',
    text: 'Cardinal',
  },
  {
    value: 'catmullRomClosed',
    text: 'Catmull',
  },
];

const dotColorOpts = [
  {
    value: '#ffffff',
    text: 'White',
  },
  {
    value: '#000000',
    text: 'Black',
  },
  {
    value: 'inherit',
    text: 'Inherit',
  },
];

export interface StateParamsObject {
  colorScheme: string;
  curveType: string | undefined;
  radarShape: string | undefined;
  gridLevels: string | number;
  showValues: boolean | undefined;
  fixedTooltip: boolean | undefined;
  borderWidth: string | number;
  dotBorderWidth: string | number;
  showDots: boolean | undefined;
  enableDotLabel: boolean | undefined;
  dotSize: string | number;
  dotColor: string | undefined;
  decimalCount: string | number;
  legendAlignment: string | undefined;
  tooltipAlignment: string | undefined;
  animate: boolean | undefined;
  queryExclude: string | undefined;
  drilldownVisType: string | undefined;
  includedKeys: string | undefined;
}

// Options panel to the right-hand side of the visualization
// There aren't any settings at the moment, but this may change in the future.
export const RadarVisualizerOptions = ({
  stateParams,
  setValue,
}: VisEditorOptionsProps<StateParamsObject>) => {
  const [queryKeys, setQueryKeys] = useState([]);
  const [colorScheme, setColorScheme] = useState(
    stateParams.hasOwnProperty('colorScheme') && !isEmpty(stateParams.colorScheme)
      ? stateParams.colorScheme
      : '20colordistinct'
  );
  const [curveType, setCurveType] = useState(
    stateParams.hasOwnProperty('curveType') && !isEmpty(stateParams.curveType)
      ? stateParams.curveType
      : 'linearClosed'
  );

  const [radarShape, setRadarShape] = useState(
    stateParams.hasOwnProperty('radarShape') ? stateParams.radarShape : 'circular'
  );
  const [gridLevels, setGridLevels] = useState(
    stateParams.hasOwnProperty('gridLevels') ? stateParams.gridLevels : '5'
  );
  const [showValues, setShowValues] = useState(
    stateParams.hasOwnProperty('showValues') ? stateParams.showValues : true
  );
  const [showDots, setShowDots] = useState(
    stateParams.hasOwnProperty('showDots') ? stateParams.showDots : true
  );
  const [borderWidth, setBorderWidth] = useState(
    stateParams.hasOwnProperty('borderWidth') ? stateParams.borderWidth : '3'
  );
  const [dotBorderWidth, setDotBorderWidth] = useState(
    stateParams.hasOwnProperty('dotBorderWidth') ? stateParams.dotBorderWidth : '3'
  );
  const [dotColor, setDotColor] = useState(
    stateParams.hasOwnProperty('dotColor') ? stateParams.dotColor : '#ffffff'
  );
  const [dotSize, setDotSize] = useState(
    stateParams.hasOwnProperty('dotSize') ? stateParams.dotSize : '10'
  );
  const [decimalCount, setDecimalCount] = useState(
    stateParams.hasOwnProperty('decimalCount') ? stateParams.decimalCount : '3'
  );
  const [fixedTooltip, setFixedTooltip] = useState(
    stateParams.hasOwnProperty('fixedTooltip') ? stateParams.fixedTooltip : false
  );
  const [enableDotLabel, setEnableDotLabel] = useState(
    stateParams.hasOwnProperty('enableDotLabel') ? stateParams.enableDotLabel : false
  );
  const [animate, setAnimate] = useState(
    stateParams.hasOwnProperty('animate') ? stateParams.animate : false
  );
  const [includedKeys, setIncludedKeys] = useState(
    stateParams.hasOwnProperty('includedKeys') && !isEmpty(stateParams.includedKeys)
      ? stateParams.includedKeys
      : ''
  );

  const colorSchemeChanged = (val: string) => {
    setColorScheme(val);
    setValue('colorScheme', val);
  };

  const curveTypeChanged = (e: any) => {
    setCurveType(e.target.value);
    setValue('curveType', e.target.value);
  };

  const radarShapeChanged = (e: any) => {
    setRadarShape(e.target.value);
    setValue('radarShape', e.target.value);
  };

  const gridLevelsChanged = (e: any) => {
    setGridLevels(e.target.value);
    setValue('gridLevels', toNumber(e.target.value));
  };

  const borderWidthChanged = (e: any) => {
    setBorderWidth(e.target.value);
    setValue('borderWidth', toNumber(e.target.value));
  };

  const dotBorderWidthChanged = (e: any) => {
    setDotBorderWidth(e.target.value);
    setValue('dotBorderWidth', toNumber(e.target.value));
  };

  const dotColorChanged = (e: any) => {
    setDotColor(e.target.value);
    setValue('dotColor', e.target.value);
  };

  const dotSizeChanged = (e: any) => {
    setDotSize(e.target.value);
    setValue('dotSize', toNumber(e.target.value));
  };

  const showValuesChanged = (e: any) => {
    setShowValues(e.target.checked);
    setValue('showValues', e.target.checked);
  };

  const showDotsChanged = (e: any) => {
    setShowDots(e.target.checked);
    setValue('showDots', e.target.checked);
  };

  const decimalCountChanged = (e: any) => {
    setDecimalCount(e.target.value);
    setValue('decimalCount', toNumber(e.target.value));
  };

  const [legendAlignment, setLegendAlignment] = useState(
    stateParams.hasOwnProperty('legendAlignment') && !isEmpty(stateParams.legendAlignment)
      ? stateParams.legendAlignment
      : 'right'
  );

  const legendAlignmentChanged = (id: string) => {
    setLegendAlignment(id);
    setValue('legendAlignment', id);
  };

  const [tooltipAlignment, setTooltipAlignment] = useState(
    stateParams.hasOwnProperty('tooltipAlignment') && !isEmpty(stateParams.tooltipAlignment)
      ? stateParams.tooltipAlignment
      : 'center'
  );

  const tooltipAlignmentChanged = (id: string) => {
    setTooltipAlignment(id);
    setValue('tooltipAlignment', id);
  };

  const enableDotLabelChanged = (e: any) => {
    setEnableDotLabel(e.target.checked);
    setValue('enableDotLabel', e.target.checked);
  };

  const animateChanged = (e: any) => {
    setAnimate(e.target.checked);
    setValue('animate', e.target.checked);
  };
  const [intervalId, setIntervalId] = useState(-1);

  useEffect(() => {
    setIntervalId(
      setInterval(() => {
        if (window.location.href.indexOf('edit') < 0) {
          clearInterval(intervalId);
          return;
        }

        const queryResult = queryMap.values().next();
        if (queryResult.value && queryResult.value.trim().length) {
          fetchQuery({ query: queryResult.value, key: '' }, (res) => {
            if (res.results.hasOwnProperty('error')) {
              setQueryKeys([]);
            } else {
              setQueryKeys(
                Object.keys(
                  res.results.hits.total.value !== 0 ? res.results.hits.hits[0]._source : []
                )
              );
            }
          });
        }
      }, 1000)
    );
  }, [queryMap]);

  useEffect(() => {
    if (queryKeys.length > 0) {
      clearInterval(intervalId);
    }
  }, [queryKeys]);

  const [includedKeyList, setIncludedKeyList] = useState(
    includedKeys
      .split(',')
      .filter((ik) => ik)
      .map((k) => ({ content: k, id: htmlIdGenerator()() }))
  );
  const [keyList, setKeyList] = useState([]);

  useEffect(() => {
    setKeyList(
      difference(
        queryKeys,
        includedKeyList.map((k) => k.content)
      ).map((qk) => ({
        content: qk,
        id: htmlIdGenerator()(),
      }))
    );
  }, [queryKeys, includedKeyList]);

  useEffect(() => {
    const keyString = includedKeyList.map((obj) => obj.content).join(',');
    if (stateParams.includedKeys !== keyString) setValue('includedKeys', keyString);
  }, [includedKeyList]);

  const onDragStart = (e) => {
    $(document.querySelector(`div[data-rbd-draggable-id=${e.draggableId}]`))
      .children()
      .css('transition', 'none')
      .css('filter', 'drop-shadow(0px 1px 1px #777)');
  };

  const onDragEnd = ({ draggableId, source, destination }) => {
    const lists = { AVAILABLE_KEYS: keyList, SELECTED_KEYS: includedKeyList };
    const actions = { AVAILABLE_KEYS: setKeyList, SELECTED_KEYS: setIncludedKeyList };
    if (source && destination) {
      if (source.droppableId === destination.droppableId) {
        const items = euiDragDropReorder(
          lists[destination.droppableId],
          source.index,
          destination.index
        );

        actions[destination.droppableId](items);
      } else {
        const sourceId = source.droppableId;
        const destinationId = destination.droppableId;
        const result = euiDragDropMove(lists[sourceId], lists[destinationId], source, destination);

        actions[sourceId](result[sourceId]);
        actions[destinationId](result[destinationId]);
      }
    }

    $(document.querySelector(`div[data-rbd-draggable-id=${draggableId}]`))
      .children()
      .css('transition', 'filter 1s linear')
      .css('filter', 'none');
  };

  const keysToCompare = useMemo(() => {
    return (
      <EuiDragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText>
              <h5 style={{ textAlign: 'center' }}>Available</h5>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiDroppable droppableId="AVAILABLE_KEYS" spacing="m" withPanel grow={false}>
              {keyList.length > 0 ? (
                keyList.map(({ content, id }, idx) => (
                  <EuiDraggable spacing="s" key={id} index={idx} draggableId={id}>
                    {(provided, state) => (
                      <FullBadge color="hollow" className="drag-element">
                        {content}
                      </FullBadge>
                    )}
                  </EuiDraggable>
                ))
              ) : (
                <span style={{ marginTop: 10, textAlign: 'center' }}>
                  <EuiEmptyPrompt icon={<EuiLoadingChart size="m" mono />} body="Loading keys..." />
                </span>
              )}
            </EuiDroppable>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>
              <h5 style={{ textAlign: 'center' }}>Selected</h5>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiDroppable droppableId="SELECTED_KEYS" spacing="m" withPanel grow={false}>
              {includedKeyList.length > 0 ? (
                includedKeyList.map(({ content, id }, idx) => (
                  <EuiDraggable spacing="s" key={id} index={idx} draggableId={id} customDragHandle>
                    {(provided, state) => (
                      <FullBadge color="hollow">
                        <EuiFlexGroup gutterSize="m">
                          <EuiFlexItem grow={false}>
                            <div {...provided.dragHandleProps} aria-label="Drag Handle">
                              <EuiIcon type="grab" color="#AAA" />
                            </div>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <div style={{ textAlign: 'left' }}>{content}</div>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </FullBadge>
                    )}
                  </EuiDraggable>
                ))
              ) : (
                <EuiFlexGroup
                  alignItems="center"
                  justifyContent="spaceAround"
                  gutterSize="none"
                  style={{ height: '100%' }}
                >
                  <EuiFlexItem grow={false}>
                    <EuiText>Drag keys here...</EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              )}
            </EuiDroppable>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiDragDropContext>
    );
  }, [keyList, includedKeyList]);

  return (
    <div className="radar-vis-params">
      <EuiPanel paddingSize="s">
        <EuiSpacer size="s" />
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem>
            <EuiFormRow label="Tooltip Alignment" hasChildLabel={false}>
              <EuiButtonGroup
                name="tooltipAlignment"
                legend="Direction to align the tooltip"
                options={[
                  { id: 'left', label: 'Left', iconType: 'editorAlignLeft' },
                  { id: 'center', label: 'Center', iconType: 'editorAlignCenter' },
                  { id: 'right', label: 'Right', iconType: 'editorAlignRight' },
                ]}
                idSelected={tooltipAlignment}
                onChange={(id: string) => tooltipAlignmentChanged(id)}
                buttonSize="s"
                isFullWidth
                isIconOnly
                isDisabled={fixedTooltip}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Legend alignment" hasChildLabel={false}>
              <EuiButtonGroup
                name="legendAlignment"
                legend="Direction to align the legend"
                options={[
                  { id: 'off', label: 'Off', iconType: 'eyeClosed' },
                  { id: 'left', label: 'Left', iconType: 'editorAlignLeft' },
                  { id: 'right', label: 'Right', iconSide: 'right', iconType: 'editorAlignRight' },
                ]}
                idSelected={legendAlignment}
                onChange={(id: string) => legendAlignmentChanged(id)}
                buttonSize="s"
                isFullWidth
                isIconOnly
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
                <EuiCheckbox
                  id={htmlIdGenerator()()}
                  label="Tooltip"
                  checked={showValues}
                  onChange={showValuesChanged}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButton
                  isSelected={fixedTooltip}
                  fill={fixedTooltip}
                  onClick={() => {
                    setFixedTooltip(!fixedTooltip);
                    setValue('fixedTooltip', !fixedTooltip);
                  }}
                  size="s"
                >
                  fixed
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow fullWidth label="Decimal places (values)" hasChildLabel={false}>
              <EuiRange
                id={htmlIdGenerator()()}
                min={0}
                max={10}
                value={decimalCount}
                onChange={decimalCountChanged}
                showInput
                aria-label="Digits after decimal point"
                fullWidth
                compressed
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiHorizontalRule margin="m" />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Animate"
              checked={animate}
              onChange={animateChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Show dots"
              checked={showDots}
              onChange={showDotsChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Dot labels"
              checked={enableDotLabel}
              onChange={enableDotLabelChanged}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        {showDots ? (
          <>
            <EuiText>
              <h5>Dot Size</h5>
            </EuiText>
            <EuiRange
              id={htmlIdGenerator()()}
              min={1}
              max={32}
              value={dotSize}
              onChange={dotSizeChanged}
              showInput
              aria-label="Dot size"
              fullWidth
              compressed
            />
            <EuiSpacer size="s" />
          </>
        ) : null}
        {!showDots ? (
          <>
            <EuiText>
              <h5>Border Width</h5>
            </EuiText>
            <EuiRange
              id={htmlIdGenerator()()}
              min={1}
              max={10}
              value={borderWidth}
              onChange={borderWidthChanged}
              showInput
              aria-label="Border width"
              fullWidth
              compressed
            />
          </>
        ) : null}
        {showDots ? (
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiText>
                <h5>Border Width</h5>
              </EuiText>
              <EuiRange
                id={htmlIdGenerator()()}
                min={1}
                max={10}
                value={borderWidth}
                onChange={borderWidthChanged}
                showInput
                aria-label="Border width"
                fullWidth
                compressed
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText>
                <h5>Dot Border Width</h5>
              </EuiText>
              <EuiRange
                id={htmlIdGenerator()()}
                min={1}
                max={10}
                value={dotBorderWidth}
                onChange={dotBorderWidthChanged}
                showInput
                aria-label="Dot border width"
                fullWidth
                compressed
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : null}
        <EuiSpacer size="s" />
        <EuiText>
          <h5>Grid Levels</h5>
        </EuiText>
        <EuiRange
          id={htmlIdGenerator()()}
          min={1}
          max={12}
          value={gridLevels}
          onChange={gridLevelsChanged}
          showInput
          aria-label="Grid levels"
          fullWidth
          compressed
        />
        <EuiSpacer size="s" />
        <EuiText>
          <h5>Color Scheme</h5>
        </EuiText>
        <EuiSpacer size="xs" />
        <EuiColorPalettePicker
          palettes={COLOR_PALETTES}
          onChange={colorSchemeChanged}
          valueOfSelected={colorScheme}
          fullWidth
        />
        <EuiSpacer size="m" />
        <EuiFlexGroup>
          {showDots ? (
            <EuiFlexItem>
              <EuiText>
                <h5>Dot Color</h5>
              </EuiText>
              <EuiSpacer size="xs" />
              <EuiSelect
                fullWidth
                options={dotColorOpts}
                value={dotColor}
                onChange={dotColorChanged}
              />
            </EuiFlexItem>
          ) : null}
          <EuiFlexItem>
            <EuiText>
              <h5>Radar Shape</h5>
            </EuiText>
            <EuiSpacer size="xs" />
            <EuiSelect
              fullWidth
              options={radarShapeOpts}
              value={radarShape}
              onChange={radarShapeChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>
              <h5>Curve Type</h5>
            </EuiText>
            <EuiSpacer size="xs" />
            <EuiSelect
              fullWidth
              options={radarCurveOpts}
              value={curveType}
              onChange={curveTypeChanged}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
        <EuiHorizontalRule margin="m" />
        <EuiText>
          <h4>
            Select Table Keys&ensp;
            <EuiToolTip
              position="right"
              content="Drag and drop keys from the available keys below to include them in the table view."
            >
              <EuiIcon type="questionInCircle" size="l" />
            </EuiToolTip>
          </h4>
        </EuiText>
        <EuiSpacer size="m" />
        {keysToCompare}
      </EuiPanel>
    </div>
  );
};
