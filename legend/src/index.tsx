import React, { ReactNode } from 'react';
import styled from 'styled-components';

// --- types ---

export interface LegendItem {
  color: string;
  checked: boolean;
}

interface LegendItemStyleProps {
  checked: boolean;
  showAll: boolean;
}

interface LegendDivProps {
  leftAligned: boolean;
}

interface CheckboxProps {
  key?: string;
  label?: string;
  color: string;
  checked: boolean;
}

interface CheckboxLegendProps {
  legendModel: Record<string, LegendItem>;
  onLegendItemChecked: LegendItemCheckedFn;
  colorScheme: string;
  isLeftAligned?: boolean;
  dotColor?: string;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
  onFocus?: (details: CheckboxProps) => void;
  iconType?: (details: CheckboxProps) => ReactNode;
}

interface CheckAllProps {
  legendModel: Record<string, LegendItem>;
  onLegendItemChecked: (props: { key: string; checked: boolean }) => void;
}

type LegendItemCheckedFn = (props: { key: string; checked: boolean }) => void;
export type LegendRecord = Record<string, LegendItem>;

// --- styled components ---

const CheckboxLegendLabel = styled.label`
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  align-items: center;
  padding-left: 5px;
  padding-top: 2px;
  padding-right: 3px;
  white-space: nowrap;
`;

const LegendItemStyle = styled.div<LegendItemStyleProps>`
  cursor: pointer;
  display: flex;
  padding: 3px;
  margin-right: 3px;
  border-radius: 5px;
  transition: background-color 0.2s linear;
  opacity: ${(props) => (props.checked || props.showAll ? '1.0' : '0.7')};
  text-decoration: ${(props) => (props.checked || props.showAll ? 'none' : 'line-through')};

  .focus-icon {
    opacity: 0;
  }

  &:hover .focus-icon {
    opacity: 1;
  }
`;

const LegendDiv = styled.div<LegendDivProps>`
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  right: ${(props) => (props.leftAligned ? '0' : '5%')};
  top: auto;
`;

const FocusIcon = styled.div`
  cursor: pointer;
  text-align: center;
  padding: 3px;
  transition: background-color 0.3s linear;

  &:hover {
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const LegendEntry = styled.div`
  display: flex;

  ${FocusIcon} {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &:hover ${FocusIcon} {
    opacity: 1;
  }

  &:hover ${LegendItemStyle} {
    background-color: rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s linear;
  }
`;

// --- functions ---

/**
 * Builds a legend model, given a set of keys and a color scheme
 * @param keys The list of items for the legend
 * @param colorScheme Any color scheme of preference (array of "rgb(...)" or hex values)
 * @returns A JSON object that contains the structure of the legend
 */
export const buildLegendModel = (keys: string[], colorScheme: readonly string[]) =>
  (keys || []).reduce(
    (all, k, i) => ({
      ...all,
      [k]: {
        color: colorScheme[i % colorScheme.length],
        checked: true,
      },
    }),
    {}
  );

/**
 * @param legend The legend's current state
 * @returns Whether all the items in the legend are toggled on
 */
export const allItemsVisible = (legend: LegendRecord) =>
  Object.values(legend).filter((item) => !item.checked).length === 0;

/**
 * Filters the legend, returning true if the legend has changed and false otherwise.
 * @param hiddenKeys The already-hidden keys from the graph
 * @param legend The legend model object used for the graph
 * @returns Whether there are hidden keys remaining (or if there were hidden keys remaining)
 */
export const filterLegendModel = (hiddenKeys: string[], legend: LegendRecord) => {
  const legendKeys = Object.keys(legend);
  const legendVals = Object.values(legend);
  const oldHiddenLen = hiddenKeys.length;

  legendVals.forEach((item: LegendItem, i: number) => {
    const legendVal = legendKeys[i];
    const keyIndex = hiddenKeys.indexOf(legendVal);

    if (!item.checked && keyIndex < 0) {
      hiddenKeys.push(legendVal);
    } else if (item.checked && keyIndex !== -1) {
      hiddenKeys.splice(keyIndex, 1);
    }
  });

  return hiddenKeys.length > 0 || oldHiddenLen > 0;
};

const toggleCheckAll = (
  legendModel: Record<string, LegendItem>,
  onLegendItemChecked: LegendItemCheckedFn,
  checked: boolean
) =>
  Object.keys(legendModel)
    .filter((key) => legendModel[key].checked !== checked)
    .forEach((key) =>
      onLegendItemChecked({
        key,
        checked,
      })
    );

// --- JSX components ---

const CheckboxLegendItem = ({
  details,
  onCheck,
  onFocus,
  iconType,
}: {
  details: CheckboxProps;
  onCheck: (key: string | undefined) => void;
  onFocus?: ((details: CheckboxProps) => void) | undefined;
  iconType?: ((details: CheckboxProps) => ReactNode) | undefined;
}) => {
  const FocusElement = onFocus ? iconType ? iconType(details) : <span>&#128269;</span> : null;

  return (
    <LegendEntry>
      <div>
        <LegendItemStyle
          checked={details.checked}
          showAll={details.label === 'Show All'}
          onClick={() => onCheck(details.key)}
        >
          <CheckboxLegendCheck color={details.color} checked={details.checked} />
          <CheckboxLegendLabel>{details.label || details.key}</CheckboxLegendLabel>
        </LegendItemStyle>
      </div>
      {onFocus ? (
        <FocusIcon aria-label="Focus icon" onClick={() => onFocus(details)}>
          {FocusElement}
        </FocusIcon>
      ) : null}
    </LegendEntry>
  );
};

const CheckboxLegendCheck = ({ color, checked }: { color: string; checked: boolean }) => {
  const width = 16;
  const height = 16;
  const strokeWidth = 2;
  const checkColor = 'white';
  const style = {
    stroke: color,
    fill: color,
    strokeWidth,
  };
  const checkPoints = [
    `${width * 0.3},${height * 0.5}`,
    `${width * 0.45},${height * 0.65}`,
    `${width * 0.7},${height * 0.32}`,
  ];
  return (
    <div style={{ width, height }}>
      <svg viewBox={`0 0 ${width} ${height}`}>
        <circle style={style} cx={width / 2} cy={height / 2} r={width / 2 - 2} />
        {checked ? (
          <polyline
            style={{
              ...style,
              stroke: checkColor,
              strokeWidth,
            }}
            points={checkPoints.join(' ')}
          />
        ) : null}
      </svg>
    </div>
  );
};

const CheckAllButton = ({ legendModel, onLegendItemChecked }: CheckAllProps) => {
  const allChecked = Object.keys(legendModel).reduce(
    (all, x) => legendModel[x].checked && all,
    true
  );
  return (
    <CheckboxLegendItem
      details={{
        label: allChecked ? 'Hide All' : 'Show All',
        checked: allChecked,
        color: 'black',
      }}
      onCheck={toggleCheckAll.bind(null, legendModel, onLegendItemChecked, !allChecked)}
    />
  );
};

export const CheckboxLegend = ({
  legendModel,
  onLegendItemChecked,
  colorScheme,
  isLeftAligned = false,
  dotColor,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  iconType,
}: CheckboxLegendProps) => (
  <LegendDiv leftAligned={isLeftAligned}>
    <CheckAllButton legendModel={legendModel} onLegendItemChecked={onLegendItemChecked} />
    {Object.keys(legendModel).map((key) => (
      <div
        key={`legend-key-${key}`}
        onMouseEnter={
          onMouseEnter ? () => onMouseEnter(legendModel, key, dotColor, colorScheme) : undefined
        }
        onMouseLeave={
          onMouseLeave ? () => onMouseLeave(legendModel, key, dotColor, colorScheme) : undefined
        }
      >
        <CheckboxLegendItem
          details={{ key, ...legendModel[key] }}
          onCheck={() =>
            onLegendItemChecked({
              key,
              checked: !legendModel[key].checked,
            })
          }
          onFocus={onFocus}
          iconType={iconType}
        />
      </div>
    ))}
  </LegendDiv>
);
