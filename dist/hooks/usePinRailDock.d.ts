import { type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { PanelPlacement } from "../hooks/usePanelDock.js";
import { type PinRailPlacement } from "../utils/overlay/edgeDock.js";
type UsePinRailDockArgs = {
    enabled: boolean;
    collapsed: boolean;
    peeking: boolean;
    placement: PinRailPlacement;
    onPlacementChange: (placement: PinRailPlacement) => void;
    onTap?: () => void;
    panelPlacement?: PanelPlacement | null;
};
export declare function usePinRailDock({ enabled, collapsed, peeking, placement, onPlacementChange, onTap, panelPlacement }: UsePinRailDockArgs): {
    railRef: import("react").RefObject<HTMLDivElement>;
    railStyle: CSSProperties;
    isDragging: boolean;
    activeEdge: import("../utils/overlay/edgeDock.js").DockEdge | null;
    placementEdge: import("../utils/overlay/edgeDock.js").DockEdge;
    handleDragHandlePointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    consumeClickSuppressed: () => boolean;
};
export {};
//# sourceMappingURL=usePinRailDock.d.ts.map