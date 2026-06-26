import type { PanelResizeEdge } from "@/hooks/usePanelResize.js";
import type { PointerEvent as ReactPointerEvent } from "react";
type PanelResizeHandleProps = {
    edge: PanelResizeEdge;
    ariaLabel: string;
    inactive?: boolean;
    active?: boolean;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};
export declare const PANEL_RESIZE_ACTIVE_COLOR = "#F6572E";
export declare function PanelResizeHandle({ edge, ariaLabel, inactive, active, onPointerDown }: PanelResizeHandleProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PanelResizeHandle.d.ts.map