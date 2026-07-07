import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

export type WindowPosition = {
    left: number;
    top: number;
};

const DRAG_LISTENER_OPTIONS = { capture: true } as const;
/** Keep at least this many px of the window on screen so it can always be grabbed again. */
const MIN_VISIBLE = 80;
const TOP_MARGIN = 8;
const BOTTOM_MIN_VISIBLE = 40;

export function clampWindowPosition(left: number, top: number, width: number, height: number): WindowPosition {
    if (typeof window === "undefined") {
        return { left, top };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minLeft = MIN_VISIBLE - width;
    const maxLeft = Math.max(minLeft, viewportWidth - MIN_VISIBLE);
    const maxTop = Math.max(TOP_MARGIN, viewportHeight - BOTTOM_MIN_VISIBLE);

    return {
        left: Math.min(Math.max(left, minLeft), maxLeft),
        top: Math.min(Math.max(top, TOP_MARGIN), maxTop),
    };
}

type DragState = {
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    width: number;
    height: number;
};

export function useDraggableWindow({ enabled, windowRef }: { enabled: boolean; windowRef: RefObject<HTMLElement | null> }) {
    const [position, setPosition] = useState<WindowPosition | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragPointerIdRef = useRef<number | null>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const listenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);

    const detachListeners = useCallback(() => {
        const listeners = listenersRef.current;

        if (!listeners) {
            return;
        }

        window.removeEventListener("pointermove", listeners.move, DRAG_LISTENER_OPTIONS);
        window.removeEventListener("pointerup", listeners.up, DRAG_LISTENER_OPTIONS);
        window.removeEventListener("pointercancel", listeners.up, DRAG_LISTENER_OPTIONS);
        listenersRef.current = null;
    }, []);

    useEffect(() => {
        if (enabled) {
            return;
        }

        detachListeners();
        dragPointerIdRef.current = null;
        dragStateRef.current = null;
        setIsDragging(false);
    }, [detachListeners, enabled]);

    useEffect(() => () => detachListeners(), [detachListeners]);

    const resetPosition = useCallback(() => {
        setPosition(null);
    }, []);

    const handleDragHandlePointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (!enabled || event.button !== 0) {
                return;
            }

            const node = windowRef.current;

            if (!node) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            detachListeners();
            event.currentTarget.setPointerCapture(event.pointerId);

            const rect = node.getBoundingClientRect();

            dragStateRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                originLeft: rect.left,
                originTop: rect.top,
                width: rect.width,
                height: rect.height,
            };
            dragPointerIdRef.current = event.pointerId;
            setIsDragging(true);

            const handlePointerMove = (moveEvent: PointerEvent) => {
                const state = dragStateRef.current;

                if (!state || dragPointerIdRef.current !== moveEvent.pointerId) {
                    return;
                }

                const nextLeft = state.originLeft + (moveEvent.clientX - state.startX);
                const nextTop = state.originTop + (moveEvent.clientY - state.startY);

                setPosition(clampWindowPosition(nextLeft, nextTop, state.width, state.height));
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
                if (dragPointerIdRef.current !== upEvent.pointerId) {
                    return;
                }

                detachListeners();
                dragPointerIdRef.current = null;
                dragStateRef.current = null;
                setIsDragging(false);
            };

            listenersRef.current = { move: handlePointerMove, up: handlePointerUp };
            window.addEventListener("pointermove", handlePointerMove, DRAG_LISTENER_OPTIONS);
            window.addEventListener("pointerup", handlePointerUp, DRAG_LISTENER_OPTIONS);
            window.addEventListener("pointercancel", handlePointerUp, DRAG_LISTENER_OPTIONS);
        },
        [detachListeners, enabled, windowRef],
    );

    return {
        position,
        isDragging,
        handleDragHandlePointerDown,
        resetPosition,
        setPosition,
    };
}
