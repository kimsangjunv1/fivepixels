export const MARKER_MINIMIZED_WINDOW_WIDTH = 256;
export const MARKER_MINIMIZED_WINDOW_HEIGHT = 56;
export const MARKER_WINDOW_MARGIN = 16;
export const MARKER_MINIMIZED_DOCK_GAP = 8;
/**
 * Lay out minimized marker windows in a horizontal strip centered on the viewport,
 * filling left → right in minimize order.
 */
export function resolveMinimizedDockPosition(index, count, viewportWidth, viewportHeight, itemWidth = MARKER_MINIMIZED_WINDOW_WIDTH, itemHeight = MARKER_MINIMIZED_WINDOW_HEIGHT, gap = MARKER_MINIMIZED_DOCK_GAP, margin = MARKER_WINDOW_MARGIN) {
    const safeCount = Math.max(1, count);
    const safeIndex = Math.min(Math.max(0, index), safeCount - 1);
    const totalWidth = safeCount * itemWidth + (safeCount - 1) * gap;
    const startLeft = Math.round((viewportWidth - totalWidth) / 2);
    return {
        left: startLeft + safeIndex * (itemWidth + gap),
        top: Math.max(margin, viewportHeight - margin - itemHeight),
    };
}
//# sourceMappingURL=markerWindowDock.js.map