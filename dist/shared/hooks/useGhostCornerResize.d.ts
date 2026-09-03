import { type PointerEvent as ReactPointerEvent, type RefObject } from "react";
export type ResizeCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type ResizeEdge = "top" | "bottom" | "left" | "right";
export type ResizeHandle = {
    kind: "corner";
    corner: ResizeCorner;
} | {
    kind: "edge";
    edge: ResizeEdge;
};
export type BoxSize = {
    width: number;
    height: number;
};
export type BoxRect = BoxSize & {
    left: number;
    top: number;
};
type ResizeSession = {
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    visualLeft: number;
    visualTop: number;
    handle: ResizeHandle;
};
type RectSession = Pick<ResizeSession, "visualLeft" | "visualTop" | "startWidth" | "startHeight" | "startX" | "startY">;
export declare function resolveGhostCornerRect(session: RectSession & {
    handleCorner: ResizeCorner;
}, clientX: number, clientY: number, clampSize: (width: number, height: number) => BoxSize): {
    left: number;
    top: number;
    width: number;
    height: number;
};
export declare function resolveGhostEdgeRect(session: RectSession & {
    handleEdge: ResizeEdge;
}, clientX: number, clientY: number, clampSize: (width: number, height: number) => BoxSize): {
    left: number;
    top: number;
    width: number;
    height: number;
};
export declare function useGhostCornerResize({ enabled, targetRef, handleCorner, clampSize, onResizeComplete, resolveStartSize, }: {
    enabled: boolean;
    targetRef: RefObject<HTMLElement | null>;
    handleCorner?: ResizeCorner;
    clampSize: (width: number, height: number) => BoxSize;
    onResizeComplete: (rect: BoxRect) => void;
    resolveStartSize?: () => BoxSize;
}): {
    isResizing: boolean;
    ghostRef: import("react").MutableRefObject<HTMLDivElement | null>;
    createResizePointerDown: (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLElement>) => void;
    handleResizePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
export {};
//# sourceMappingURL=useGhostCornerResize.d.ts.map