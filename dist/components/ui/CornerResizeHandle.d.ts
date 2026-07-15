import type { ResizeCorner } from "../../hooks/useGhostCornerResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
type CornerResizeHandleProps = {
    corner: ResizeCorner;
    ariaLabel: string;
    inactive?: boolean;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
export declare function CornerResizeHandle({ corner, ariaLabel, inactive, onPointerDown }: CornerResizeHandleProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=CornerResizeHandle.d.ts.map