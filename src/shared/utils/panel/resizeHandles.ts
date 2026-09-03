import type { PanelCorner } from "@/shared/hooks/usePanelDock.js";
import type { PanelResizeEdge } from "@/shared/hooks/usePanelResize.js";

export type PanelResizeHandles = {
    edges: PanelResizeEdge[];
};

export function getResizeHandlesForPlacement(corner: PanelCorner): PanelResizeHandles {
    const horizontalEdge: PanelResizeEdge = corner.endsWith("left") ? "right" : "left";
    const verticalEdge: PanelResizeEdge = corner.startsWith("top") ? "bottom" : "top";

    return {
        edges: [horizontalEdge, verticalEdge],
    };
}

export function isVerticalResizeEdge(edge: PanelResizeEdge): boolean {
    return edge === "top" || edge === "bottom";
}
