import type { PanelCorner } from "../../hooks/usePanelDock.js";
import type { PanelResizeEdge } from "../../hooks/usePanelResize.js";
export type PanelResizeHandles = {
    edges: PanelResizeEdge[];
};
export declare function getResizeHandlesForPlacement(corner: PanelCorner): PanelResizeHandles;
export declare function isVerticalResizeEdge(edge: PanelResizeEdge): boolean;
//# sourceMappingURL=resizeHandles.d.ts.map