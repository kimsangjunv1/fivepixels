import type { ResizeEdge } from "../../shared/hooks/useGhostCornerResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
type ResizeHandleProps = {
    edge: ResizeEdge;
    ariaLabel: string;
    inactive?: boolean;
    active?: boolean;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
export declare function ResizeHandle({ edge, ariaLabel, inactive, active, onPointerDown }: ResizeHandleProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ResizeHandle.d.ts.map