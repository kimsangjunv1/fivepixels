type DockListener = () => void;

export const MARKER_DOCK_WINDOW_ID_PREFIX = "marker:";

export function getMarkerDockWindowId(reportId: string): string {
    return `${MARKER_DOCK_WINDOW_ID_PREFIX}${reportId}`;
}

export function parseMarkerDockWindowId(windowId: string): string | null {
    if (!windowId.startsWith(MARKER_DOCK_WINDOW_ID_PREFIX)) {
        return null;
    }

    return windowId.slice(MARKER_DOCK_WINDOW_ID_PREFIX.length);
}

let dockOrder: string[] = [];
const listeners = new Set<DockListener>();

function emit() {
    for (const listener of listeners) {
        listener();
    }
}

export function getOverlayMinimizedDockOrder(): readonly string[] {
    return dockOrder;
}

export function subscribeOverlayMinimizedDock(listener: DockListener): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function isOverlayMinimizedDocked(windowId: string): boolean {
    return dockOrder.includes(windowId);
}

export function registerOverlayMinimizedDock(windowId: string): readonly string[] {
    if (!dockOrder.includes(windowId)) {
        dockOrder = [...dockOrder, windowId];
        emit();
    }

    return dockOrder;
}

export function unregisterOverlayMinimizedDock(windowId: string): readonly string[] {
    if (!dockOrder.includes(windowId)) {
        return dockOrder;
    }

    dockOrder = dockOrder.filter((id) => id !== windowId);
    emit();

    return dockOrder;
}

export function reorderOverlayMinimizedDock(fromIndex: number, toIndex: number): readonly string[] {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= dockOrder.length || toIndex >= dockOrder.length) {
        return dockOrder;
    }

    const next = [...dockOrder];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item!);
    dockOrder = next;
    emit();

    return dockOrder;
}

/** Test helper */
export function resetOverlayMinimizedDockRegistryForTests() {
    dockOrder = [];
    emit();
}
