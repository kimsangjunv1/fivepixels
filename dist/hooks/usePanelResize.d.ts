import { type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { PanelCorner } from "../hooks/usePanelDock.js";
export type PanelSizeState = {
    width: number;
    height: number | null;
};
export type PanelResizeEdge = "top" | "bottom" | "left" | "right";
export declare const PANEL_WIDTH_MIN = 375;
export declare const PANEL_DEFAULT_WIDTH = 375;
export declare const PANEL_CONTENT_MIN_HEIGHT = 220;
export declare const PANEL_HEADER_ESTIMATE_HEIGHT = 132;
export declare const PANEL_HEIGHT_MIN: number;
/** @deprecated Used only for migrating legacy stored sizes. */
export declare const PANEL_DEFAULT_HEIGHT = 480;
export declare function getPanelSizeLimits(): {
    maxWidth: number;
    maxHeight: number;
};
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
    widthEdge: "left" | "right";
    heightEdge: "top" | "bottom";
    heightResizeEnabled: boolean;
    handleResizePointerDown: (edge: PanelResizeEdge) => (event: ReactPointerEvent<HTMLElement>) => void;
    resetPanelSize: () => void;
    isDefaultSize: boolean;
};
//# sourceMappingURL=usePanelResize.d.ts.map