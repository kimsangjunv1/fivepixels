import { type CSSProperties, type RefObject } from "react";
import type { PanelCorner } from "../hooks/usePanelDock.js";
import { type ResizeCorner } from "../hooks/useGhostCornerResize.js";
export type PanelSizeState = {
    width: number;
    height: number | null;
};
/** @deprecated Edge resize replaced by corner ghost resize. */
export type PanelResizeEdge = "top" | "bottom" | "left" | "right";
export declare const PANEL_WIDTH_MIN = 342;
export declare const PANEL_DEFAULT_WIDTH = 342;
export declare const PANEL_CONTENT_MIN_HEIGHT = 220;
export declare const PANEL_HEADER_ESTIMATE_HEIGHT = 132;
export declare const PANEL_TAB_BAR_HEIGHT = 36;
export declare const PANEL_CHROME_MIN_HEIGHT: number;
export declare const PANEL_HEIGHT_MIN: number;
/** @deprecated Used only for migrating legacy stored sizes. */
export declare const PANEL_DEFAULT_HEIGHT = 480;
export declare function getPanelSizeLimits(): {
    maxWidth: number;
    maxHeight: number;
};
export declare function getOppositeResizeCorner(corner: PanelCorner): ResizeCorner;
/** @deprecated Edge resize replaced by corner ghost resize. */
export declare function getResizeEdgesForCorner(corner: PanelCorner): {
    widthEdge: "left" | "right";
    heightEdge: "top" | "bottom";
};
export declare function panelSizeToStyle(size: PanelSizeState, applyFixedHeight?: boolean): CSSProperties;
export declare function usePanelResize({ enabled, corner, heightResizeEnabled, panelRef, }: {
    enabled: boolean;
    corner: PanelCorner;
    heightResizeEnabled: boolean;
    panelRef: RefObject<HTMLDivElement | null>;
}): {
    panelSize: PanelSizeState;
    isResizing: boolean;
    resizeCorner: ResizeCorner;
    handleResizePointerDown: (event: import("react").PointerEvent<HTMLElement>) => void;
    resetPanelSize: () => void;
    ghostRef: import("react").MutableRefObject<HTMLDivElement | null>;
    isDefaultSize: boolean;
};
//# sourceMappingURL=usePanelResize.d.ts.map