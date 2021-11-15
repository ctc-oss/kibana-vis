import { ReactNode } from 'react';
export interface LegendItem {
    color: string;
    checked: boolean;
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
declare type LegendItemCheckedFn = (props: {
    key: string;
    checked: boolean;
}) => void;
export declare type LegendRecord = Record<string, LegendItem>;
/**
 * Builds a legend model, given a set of keys and a color scheme
 * @param keys The list of items for the legend
 * @param colorScheme Any color scheme of preference (array of "rgb(...)" or hex values)
 * @returns A JSON object that contains the structure of the legend
 */
export declare const buildLegendModel: (keys: string[], colorScheme: readonly string[]) => {};
/**
 * @param legend The legend's current state
 * @returns Whether all the items in the legend are toggled on
 */
export declare const allItemsVisible: (legend: LegendRecord) => boolean;
/**
 * Filters the legend, returning true if the legend has changed and false otherwise.
 * @param hiddenKeys The already-hidden keys from the graph
 * @param legend The legend model object used for the graph
 * @returns Whether there are hidden keys remaining (or if there were hidden keys remaining)
 */
export declare const filterLegendModel: (hiddenKeys: string[], legend: LegendRecord) => boolean;
export declare const CheckboxLegend: ({ legendModel, onLegendItemChecked, colorScheme, isLeftAligned, dotColor, onMouseEnter, onMouseLeave, onFocus, iconType, }: CheckboxLegendProps) => JSX.Element;
export {};
