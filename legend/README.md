# `legend`

## Description

**legend** is a flexible legend created in React. Toggle layers by passing a click handler, if desired. The legend has minimal but modern hover styling, with strike-through text for hidden layers. Hide all/show all button is included at the top, which runs the click handler for all of the layers at once.

The legend should be stored in the state of another React component in order to access the status of the layers within it.

## Usage

The legend is stored in the following format:

```js
{
  key1: {
    color: 'rgb(255, 0, 0)',
    checked: true,
  },
  key2: {
    color: 'rgb(0, 255, 0)',
    checked: false,
  },
  key3: {
    color: 'rgb(0, 0, 255)',
    checked: true,
  },
  ...
}
```

### Example:

```tsx
import CheckboxLegend from '@kibana-enhanced-vis/legend';

// When rendering a component:
<CheckboxLegend
  legendModel={legend}
  onLegendItemChecked={legendCheckedFn}
  isLeftAligned={false}
  colorScheme="category20"
  dotColor={someDotColor ?? '#ffffff'}
  onMouseEnter={updateGraphOpacity.bind(null, true)}
  onMouseLeave={updateGraphOpacity.bind(null, false)}
/>;
```

The types for the component are provided below:

```ts
export interface LegendItem {
  color: string;
  checked: boolean;
}

type LegendItemCheckedFn = (props: { key: string; checked: boolean }) => void;

interface CheckboxLegendProps {
  legendModel: Record<string, LegendItem>;
  onLegendItemChecked: LegendItemCheckedFn;
  colorScheme: string;
  isLeftAligned?: boolean;
  dotColor?: string;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
}
```
