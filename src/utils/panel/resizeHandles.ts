import type { PanelCorner } from "@/hooks/usePanelDock.js";
import type { PanelResizeEdge } from "@/hooks/usePanelResize.js";
import type { ResizeCorner } from "@/hooks/useGhostCornerResize.js";

export type PanelResizeHandles = {
    edges: PanelResizeEdge[];
    corner: ResizeCorner;
};

function getResizeCorner(horizontalEdge: PanelResizeEdge, verticalEdge: PanelResizeEdge): ResizeCorner {
    return `${verticalEdge === "top" ? "top" : "bottom"}-${horizontalEdge === "left" ? "left" : "right"}`;
}

export function getResizeHandlesForPlacement(corner: PanelCorner): PanelResizeHandles {
    const horizontalEdge: PanelResizeEdge = corner.endsWith("left") ? "right" : "left";
    const verticalEdge: PanelResizeEdge = corner.startsWith("top") ? "bottom" : "top";

    return {
        edges: [horizontalEdge, verticalEdge],
        corner: getResizeCorner(horizontalEdge, verticalEdge),
    };
}

export function isVerticalResizeEdge(edge: PanelResizeEdge): boolean {
    return edge === "top" || edge === "bottom";
}
