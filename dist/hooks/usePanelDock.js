import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
const STORAGE_KEY = "stitchable:panel-placement";
const LEGACY_STORAGE_KEY = "stitchable:panel-dock-position";
const EDGE_MARGIN = 16;
const DEFAULT_PLACEMENT = { corner: "top-left" };
const PANEL_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
const BLUR_ORIGIN = {
    "top-left": { x: "0%", y: "0%" },
    "top-right": { x: "100%", y: "0%" },
    "bottom-left": { x: "0%", y: "100%" },
    "bottom-right": { x: "100%", y: "100%" },
};
function isPanelCorner(value) {
    return value === "top-left" || value === "top-right" || value === "bottom-left" || value === "bottom-right";
}
function isPanelEdge(value) {
    return value === "top" || value === "bottom" || value === "left" || value === "right";
}
function isPanelPlacement(value) {
    return typeof value === "object" && value !== null && "corner" in value && isPanelCorner(String(value.corner));
}
function isLegacyPanelPlacement(value) {
    return (typeof value === "object" &&
        value !== null &&
        "edge" in value &&
        "offset" in value &&
        isPanelEdge(String(value.edge)) &&
        typeof value.offset === "number");
}
function edgeOffsetToCorner(edge, offset) {
    if (typeof window === "undefined") {
        return DEFAULT_PLACEMENT.corner;
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    switch (edge) {
        case "top":
            return offset < viewportWidth / 2 ? "top-left" : "top-right";
        case "bottom":
            return offset < viewportWidth / 2 ? "bottom-left" : "bottom-right";
        case "left":
            return offset < viewportHeight / 2 ? "top-left" : "bottom-left";
        case "right":
            return offset < viewportHeight / 2 ? "top-right" : "bottom-right";
    }
}
function legacyEdgeToCorner(edge) {
    switch (edge) {
        case "top":
            return "top-left";
        case "bottom":
            return "bottom-left";
        case "left":
            return "top-left";
        case "right":
            return "top-right";
    }
}
function readStoredPlacement() {
    if (typeof window === "undefined") {
        return DEFAULT_PLACEMENT;
    }
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (isPanelPlacement(parsed)) {
                return parsed;
            }
            if (isLegacyPanelPlacement(parsed)) {
                return { corner: edgeOffsetToCorner(parsed.edge, parsed.offset) };
            }
        }
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (isPanelEdge(legacy)) {
            return { corner: legacyEdgeToCorner(legacy) };
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return DEFAULT_PLACEMENT;
}
function persistPlacement(placement) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(placement));
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function getNearestPanelCorner(clientX, clientY) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cornerPoints = [
        ["top-left", EDGE_MARGIN, EDGE_MARGIN],
        ["top-right", viewportWidth - EDGE_MARGIN, EDGE_MARGIN],
        ["bottom-left", EDGE_MARGIN, viewportHeight - EDGE_MARGIN],
        ["bottom-right", viewportWidth - EDGE_MARGIN, viewportHeight - EDGE_MARGIN],
    ];
    let nearest = cornerPoints[0][0];
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const [corner, x, y] of cornerPoints) {
        const distance = (clientX - x) ** 2 + (clientY - y) ** 2;
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = corner;
        }
    }
    return nearest;
}
export function clampPanelPlacement(placement) {
    return isPanelCorner(placement.corner) ? placement : DEFAULT_PLACEMENT;
}
export function projectPointerToPlacement(clientX, clientY) {
    return { corner: getNearestPanelCorner(clientX, clientY) };
}
export function placementToPanelStyle(placement) {
    const blurOrigin = BLUR_ORIGIN[placement.corner];
    const style = {
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto",
        overflow: "visible",
        maxHeight: "none",
        "--stitchable-blur-origin-x": blurOrigin.x,
        "--stitchable-blur-origin-y": blurOrigin.y,
    };
    switch (placement.corner) {
        case "top-left":
            style.top = EDGE_MARGIN;
            style.left = EDGE_MARGIN;
            break;
        case "top-right":
            style.top = EDGE_MARGIN;
            style.right = EDGE_MARGIN;
            break;
        case "bottom-left":
            style.bottom = EDGE_MARGIN;
            style.left = EDGE_MARGIN;
            style.maxHeight = "min(68vh, 560px)";
            break;
        case "bottom-right":
            style.bottom = EDGE_MARGIN;
            style.right = EDGE_MARGIN;
            style.maxHeight = "min(68vh, 560px)";
            break;
    }
    return style;
}
export function getMobilePanelStyle() {
    return {
        top: "auto",
        right: EDGE_MARGIN,
        bottom: EDGE_MARGIN,
        left: EDGE_MARGIN,
        maxHeight: "min(68vh, 560px)",
        // overflow: "auto",
        "--stitchable-blur-origin-x": BLUR_ORIGIN["bottom-right"].x,
        "--stitchable-blur-origin-y": BLUR_ORIGIN["bottom-right"].y,
    };
}
export function usePanelDock({ enabled, measureKey }) {
    const panelRef = useRef(null);
    const [placement, setPlacement] = useState(() => readStoredPlacement());
    const [previewPlacement, setPreviewPlacement] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragPointerIdRef = useRef(null);
    const currentPlacement = previewPlacement ?? placement;
    const activeCorner = isDragging ? currentPlacement.corner : null;
    useEffect(() => {
        if (enabled) {
            return;
        }
        setPreviewPlacement(null);
        setIsDragging(false);
    }, [enabled]);
    useLayoutEffect(() => {
        if (!enabled) {
            return;
        }
        setPlacement((current) => clampPanelPlacement(current));
    }, [enabled, measureKey]);
    const updatePlacementFromPointer = useCallback((clientX, clientY) => {
        setPreviewPlacement(projectPointerToPlacement(clientX, clientY));
    }, []);
    const finishDrag = useCallback(() => {
        setPreviewPlacement((currentPreview) => {
            if (currentPreview) {
                setPlacement(currentPreview);
                persistPlacement(currentPreview);
            }
            return null;
        });
        dragPointerIdRef.current = null;
        setIsDragging(false);
    }, []);
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
    useEffect(() => {
        if (!isDragging) {
            return;
        }
        const handlePointerMove = (event) => {
            if (dragPointerIdRef.current !== event.pointerId) {
                return;
            }
            updatePlacementFromPointer(event.clientX, event.clientY);
        };
        const handlePointerUp = (event) => {
            if (dragPointerIdRef.current !== event.pointerId) {
                return;
            }
            finishDrag();
        };
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [finishDrag, isDragging, updatePlacementFromPointer]);
    const handleDragHandlePointerDown = useCallback((event) => {
        if (!enabled || event.button !== 0) {
            return;
        }
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragPointerIdRef.current = event.pointerId;
        setIsDragging(true);
        updatePlacementFromPointer(event.clientX, event.clientY);
    }, [enabled, updatePlacementFromPointer]);
    const panelStyle = enabled ? placementToPanelStyle(currentPlacement) : getMobilePanelStyle();
    return {
        panelRef,
        panelStyle,
        placementCorner: currentPlacement.corner,
        isDragging,
        activeCorner,
        handleDragHandlePointerDown,
    };
}
export function panelHeaderAlignModifier(corner) {
    return corner.endsWith("left") ? "align-left" : "align-right";
}
export function panelAnchorSide(corner) {
    return corner.endsWith("left") ? "left" : "right";
}
export { PANEL_CORNERS };
//# sourceMappingURL=usePanelDock.js.map