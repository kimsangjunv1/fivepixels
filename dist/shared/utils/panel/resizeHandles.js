export function getResizeHandlesForPlacement(corner) {
    const horizontalEdge = corner.endsWith("left") ? "right" : "left";
    const verticalEdge = corner.startsWith("top") ? "bottom" : "top";
    return {
        edges: [horizontalEdge, verticalEdge],
    };
}
export function isVerticalResizeEdge(edge) {
    return edge === "top" || edge === "bottom";
}
//# sourceMappingURL=resizeHandles.js.map