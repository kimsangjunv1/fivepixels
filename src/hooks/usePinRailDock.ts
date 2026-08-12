import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { PIN_RAIL_BUBBLE_SIZE, PIN_RAIL_EXPANDED_WIDTH } from "@/constants/overlayChrome.js";
import { clampWindowPosition } from "@/hooks/useDraggableWindow.js";
import { pinPlacementToStyle, sanitizePinRailPlacement, type PinRailPlacement } from "@/utils/overlay/edgeDock.js";

const DRAG_LISTENER_OPTIONS = { capture: true } as const;
const DRAG_THRESHOLD_PX = 6;

type UsePinRailDockArgs = {
    enabled: boolean;
    collapsed: boolean;
    placement: PinRailPlacement;
    onPlacementChange: (placement: PinRailPlacement) => void;
    onTap?: () => void;
};

/** @deprecated Prefer FloatingWindow + useDraggableWindow for free-floating chrome. */
export function usePinRailDock({ enabled, collapsed, placement, onPlacementChange, onTap }: UsePinRailDockArgs) {
    const railRef = useRef<HTMLDivElement>(null);
    const [isPointerDown, setIsPointerDown] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [dragPosition, setDragPosition] = useState<{ left: number; top: number } | null>(null);
    const dragPointerIdRef = useRef<number | null>(null);
    const dragOriginRef = useRef<{ startX: number; startY: number; originLeft: number; originTop: number; width: number; height: number } | null>(null);
    const suppressClickRef = useRef(false);
    const onTapRef = useRef(onTap);
    const listenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);
    onTapRef.current = onTap;

    const currentPlacement = sanitizePinRailPlacement(placement);
    const height = collapsed ? PIN_RAIL_BUBBLE_SIZE : Math.max(railRef.current?.offsetHeight ?? 120, PIN_RAIL_BUBBLE_SIZE);
    const width = collapsed ? PIN_RAIL_BUBBLE_SIZE : PIN_RAIL_EXPANDED_WIDTH;
    const isDragging = isPointerDown && hasMoved;

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
        dragOriginRef.current = null;
        setIsPointerDown(false);
        setHasMoved(false);
        setDragPosition(null);
    }, [detachListeners, enabled]);

    useEffect(() => () => detachListeners(), [detachListeners]);

    const consumeClickSuppressed = useCallback(() => {
        if (!suppressClickRef.current) {
            return false;
        }

        suppressClickRef.current = false;
        return true;
    }, []);

    const finishDrag = useCallback(
        (clientX: number, clientY: number, didMove: boolean) => {
            detachListeners();
            suppressClickRef.current = true;

            if (didMove) {
                const origin = dragOriginRef.current;

                if (origin) {
                    const nextLeft = origin.originLeft + (clientX - origin.startX);
                    const nextTop = origin.originTop + (clientY - origin.startY);
                    onPlacementChange(clampWindowPosition(nextLeft, nextTop, origin.width, origin.height));
                }
            } else {
                onTapRef.current?.();
            }

            dragPointerIdRef.current = null;
            dragOriginRef.current = null;
            setDragPosition(null);
            setIsPointerDown(false);
            setHasMoved(false);
        },
        [detachListeners, onPlacementChange],
    );

    const handleDragHandlePointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (!enabled || event.button !== 0) {
                return;
            }

            const node = railRef.current;

            if (!node) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            detachListeners();
            event.currentTarget.setPointerCapture(event.pointerId);

            const rect = node.getBoundingClientRect();
            dragOriginRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                originLeft: rect.left,
                originTop: rect.top,
                width: rect.width,
                height: rect.height,
            };
            dragPointerIdRef.current = event.pointerId;
            setIsPointerDown(true);
            setHasMoved(false);
            setDragPosition({ left: rect.left, top: rect.top });

            const handlePointerMove = (moveEvent: PointerEvent) => {
                const origin = dragOriginRef.current;

                if (!origin || dragPointerIdRef.current !== moveEvent.pointerId) {
                    return;
                }

                const deltaX = moveEvent.clientX - origin.startX;
                const deltaY = moveEvent.clientY - origin.startY;
                const distanceSq = deltaX * deltaX + deltaY * deltaY;

                if (distanceSq < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
                    return;
                }

                setHasMoved(true);
                setDragPosition(clampWindowPosition(origin.originLeft + deltaX, origin.originTop + deltaY, origin.width, origin.height));
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
                if (dragPointerIdRef.current !== upEvent.pointerId) {
                    return;
                }

                const origin = dragOriginRef.current;
                const didMove = Boolean(origin) && (() => {
                    const deltaX = upEvent.clientX - (origin?.startX ?? upEvent.clientX);
                    const deltaY = upEvent.clientY - (origin?.startY ?? upEvent.clientY);
                    return deltaX * deltaX + deltaY * deltaY >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX;
                })();

                finishDrag(upEvent.clientX, upEvent.clientY, didMove);
            };

            listenersRef.current = { move: handlePointerMove, up: handlePointerUp };
            window.addEventListener("pointermove", handlePointerMove, DRAG_LISTENER_OPTIONS);
            window.addEventListener("pointerup", handlePointerUp, DRAG_LISTENER_OPTIONS);
            window.addEventListener("pointercancel", handlePointerUp, DRAG_LISTENER_OPTIONS);
        },
        [detachListeners, enabled, finishDrag],
    );

    const railStyle: CSSProperties = pinPlacementToStyle(currentPlacement, {
        isDragging,
        dragLeft: dragPosition?.left,
        dragTop: dragPosition?.top,
        width,
    });

    return {
        railRef,
        railStyle,
        isDragging,
        handleDragHandlePointerDown,
        consumeClickSuppressed,
    };
}
