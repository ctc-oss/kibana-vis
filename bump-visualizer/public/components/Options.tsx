import React, { useEffect, useState } from 'react';
import {
  EuiColorPalettePicker,
  EuiPanel,
  EuiRange,
  EuiSpacer,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import { isEmpty, toNumber } from 'lodash';
import { VisEditorOptionsProps } from '../../../../src/plugins/visualizations/public';

import { fetchQuery } from '@kibana-enhanced-vis/drilldown';
import { COLOR_PALETTES, queryMap } from '../defines/bump';

export interface StateParamsObject {
  colorScheme: string | undefined;
  lineWidth: string | number;
  pointSize: string | number;
}

// Options panel to the right-hand side of the visualization
// There aren't any settings at the moment, but this may change in the future.
export const BumpVisualizerOptions = ({
  stateParams,
  setValue,
}: VisEditorOptionsProps<StateParamsObject>) => {
  const [queryKeys, setQueryKeys] = useState([]);
  const [colorScheme, setColorScheme] = useState(
    stateParams.hasOwnProperty('colorScheme') && !isEmpty(stateParams.colorScheme)
      ? stateParams.colorScheme
      : '10color'
  );
  const [lineWidth, setLineWidth] = useState(
    stateParams.hasOwnProperty('lineWidth') ? stateParams.lineWidth : '3'
  );
  const [pointSize, setPointSize] = useState(
    stateParams.hasOwnProperty('pointSize') ? stateParams.pointSize : '10'
  );
  const [intervalId, setIntervalId] = useState(-1);

  const colorSchemeChanged = (val: string) => {
    setColorScheme(val);
    setValue('colorScheme', val);
  };

  const lineWidthChanged = (e: any) => {
    setLineWidth(e.target.value);
    setValue('lineWidth', toNumber(e.target.value));
  };

  const pointSizeChanged = (e: any) => {
    setPointSize(e.target.value);
    setValue('pointSize', toNumber(e.target.value));
  };

  useEffect(() => {
    setIntervalId(
      setInterval(() => {
        if (
          window.location.href.indexOf('edit') < 0 &&
          window.location.href.indexOf('create') < 0
        ) {
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

  return (
    <div className="line-vis-params">
      <EuiPanel paddingSize="s">
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
      </EuiPanel>
    </div>
  );
};
