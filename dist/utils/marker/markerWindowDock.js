export const MARKER_MINIMIZED_WINDOW_WIDTH = 256;
export const MARKER_MINIMIZED_WINDOW_HEIGHT = 56;
export const MARKER_WINDOW_MARGIN = 16;
export const MARKER_MINIMIZED_DOCK_GAP = 8;
/**
 * Lay out minimized marker windows in a horizontal strip centered in the available region,
 * filling left → right in minimize order.
 */
export function resolveMinimizedDockPosition(index, count, viewportWidth, viewportHeight, itemWidth = MARKER_MINIMIZED_WINDOW_WIDTH, itemHeight = MARKER_MINIMIZED_WINDOW_HEIGHT, gap = MARKER_MINIMIZED_DOCK_GAP, margin = MARKER_WINDOW_MARGIN, region) {
    const safeCount = Math.max(1, count);
    const safeIndex = Math.min(Math.max(0, index), safeCount - 1);
    const totalWidth = safeCount * itemWidth + (safeCount - 1) * gap;
    const regionLeft = region?.regionLeft ?? margin;
    const regionWidth = region?.regionWidth ?? Math.max(0, viewportWidth - margin * 2);
    const startLeft = Math.round(regionLeft + (regionWidth - totalWidth) / 2);
    return {
        left: startLeft + safeIndex * (itemWidth + gap),
        top: Math.max(margin, viewportHeight - margin - itemHeight),
    };
}
/** Resolve the dock slot index under a horizontal center point (Mac Dock–style). */
export function resolveMinimizedDockIndexFromPointer(centerX, count, viewportWidth, itemWidth = MARKER_MINIMIZED_WINDOW_WIDTH, gap = MARKER_MINIMIZED_DOCK_GAP, margin = MARKER_WINDOW_MARGIN, region) {
    const safeCount = Math.max(1, count);
    if (safeCount <= 1) {
        return 0;
    }
    const totalWidth = safeCount * itemWidth + (safeCount - 1) * gap;
    const regionLeft = region?.regionLeft ?? margin;
    const regionWidth = region?.regionWidth ?? Math.max(0, viewportWidth - margin * 2);
    const startLeft = regionLeft + (regionWidth - totalWidth) / 2;
    const slotWidth = itemWidth + gap;
    const index = Math.round((centerX - startLeft - itemWidth / 2) / slotWidth);
    return Math.max(0, Math.min(safeCount - 1, index));
}
export function moveMinimizedDockItem(items, fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
        return items;
    }
    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}
//# sourceMappingURL=markerWindowDock.js.map