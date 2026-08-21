export const MARKER_MINIMIZED_WINDOW_WIDTH = 256;
export const MARKER_MINIMIZED_WINDOW_HEIGHT = 56;
export const MARKER_WINDOW_MARGIN = 16;
export const MARKER_MINIMIZED_DOCK_GAP = 8;

export type MarkerWindowDockPosition = {
    left: number;
    top: number;
};

/**
 * Lay out minimized marker windows in a horizontal strip centered on the viewport,
 * filling left → right in minimize order.
 */
export function resolveMinimizedDockPosition(
    index: number,
    count: number,
    viewportWidth: number,
    viewportHeight: number,
    itemWidth = MARKER_MINIMIZED_WINDOW_WIDTH,
    itemHeight = MARKER_MINIMIZED_WINDOW_HEIGHT,
    gap = MARKER_MINIMIZED_DOCK_GAP,
    margin = MARKER_WINDOW_MARGIN,
): MarkerWindowDockPosition {
    const safeCount = Math.max(1, count);
    const safeIndex = Math.min(Math.max(0, index), safeCount - 1);
    const totalWidth = safeCount * itemWidth + (safeCount - 1) * gap;
    const startLeft = Math.round((viewportWidth - totalWidth) / 2);

    return {
        left: startLeft + safeIndex * (itemWidth + gap),
        top: Math.max(margin, viewportHeight - margin - itemHeight),
    };
}

/** Resolve the dock slot index under a horizontal center point (Mac Dock–style). */
export function resolveMinimizedDockIndexFromPointer(
    centerX: number,
    count: number,
    viewportWidth: number,
    itemWidth = MARKER_MINIMIZED_WINDOW_WIDTH,
    gap = MARKER_MINIMIZED_DOCK_GAP,
): number {
    const safeCount = Math.max(1, count);

    if (safeCount <= 1) {
        return 0;
    }

    const totalWidth = safeCount * itemWidth + (safeCount - 1) * gap;
    const startLeft = (viewportWidth - totalWidth) / 2;
    const slotWidth = itemWidth + gap;
    const index = Math.round((centerX - startLeft - itemWidth / 2) / slotWidth);

    return Math.max(0, Math.min(safeCount - 1, index));
}

export function moveMinimizedDockItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
        return items as T[];
    }

    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}
