export const MARKER_DOCK_WINDOW_ID_PREFIX = "marker:";
export function getMarkerDockWindowId(reportId) {
    return `${MARKER_DOCK_WINDOW_ID_PREFIX}${reportId}`;
}
export function parseMarkerDockWindowId(windowId) {
    if (!windowId.startsWith(MARKER_DOCK_WINDOW_ID_PREFIX)) {
        return null;
    }
    return windowId.slice(MARKER_DOCK_WINDOW_ID_PREFIX.length);
}
let dockOrder = [];
let activeDockDragWindowId = null;
const listeners = new Set();
function emit() {
    for (const listener of listeners) {
        listener();
    }
}
export function getOverlayMinimizedDockOrder() {
    return dockOrder;
}
export function subscribeOverlayMinimizedDock(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
export function getActiveDockDragWindowId() {
    return activeDockDragWindowId;
}
export function setActiveDockDragWindowId(windowId) {
    if (activeDockDragWindowId === windowId) {
        return;
    }
    activeDockDragWindowId = windowId;
    emit();
}
export function isOverlayMinimizedDocked(windowId) {
    return dockOrder.includes(windowId);
}
export function registerOverlayMinimizedDock(windowId) {
    if (!dockOrder.includes(windowId)) {
        dockOrder = [...dockOrder, windowId];
        emit();
    }
    return dockOrder;
}
export function unregisterOverlayMinimizedDock(windowId) {
    if (!dockOrder.includes(windowId)) {
        return dockOrder;
    }
    dockOrder = dockOrder.filter((id) => id !== windowId);
    emit();
    return dockOrder;
}
export function reorderOverlayMinimizedDock(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= dockOrder.length || toIndex >= dockOrder.length) {
        return dockOrder;
    }
    const next = [...dockOrder];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    dockOrder = next;
    emit();
    return dockOrder;
}
/** Test helper */
export function resetOverlayMinimizedDockRegistryForTests() {
    dockOrder = [];
    activeDockDragWindowId = null;
    emit();
}
//# sourceMappingURL=overlayMinimizedDockRegistry.js.map