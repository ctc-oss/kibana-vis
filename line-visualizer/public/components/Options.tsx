import React, { useEffect, useMemo, useState } from 'react';
import {
  EuiBadge,
  EuiButtonGroup,
  EuiCheckbox,
  EuiColorPalettePicker,
  EuiColorPicker,
  EuiColorPickerSwatch,
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
  EuiToolTip,
  euiDragDropMove,
  euiDragDropReorder,
  htmlIdGenerator,
  useColorPickerState,
} from '@elastic/eui';
import { difference, isEmpty, toNumber } from 'lodash';
import $ from 'jquery';
import styled from 'styled-components';
import { VisEditorOptionsProps } from '../../../../src/plugins/visualizations/public';

import { fetchQuery } from '@kibana-enhanced-vis/drilldown';
import { COLOR_PALETTES, queryMap } from '../defines/line';

const LINE_CURVES = [
  'basis',
  'cardinal',
  'catmullRom',
  'linear',
  'monotoneX',
  'monotoneY',
  'natural',
  'step',
  'stepAfter',
  'stepBefore',
];

const DOT_COLORS = [
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
  colorScheme: string | undefined;
  curveType: string | undefined;
  enableArea: boolean | undefined;
  lineOfBestFit: boolean | undefined;
  decimalCount: string | number;
  lineWidth: string | number;
  pointBorderWidth: string | number;
  enablePoints: boolean | undefined;
  enablePointLabel: boolean | undefined;
  showValues: boolean | undefined;
  pointSize: string | number;
  pointColor: string | undefined;
  regLineColor: string | undefined;
  useMesh: boolean | undefined;
  enableCrosshair: boolean | undefined;
  legendAlignment: string | undefined;
  animate: boolean | undefined;
  drilldownVisType: string | undefined;
  queryExclude: string | undefined;
  includedKeys: string | undefined;
}

const FullBadge = styled(EuiBadge)`
  width: 100% !important;
`;

// Options panel to the right-hand side of the visualization
// There aren't any settings at the moment, but this may change in the future.
export const LineVisualizerOptions = ({
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
      : 'linear'
  );
  const [decimalCount, setDecimalCount] = useState(
    stateParams.hasOwnProperty('decimalCount') ? stateParams.decimalCount : 3
  );
  const [enablePoints, setEnablePoints] = useState(
    stateParams.hasOwnProperty('enablePoints') ? stateParams.enablePoints : true
  );
  const [enableArea, setEnableArea] = useState(
    stateParams.hasOwnProperty('enableArea') ? stateParams.enableArea : false
  );
  const [lineWidth, setLineWidth] = useState(
    stateParams.hasOwnProperty('lineWidth') ? stateParams.lineWidth : '3'
  );
  const [pointBorderWidth, setPointBorderWidth] = useState(
    stateParams.hasOwnProperty('pointBorderWidth') ? stateParams.pointBorderWidth : '3'
  );
  const [pointColor, setPointColor] = useState(
    stateParams.hasOwnProperty('pointColor') ? stateParams.pointColor : '#ffffff'
  );
  const [pointSize, setPointSize] = useState(
    stateParams.hasOwnProperty('pointSize') ? stateParams.pointSize : '10'
  );
  const [showValues, setShowValues] = useState(
    stateParams.hasOwnProperty('showValues') ? stateParams.showValues : true
  );
  const [lineOfBestFit, setLineOfBestFit] = useState(
    stateParams.hasOwnProperty('lineOfBestFit') ? stateParams.lineOfBestFit : false
  );
  const [enablePointLabel, setEnablePointLabel] = useState(
    stateParams.hasOwnProperty('enablePointLabel') ? stateParams.enablePointLabel : false
  );
  const [regLineColor, setRegLineColor] = useState(
    stateParams.hasOwnProperty('regLineColor') ? stateParams.regLineColor : '#ff0000'
  );
  const [color, setColor, errors] = useColorPickerState(
    stateParams.hasOwnProperty('regLineColor') ? stateParams.regLineColor : '#ff0000'
  );

  const [animate, setAnimate] = useState(
    stateParams.hasOwnProperty('animate') ? stateParams.animate : false
  );
  const [includedKeys, setIncludedKeys] = useState(
    stateParams.hasOwnProperty('includedKeys') && !isEmpty(stateParams.includedKeys)
      ? stateParams.includedKeys
      : ''
  );
  const [intervalId, setIntervalId] = useState(-1);

  const colorSchemeChanged = (val: string) => {
    setColorScheme(val);
    setValue('colorScheme', val);
  };

  const curveTypeChanged = (e: any) => {
    setCurveType(e.target.value);
    setValue('curveType', e.target.value);
  };

  const lineWidthChanged = (e: any) => {
    setLineWidth(e.target.value);
    setValue('lineWidth', toNumber(e.target.value));
  };

  const pointBorderWidthChanged = (e: any) => {
    setPointBorderWidth(e.target.value);
    setValue('pointBorderWidth', toNumber(e.target.value));
  };

  const pointColorChanged = (e: any) => {
    setPointColor(e.target.value);
    setValue('pointColor', e.target.value);
  };

  const pointSizeChanged = (e: any) => {
    setPointSize(e.target.value);
    setValue('pointSize', toNumber(e.target.value));
  };

  const decimalCountChanged = (e: any) => {
    setDecimalCount(e.target.value);
    setValue('decimalCount', toNumber(e.target.value));
  };

  const enablePointsChanged = (e: any) => {
    setEnablePoints(e.target.checked);
    setValue('enablePoints', e.target.checked);
  };

  const enableAreaChanged = (e: any) => {
    setEnableArea(e.target.checked);
    setValue('enableArea', e.target.checked);
  };

  const showValuesChanged = (e: any) => {
    setShowValues(e.target.checked);
    setValue('showValues', e.target.checked);
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

  const lineOfBestFitChanged = (e: any) => {
    setLineOfBestFit(e.target.checked);
    setValue('lineOfBestFit', e.target.checked);
  };

  const enablePointLabelChanged = (e: any) => {
    setEnablePointLabel(e.target.checked);
    setValue('enablePointLabel', e.target.checked);
  };

  const regLineColChanged = (text: string, { hex, isValid }: { hex: string; isValid: boolean }) => {
    setRegLineColor(hex);
    if (setColor === null) return;
    setColor(text, { hex, isValid });
    setValue('regLineColor', hex);
  };

  const animateChanged = (e: any) => {
    setAnimate(e.target.checked);
    setValue('animate', e.target.checked);
  };

  const lineCurveOpts = LINE_CURVES.map((val) => {
    return {
      value: val,
      text: val,
    };
  });

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
    <div className="line-vis-params">
      <EuiPanel paddingSize="s">
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
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
          <EuiFlexItem>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Show tooltip"
              checked={showValues}
              onChange={showValuesChanged}
            />
            <EuiSpacer size="s" />
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
              label="Enable dots"
              checked={enablePoints}
              onChange={enablePointsChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Dot labels"
              checked={enablePointLabel}
              onChange={enablePointLabelChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Show area"
              checked={enableArea}
              onChange={enableAreaChanged}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        {enablePoints ? (
          <>
            <EuiSpacer size="s" />
            <EuiText>
              <h5>Dot Size</h5>
            </EuiText>
            <EuiRange
              id={htmlIdGenerator()()}
              min={1}
              max={32}
              value={pointSize}
              onChange={pointSizeChanged}
              showInput
              aria-label="Point size"
              fullWidth
              compressed
            />
          </>
        ) : null}
        <EuiSpacer size="s" />
        <EuiText>
          <h5>Line Width</h5>
        </EuiText>
        <EuiRange
          id={htmlIdGenerator()()}
          min={1}
          max={10}
          value={lineWidth}
          onChange={lineWidthChanged}
          showInput
          aria-label="Line width"
          fullWidth
          compressed
        />
        <EuiSpacer size="s" />
        {pointColor !== 'inherit' ? (
          <>
            <EuiText>
              <h5>Dot Border Width</h5>
            </EuiText>
            <EuiRange
              id={htmlIdGenerator()()}
              min={1}
              max={10}
              value={pointBorderWidth}
              onChange={pointBorderWidthChanged}
              showInput
              aria-label="Point border width"
              fullWidth
              compressed
            />
            <EuiSpacer size="s" />
          </>
        ) : null}
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Animate layers"
              checked={animate}
              onChange={animateChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiCheckbox
              id={htmlIdGenerator()()}
              label="Draw best fit line"
              checked={lineOfBestFit}
              onChange={lineOfBestFitChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiColorPicker
              onChange={regLineColChanged}
              color={color}
              secondaryInputDisplay="top"
              button={<EuiColorPickerSwatch color={regLineColor} aria-label="Select a new color" />}
              showAlpha
              isInvalid={!!errors}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
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
          <EuiFlexItem>
            <EuiText>
              <h5>Dot Color</h5>
            </EuiText>
            <EuiSpacer size="xs" />
            <EuiSelect
              fullWidth
              options={DOT_COLORS}
              value={pointColor}
              onChange={pointColorChanged}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>
              <h5>Curve Type</h5>
            </EuiText>
            <EuiSpacer size="xs" />
            <EuiSelect
              fullWidth
              options={lineCurveOpts}
              value={curveType}
              onChange={curveTypeChanged}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
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
        <EuiSpacer size="s" />
        {keysToCompare}
      </EuiPanel>
    </div>
  );
};
