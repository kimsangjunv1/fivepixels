import type { PanelResizeEdge } from "../../hooks/usePanelResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
type PanelResizeHandleProps = {
    edge: PanelResizeEdge;
    ariaLabel: string;
    inactive?: boolean;
    active?: boolean;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
export declare function PanelResizeHandle({ edge, ariaLabel, inactive, active, onPointerDown }: PanelResizeHandleProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelResizeHandle.d.ts.map