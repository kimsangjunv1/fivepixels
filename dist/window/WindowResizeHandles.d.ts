import type { ResizeEdge, ResizeHandle } from "../hooks/useGhostCornerResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
export declare const ALL_WINDOW_RESIZE_EDGES: ResizeEdge[];
type WindowResizeHandlesProps = {
    inactive?: boolean;
    resizeWidthAriaLabel: string;
    resizeHeightAriaLabel: string;
    createResizePointerDown: (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLElement>) => void;
};
export declare function WindowResizeHandles({ inactive, resizeWidthAriaLabel, resizeHeightAriaLabel, createResizePointerDown }: WindowResizeHandlesProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=WindowResizeHandles.d.ts.map