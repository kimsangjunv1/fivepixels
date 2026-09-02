import type { PanelCorner } from "../../hooks/usePanelDock.js";
import { type PanelResizeEdge } from "../../hooks/usePanelResize.js";
import type { ResizeCorner } from "../../hooks/useGhostCornerResize.js";
export type PanelResizeHandles = {
    edges: PanelResizeEdge[];
    corner: ResizeCorner;
};
export declare function getResizeHandlesForPlacement(corner: PanelCorner, heightResizeEnabled: boolean): PanelResizeHandles;
//# sourceMappingURL=resizeHandles.d.ts.map