import { useCallback, useEffect, useRef, useState } from "react";
import { PIN_RAIL_BUBBLE_SIZE, PIN_RAIL_EXPANDED_WIDTH } from "../constants/overlayChrome.js";
import { pinPlacementToStyle, projectPointerToPinPlacement, resolvePinPlacementAwayFromPanel, sanitizePinRailPlacement, } from "../utils/overlay/edgeDock.js";
const DRAG_LISTENER_OPTIONS = { capture: true };
const DRAG_THRESHOLD_PX = 6;
export function usePinRailDock({ enabled, collapsed, peeking, placement, onPlacementChange, onTap, panelPlacement = null }) {
    const railRef = useRef(null);
    const [isPointerDown, setIsPointerDown] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [dragPosition, setDragPosition] = useState(null);
    const [previewPlacement, setPreviewPlacement] = useState(null);
    const dragPointerIdRef = useRef(null);
    const dragOriginRef = useRef(null);
    const suppressClickRef = useRef(false);
    const onTapRef = useRef(onTap);
    const listenersRef = useRef(null);
    onTapRef.current = onTap;
    const currentPlacement = sanitizePinRailPlacement(previewPlacement ?? placement);
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
        setPreviewPlacement(null);
    }, [detachListeners, enabled]);
    useEffect(() => () => detachListeners(), [detachListeners]);
    const consumeClickSuppressed = useCallback(() => {
        if (!suppressClickRef.current) {
            return false;
        }
        suppressClickRef.current = false;
        return true;
    }, []);
    const finishDrag = useCallback((clientX, clientY, didMove) => {
        detachListeners();
        suppressClickRef.current = true;
        if (didMove) {
            const origin = dragOriginRef.current;
            const next = resolvePinPlacementAwayFromPanel(projectPointerToPinPlacement(clientX, clientY, { height: origin?.height ?? height }), panelPlacement);
            onPlacementChange(next);
        }
        else {
            // preventDefault(pointerdown) may still emit click in some engines — suppress it.
            onTapRef.current?.();
        }
        dragPointerIdRef.current = null;
        dragOriginRef.current = null;
        setPreviewPlacement(null);
        setDragPosition(null);
        setIsPointerDown(false);
        setHasMoved(false);
    }, [detachListeners, height, onPlacementChange, panelPlacement]);
    const handleDragHandlePointerDown = useCallback((event) => {
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
        const handlePointerMove = (moveEvent) => {
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
            setDragPosition({ left: origin.originLeft + deltaX, top: origin.originTop + deltaY });
            setPreviewPlacement(projectPointerToPinPlacement(moveEvent.clientX, moveEvent.clientY, { height: origin.height }));
        };
        const handlePointerUp = (upEvent) => {
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
    }, [detachListeners, enabled, finishDrag]);
    const railStyle = pinPlacementToStyle(currentPlacement, {
        collapsed,
        peeking: peeking && !isDragging,
        isDragging,
        dragLeft: dragPosition?.left,
        dragTop: dragPosition?.top,
        width,
        height,
    });
    return {
        railRef,
        railStyle,
        isDragging,
        activeEdge: isDragging ? currentPlacement.edge : null,
        placementEdge: currentPlacement.edge,
        handleDragHandlePointerDown,
        consumeClickSuppressed,
    };
}
//# sourceMappingURL=usePinRailDock.js.map