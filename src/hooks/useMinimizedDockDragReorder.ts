import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import {
    getOverlayMinimizedDockOrder,
    reorderOverlayMinimizedDock,
    setActiveDockDragWindowId,
} from "@/utils/overlay/overlayMinimizedDockRegistry.js";
import {
    MINIMIZED_WINDOW_HEIGHT,
    MINIMIZED_WINDOW_MARGIN,
    MINIMIZED_WINDOW_WIDTH,
    resolveMinimizedDockIndexFromPointer,
    type MinimizedDockRegion,
} from "@/utils/overlay/minimizedDockLayout.js";

const DOCK_DRAG_THRESHOLD_PX = 6;

export const MINIMIZED_DOCK_DRAG_LIFT_PX = 10;

type DockDragState = {
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    pointerX: number;
    pointerY: number;
    active: boolean;
};

type UseMinimizedDockDragReorderOptions = {
    windowId: string;
    windowRef: RefObject<HTMLElement | null>;
    enabled: boolean;
    blockDrag?: boolean;
    minimizedWidth: number;
    dockPosition: { left: number; top: number };
    dockRegion: MinimizedDockRegion;
};

export function useMinimizedDockDragReorder({
    windowId,
    windowRef,
    enabled,
    blockDrag = false,
    minimizedWidth,
    dockPosition,
    dockRegion,
}: UseMinimizedDockDragReorderOptions) {
    const [dockDrag, setDockDrag] = useState<DockDragState | null>(null);
    const dockDragRef = useRef<DockDragState | null>(null);
    const dockDragListenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);
    const suppressDockRestoreClickRef = useRef(false);

    const isDockDragging = dockDrag?.active === true;

    const detachDockDragListeners = useCallback(() => {
        const listeners = dockDragListenersRef.current;

        if (!listeners) {
            return;
        }

        window.removeEventListener("pointermove", listeners.move, true);
        window.removeEventListener("pointerup", listeners.up, true);
        window.removeEventListener("pointercancel", listeners.up, true);
        dockDragListenersRef.current = null;
    }, []);

    useEffect(() => () => detachDockDragListeners(), [detachDockDragListeners]);

    useEffect(() => {
        if (!isDockDragging) {
            return;
        }

        setActiveDockDragWindowId(windowId);

        return () => {
            setActiveDockDragWindowId(null);
        };
    }, [isDockDragging, windowId]);

    useEffect(() => {
        return () => {
            detachDockDragListeners();

            if (dockDragRef.current?.active) {
                setActiveDockDragWindowId(null);
            }
        };
    }, [detachDockDragListeners]);

    const displayLeft = isDockDragging && dockDrag ? dockDrag.pointerX - dockDrag.offsetX : dockPosition.left;
    const displayTop = isDockDragging ? dockPosition.top - MINIMIZED_DOCK_DRAG_LIFT_PX : dockPosition.top;

    const handleMinimizedDockPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (!enabled || blockDrag || event.button !== 0) {
                return;
            }

            const dockOrder = getOverlayMinimizedDockOrder();

            if (dockOrder.length < 2) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            detachDockDragListeners();

            const rect = windowRef.current?.getBoundingClientRect();
            const initial: DockDragState = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                offsetX: rect ? event.clientX - rect.left : minimizedWidth / 2,
                offsetY: rect ? event.clientY - rect.top : MINIMIZED_WINDOW_HEIGHT / 2,
                pointerX: event.clientX,
                pointerY: event.clientY,
                active: false,
            };
            dockDragRef.current = initial;
            setDockDrag(initial);

            const handlePointerMove = (moveEvent: PointerEvent) => {
                const state = dockDragRef.current;

                if (!state || moveEvent.pointerId !== state.pointerId) {
                    return;
                }

                const distance = Math.hypot(moveEvent.clientX - state.startX, moveEvent.clientY - state.startY);
                const nextActive = state.active || distance >= DOCK_DRAG_THRESHOLD_PX;

                if (nextActive && !state.active) {
                    suppressDockRestoreClickRef.current = true;
                }

                const next: DockDragState = {
                    ...state,
                    pointerX: moveEvent.clientX,
                    pointerY: moveEvent.clientY,
                    active: nextActive,
                };
                dockDragRef.current = next;
                setDockDrag(next);

                if (!nextActive) {
                    return;
                }

                const currentOrder = [...getOverlayMinimizedDockOrder()];
                const fromIndex = currentOrder.indexOf(windowId);

                if (fromIndex < 0 || currentOrder.length < 2) {
                    return;
                }

                const viewportWidth = window.innerWidth;
                const itemWidth = Math.min(MINIMIZED_WINDOW_WIDTH, Math.max(0, Math.min(viewportWidth - MINIMIZED_WINDOW_MARGIN * 2, dockRegion.regionWidth)));
                const centerX = moveEvent.clientX - state.offsetX + itemWidth / 2;
                const toIndex = resolveMinimizedDockIndexFromPointer(centerX, currentOrder.length, viewportWidth, itemWidth, undefined, undefined, dockRegion);

                if (toIndex !== fromIndex) {
                    reorderOverlayMinimizedDock(fromIndex, toIndex);
                }
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
                const state = dockDragRef.current;

                if (!state || upEvent.pointerId !== state.pointerId) {
                    return;
                }

                detachDockDragListeners();
                dockDragRef.current = null;
                setDockDrag(null);
            };

            dockDragListenersRef.current = { move: handlePointerMove, up: handlePointerUp };
            window.addEventListener("pointermove", handlePointerMove, true);
            window.addEventListener("pointerup", handlePointerUp, true);
            window.addEventListener("pointercancel", handlePointerUp, true);
        },
        [blockDrag, detachDockDragListeners, dockRegion, enabled, minimizedWidth, windowId, windowRef],
    );

    const handleMinimizedDockClickCapture = useCallback((event: ReactMouseEvent<HTMLElement>) => {
        if (!suppressDockRestoreClickRef.current) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        suppressDockRestoreClickRef.current = false;
    }, []);

    return {
        isDockDragging,
        displayLeft,
        displayTop,
        handleMinimizedDockPointerDown,
        handleMinimizedDockClickCapture,
    };
}
