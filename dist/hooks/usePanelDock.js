import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { OVERLAY_EDGE_MARGIN } from "../constants/overlayChrome.js";
import { DEFAULT_PANEL_EDGE_PLACEMENT, edgeTopFromPlacement, isDockEdge, isEdgeDockPlacement, projectPointerToEdgePlacement, resolvePanelPlacementAwayFromPin, sanitizeEdgeDockPlacement, } from "../utils/overlay/edgeDock.js";
const STORAGE_KEY = "fivepixels:panel-placement";
const LEGACY_STORAGE_KEY = "fivepixels:panel-dock-position";
const DEFAULT_PLACEMENT = { ...DEFAULT_PANEL_EDGE_PLACEMENT };
const PANEL_FALLBACK_HEIGHT = 320;
const COLLAPSED_TAB_HEIGHT = 105;
const DRAG_THRESHOLD_PX = 6;
export const PANEL_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
const DRAG_LISTENER_OPTIONS = { capture: true };
const DRAG_INTERACTIVE_SELECTOR = 'button,a,input,textarea,select,option,[role="button"],[role="menu"],[role="menuitem"],[role="listbox"],[role="option"],[contenteditable="true"],[data-fivepixels-interactive]';
function isPanelCorner(value) {
    return value === "top-left" || value === "top-right" || value === "bottom-left" || value === "bottom-right";
}
function isLegacyCornerPlacement(value) {
    return typeof value === "object" && value !== null && "corner" in value && isPanelCorner(String(value.corner));
}
function isLegacyPanelPlacement(value) {
    return (typeof value === "object" &&
        value !== null &&
        "edge" in value &&
        "offset" in value &&
        typeof value.offset === "number" &&
        ["top", "bottom", "left", "right"].includes(String(value.edge)));
}
function cornerToEdgePlacement(corner) {
    return {
        edge: corner.endsWith("right") ? "right" : "left",
        offsetRatio: corner.startsWith("top") ? 0 : 1,
    };
}
function legacyEdgeOffsetToPlacement(edge, offset) {
    if (typeof window === "undefined") {
        return DEFAULT_PLACEMENT;
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    switch (edge) {
        case "top":
            return { edge: offset < viewportWidth / 2 ? "left" : "right", offsetRatio: 0 };
        case "bottom":
            return { edge: offset < viewportWidth / 2 ? "left" : "right", offsetRatio: 1 };
        case "left":
            return {
                edge: "left",
                offsetRatio: viewportHeight > 0 ? Math.min(1, Math.max(0, offset / viewportHeight)) : 0,
            };
        case "right":
            return {
                edge: "right",
                offsetRatio: viewportHeight > 0 ? Math.min(1, Math.max(0, offset / viewportHeight)) : 0,
            };
    }
}
function legacyEdgeToPlacement(edge) {
    switch (edge) {
        case "top":
            return { edge: "left", offsetRatio: 0 };
        case "bottom":
            return { edge: "left", offsetRatio: 1 };
        case "left":
            return { edge: "left", offsetRatio: 0 };
        case "right":
            return { edge: "right", offsetRatio: 0 };
        default:
            return DEFAULT_PLACEMENT;
    }
}
export function placementToPanelCorner(placement) {
    const vertical = placement.offsetRatio < 0.5 ? "top" : "bottom";
    return `${vertical}-${placement.edge}`;
}
function readStoredPlacement() {
    if (typeof window === "undefined") {
        return DEFAULT_PLACEMENT;
    }
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (isEdgeDockPlacement(parsed) && !("corner" in parsed)) {
                return sanitizeEdgeDockPlacement(parsed, DEFAULT_PLACEMENT);
            }
            if (isLegacyCornerPlacement(parsed)) {
                return cornerToEdgePlacement(parsed.corner);
            }
            // New format may coexist with leftover corner field — prefer edge+offsetRatio.
            if (isEdgeDockPlacement(parsed)) {
                return sanitizeEdgeDockPlacement(parsed, DEFAULT_PLACEMENT);
            }
            if (isLegacyPanelPlacement(parsed)) {
                return legacyEdgeOffsetToPlacement(parsed.edge, parsed.offset);
            }
        }
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (typeof legacy === "string" && ["top", "bottom", "left", "right"].includes(legacy)) {
            return legacyEdgeToPlacement(legacy);
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return DEFAULT_PLACEMENT;
}
/** Read the persisted panel dock for collision avoidance with other chrome. */
export function getStoredPanelPlacement() {
    return readStoredPlacement();
}
/** @deprecated Prefer getStoredPanelPlacement — kept for callers that only need a coarse corner. */
export function getStoredPanelCorner() {
    return placementToPanelCorner(readStoredPlacement());
}
function persistPlacement(placement) {
    const next = sanitizeEdgeDockPlacement(placement, DEFAULT_PLACEMENT);
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fivepixels:panel-placement", { detail: next }));
    }
}
export function clampPanelPlacement(placement) {
    return sanitizeEdgeDockPlacement(placement, DEFAULT_PLACEMENT);
}
export function projectPointerToPlacement(clientX, clientY, height = PANEL_FALLBACK_HEIGHT) {
    return projectPointerToEdgePlacement(clientX, clientY, { height, fallback: DEFAULT_PLACEMENT });
}
export function placementToPanelStyle(placement, options = {}) {
    const { collapsed = false, isDragging = false, dragLeft, dragTop, height = PANEL_FALLBACK_HEIGHT } = options;
    if (isDragging && typeof dragLeft === "number" && typeof dragTop === "number") {
        return {
            position: "fixed",
            top: dragTop,
            left: dragLeft,
            right: "auto",
            bottom: "auto",
        };
    }
    const resolvedHeight = collapsed ? COLLAPSED_TAB_HEIGHT : height;
    const top = edgeTopFromPlacement(placement, resolvedHeight);
    const style = {
        position: "fixed",
        top,
        bottom: "auto",
        maxHeight: collapsed ? "none" : undefined,
        maxWidth: collapsed ? "none" : undefined,
    };
    if (placement.edge === "left") {
        style.left = collapsed ? 0 : OVERLAY_EDGE_MARGIN;
        style.right = "auto";
    }
    else {
        style.right = collapsed ? 0 : OVERLAY_EDGE_MARGIN;
        style.left = "auto";
    }
    return style;
}
export function placementToCollapsedPanelStyle(placement) {
    return placementToPanelStyle(placement, { collapsed: true });
}
export function getMobilePanelStyle() {
    return {
        position: "fixed",
        top: "auto",
        right: OVERLAY_EDGE_MARGIN,
        bottom: OVERLAY_EDGE_MARGIN,
        left: OVERLAY_EDGE_MARGIN,
        maxHeight: "min(68vh, 560px)",
    };
}
export function usePanelDock({ enabled, measureKey, collapsed = false, pinPlacement = null, onTap, onPlacementSettled, }) {
    const panelRef = useRef(null);
    const [placement, setPlacement] = useState(() => readStoredPlacement());
    const [previewPlacement, setPreviewPlacement] = useState(null);
    const [isPointerDown, setIsPointerDown] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [dragPosition, setDragPosition] = useState(null);
    const [measuredHeight, setMeasuredHeight] = useState(PANEL_FALLBACK_HEIGHT);
    const dragPointerIdRef = useRef(null);
    const dragOriginRef = useRef(null);
    const suppressClickRef = useRef(false);
    const onTapRef = useRef(onTap);
    const onPlacementSettledRef = useRef(onPlacementSettled);
    const pinPlacementRef = useRef(pinPlacement);
    const dragListenersRef = useRef(null);
    onTapRef.current = onTap;
    onPlacementSettledRef.current = onPlacementSettled;
    pinPlacementRef.current = pinPlacement;
    const currentPlacement = sanitizeEdgeDockPlacement(previewPlacement ?? placement, DEFAULT_PLACEMENT);
    const isDragging = isPointerDown && hasMoved;
    const activeEdge = isDragging ? currentPlacement.edge : null;
    const placementCorner = placementToPanelCorner(currentPlacement);
    const detachDragListeners = useCallback(() => {
        const listeners = dragListenersRef.current;
        if (!listeners) {
            return;
        }
        window.removeEventListener("pointermove", listeners.move, DRAG_LISTENER_OPTIONS);
        window.removeEventListener("pointerup", listeners.up, DRAG_LISTENER_OPTIONS);
        window.removeEventListener("pointercancel", listeners.up, DRAG_LISTENER_OPTIONS);
        dragListenersRef.current = null;
    }, []);
    useEffect(() => {
        if (enabled) {
            return;
        }
        detachDragListeners();
        setPreviewPlacement(null);
        setIsPointerDown(false);
        setHasMoved(false);
        setDragPosition(null);
        dragPointerIdRef.current = null;
        dragOriginRef.current = null;
    }, [detachDragListeners, enabled]);
    useLayoutEffect(() => {
        if (!enabled) {
            return;
        }
        setPlacement((current) => clampPanelPlacement(current));
        const height = panelRef.current?.getBoundingClientRect().height;
        if (height && Number.isFinite(height)) {
            setMeasuredHeight(height);
        }
    }, [enabled, measureKey, collapsed]);
    const consumeClickSuppressed = useCallback(() => {
        if (!suppressClickRef.current) {
            return false;
        }
        suppressClickRef.current = false;
        return true;
    }, []);
    const finishDrag = useCallback((clientX, clientY, didMove) => {
        detachDragListeners();
        suppressClickRef.current = true;
        if (didMove) {
            const origin = dragOriginRef.current;
            const next = resolvePanelPlacementAwayFromPin(projectPointerToEdgePlacement(clientX, clientY, {
                height: origin?.height ?? measuredHeight,
                fallback: DEFAULT_PLACEMENT,
            }), pinPlacementRef.current);
            setPlacement(next);
            persistPlacement(next);
            onPlacementSettledRef.current?.(next);
        }
        else {
            onTapRef.current?.();
        }
        dragPointerIdRef.current = null;
        dragOriginRef.current = null;
        setPreviewPlacement(null);
        setDragPosition(null);
        setIsPointerDown(false);
        setHasMoved(false);
    }, [detachDragListeners, measuredHeight]);
    useEffect(() => {
        if (!enabled) {
            return;
        }
        const handleResize = () => {
            setPlacement((current) => clampPanelPlacement(current));
            setPreviewPlacement((current) => (current ? clampPanelPlacement(current) : current));
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [enabled]);
    useEffect(() => () => detachDragListeners(), [detachDragListeners]);
    const handleDragHandlePointerDown = useCallback((event) => {
        if (!enabled || event.button !== 0) {
            return;
        }
        if (event.target instanceof Element) {
            const interactive = event.target.closest(DRAG_INTERACTIVE_SELECTOR);
            if (interactive && interactive !== event.currentTarget) {
                return;
            }
        }
        const node = panelRef.current;
        if (!node) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        detachDragListeners();
        event.currentTarget.setPointerCapture(event.pointerId);
        const rect = node.getBoundingClientRect();
        dragOriginRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            originLeft: rect.left,
            originTop: rect.top,
            height: rect.height,
        };
        dragPointerIdRef.current = event.pointerId;
        setMeasuredHeight(rect.height);
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
            if (deltaX * deltaX + deltaY * deltaY < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
                return;
            }
            setHasMoved(true);
            setDragPosition({ left: origin.originLeft + deltaX, top: origin.originTop + deltaY });
            setPreviewPlacement(projectPointerToEdgePlacement(moveEvent.clientX, moveEvent.clientY, {
                height: origin.height,
                fallback: DEFAULT_PLACEMENT,
            }));
        };
        const handlePointerUp = (upEvent) => {
            if (dragPointerIdRef.current !== upEvent.pointerId) {
                return;
            }
            const origin = dragOriginRef.current;
            const deltaX = upEvent.clientX - (origin?.startX ?? upEvent.clientX);
            const deltaY = upEvent.clientY - (origin?.startY ?? upEvent.clientY);
            const didMove = deltaX * deltaX + deltaY * deltaY >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX;
            finishDrag(upEvent.clientX, upEvent.clientY, didMove);
        };
        dragListenersRef.current = { move: handlePointerMove, up: handlePointerUp };
        window.addEventListener("pointermove", handlePointerMove, DRAG_LISTENER_OPTIONS);
        window.addEventListener("pointerup", handlePointerUp, DRAG_LISTENER_OPTIONS);
        window.addEventListener("pointercancel", handlePointerUp, DRAG_LISTENER_OPTIONS);
    }, [detachDragListeners, enabled, finishDrag]);
    const panelStyle = enabled
        ? placementToPanelStyle(currentPlacement, {
            collapsed,
            isDragging,
            dragLeft: dragPosition?.left,
            dragTop: dragPosition?.top,
            height: measuredHeight,
        })
        : getMobilePanelStyle();
    return {
        panelRef,
        panelStyle,
        placement,
        placementCorner,
        placementEdge: currentPlacement.edge,
        isDragging,
        activeCorner: isDragging ? placementCorner : null,
        activeEdge,
        handleDragHandlePointerDown,
        consumeClickSuppressed,
    };
}
export function panelHeaderAlignModifier(corner) {
    return corner.endsWith("left") ? "align-left" : "align-right";
}
export function panelAnchorSide(cornerOrEdge) {
    if (isDockEdge(cornerOrEdge)) {
        return cornerOrEdge;
    }
    return cornerOrEdge.endsWith("left") ? "left" : "right";
}
//# sourceMappingURL=usePanelDock.js.map