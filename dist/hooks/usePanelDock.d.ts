import { type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
export type PanelEdge = "top" | "bottom" | "left" | "right";
export type PanelPlacement = {
    edge: PanelEdge;
    offset: number;
};
export declare function getNearestPanelEdge(clientX: number, clientY: number): PanelEdge;
export declare function clampPanelPlacement(placement: PanelPlacement, panelWidth: number, panelHeight: number): PanelPlacement;
export declare function projectPointerToPlacement(clientX: number, clientY: number, panelWidth: number, panelHeight: number): PanelPlacement;
export declare function placementToPanelStyle(placement: PanelPlacement): CSSProperties;
export declare function getMobilePanelStyle(): CSSProperties;
export declare function usePanelDock({ enabled, measureKey }: {
    enabled: boolean;
    measureKey?: unknown;
}): {
    panelRef: RefObject<HTMLDivElement>;
    panelStyle: CSSProperties;
    isDragging: boolean;
    activeEdge: PanelEdge | null;
    handleDragHandlePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
//# sourceMappingURL=usePanelDock.d.ts.map