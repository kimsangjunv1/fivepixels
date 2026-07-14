import type { PickProbeLayoutMode } from "../types/report-ui.js";
export declare const PROBE_GRID_TRACK_MIN = 1;
export declare const PROBE_GRID_TRACK_MAX = 12;
export declare const FLEX_JUSTIFY_VALUES: readonly ["flex-start", "center", "flex-end", "space-between"];
export declare const FLEX_ALIGN_VALUES: readonly ["flex-start", "center", "flex-end"];
export type FlexJustifyValue = (typeof FLEX_JUSTIFY_VALUES)[number];
export type FlexAlignValue = (typeof FLEX_ALIGN_VALUES)[number];
export declare function getPickProbeLayoutMode(element: HTMLElement): PickProbeLayoutMode;
export declare function isColumnFlexDirection(direction: string): boolean;
export declare function isFlexReversed(direction: string): boolean;
export declare function getFlexAxis(direction: string): "row" | "column";
export declare function buildFlexDirection(axis: "row" | "column", reversed: boolean): "column" | "row" | "row-reverse" | "column-reverse";
export declare function toggleFlexReverse(direction: string): "column" | "row" | "row-reverse" | "column-reverse";
export declare function parseGridTrackCount(template: string): number;
export declare function clampGridTrackCount(value: number): number;
export declare function formatGridTrackCount(count: number): string;
export declare function parseProbeGap(value: string): string;
export declare function captureProbeGap(style: CSSStyleDeclaration): string;
export declare function stepProbeGap(value: string, delta: number): string;
export declare function stepGridTrackCount(value: string, delta: number): string;
export declare function inferLayoutModeFromProbeValues(values: {
    flexDirection: string;
    justifyContent: string;
    gridColumnCount: string;
    gridRowCount: string;
}): PickProbeLayoutMode;
//# sourceMappingURL=probeLayout.d.ts.map