import { getOppositeResizeCorner } from "../../hooks/usePanelResize.js";
export function getResizeHandlesForPlacement(corner, heightResizeEnabled) {
    const horizontalEdge = corner.endsWith("left") ? "right" : "left";
    const verticalEdge = corner.startsWith("top") ? "bottom" : "top";
    const edges = [horizontalEdge];
    if (heightResizeEnabled) {
        edges.push(verticalEdge);
    }
    return {
        edges,
        corner: getOppositeResizeCorner(corner),
    };
}
//# sourceMappingURL=resizeHandles.js.map