import { type PointerEvent as ReactPointerEvent, type RefObject } from "react";
export type ResizeCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type BoxSize = {
    width: number;
    height: number;
};
type ResizeSession = {
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    visualLeft: number;
    visualTop: number;
    handleCorner: ResizeCorner;
};
export declare function resolveGhostCornerRect(session: Pick<ResizeSession, "handleCorner" | "visualLeft" | "visualTop" | "startWidth" | "startHeight" | "startX" | "startY">, clientX: number, clientY: number, clampSize: (width: number, height: number) => BoxSize): {
    left: number;
    top: number;
    width: number;
    height: number;
};
export declare function useGhostCornerResize({ enabled, targetRef, handleCorner, clampSize, onResizeComplete, resolveStartSize, }: {
    enabled: boolean;
    targetRef: RefObject<HTMLElement | null>;
    handleCorner: ResizeCorner;
    clampSize: (width: number, height: number) => BoxSize;
    onResizeComplete: (size: BoxSize) => void;
    resolveStartSize?: () => BoxSize;
}): {
    isResizing: boolean;
    ghostRef: import("react").MutableRefObject<HTMLDivElement | null>;
    handleResizePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
export {};
//# sourceMappingURL=useGhostCornerResize.d.ts.map