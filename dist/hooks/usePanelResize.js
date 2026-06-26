import { useCallback, useEffect, useRef, useState } from "react";
const STORAGE_KEY = "fivepixels:panel-size";
export const PANEL_WIDTH_MIN = 375;
export const PANEL_DEFAULT_WIDTH = PANEL_WIDTH_MIN;
export const PANEL_CONTENT_MIN_HEIGHT = 220;
export const PANEL_HEADER_ESTIMATE_HEIGHT = 132;
export const PANEL_HEIGHT_MIN = PANEL_HEADER_ESTIMATE_HEIGHT + PANEL_CONTENT_MIN_HEIGHT;
/** @deprecated Used only for migrating legacy stored sizes. */
export const PANEL_DEFAULT_HEIGHT = 480;
/** @deprecated Used only for migrating legacy stored sizes. */
const LEGACY_PANEL_DEFAULT_WIDTH = 420;
const DEFAULT_PANEL_SIZE = {
    width: PANEL_DEFAULT_WIDTH,
    height: null,
};
function getViewportMarginPx() {
    if (typeof window === "undefined") {
        return 25.6;
    }
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(rootFontSize) ? rootFontSize * 1.6 : 25.6;
}
export function getPanelSizeLimits() {
    if (typeof window === "undefined") {
        return { maxWidth: 800, maxHeight: 600 };
    }
    const margin = getViewportMarginPx();
    return {
        maxWidth: Math.max(PANEL_WIDTH_MIN, window.innerWidth - margin),
        maxHeight: Math.max(PANEL_HEIGHT_MIN, window.innerHeight - margin),
    };
}
function clampWidth(width) {
    const { maxWidth } = getPanelSizeLimits();
    return Math.min(Math.max(width, PANEL_WIDTH_MIN), maxWidth);
}
function clampHeight(height) {
    const { maxHeight } = getPanelSizeLimits();
    return Math.min(Math.max(height, PANEL_HEIGHT_MIN), maxHeight);
}
function clampPanelSize(size) {
    return {
        width: clampWidth(size.width),
        height: size.height === null ? null : clampHeight(size.height),
    };
}
function normalizeStoredWidth(width) {
    if (width === null || width === LEGACY_PANEL_DEFAULT_WIDTH) {
        return PANEL_DEFAULT_WIDTH;
    }
    return width;
}
function isLegacyPanelSize(value) {
    return (typeof value === "object" &&
        value !== null &&
        typeof value.width === "number" &&
        typeof value.height === "number");
}
function isPanelSizeState(value) {
    return (typeof value === "object" &&
        value !== null &&
        (value.width === null || typeof value.width === "number") &&
        (value.height === null || typeof value.height === "number"));
}
function readStoredPanelSize() {
    if (typeof window === "undefined") {
        return DEFAULT_PANEL_SIZE;
    }
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (isPanelSizeState(parsed)) {
                const migrated = {
                    width: normalizeStoredWidth(parsed.width),
                    height: parsed.height,
                };
                return clampPanelSize(migrated);
            }
            if (isLegacyPanelSize(parsed)) {
                const migrated = {
                    width: normalizeStoredWidth(parsed.width),
                    height: parsed.height === PANEL_DEFAULT_HEIGHT ? null : parsed.height,
                };
                return clampPanelSize(migrated);
            }
        }
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
    return DEFAULT_PANEL_SIZE;
}
function persistPanelSize(size) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function getResizeEdgesForCorner(corner) {
    switch (corner) {
        case "bottom-right":
            return { widthEdge: "left", heightEdge: "top" };
        case "bottom-left":
            return { widthEdge: "right", heightEdge: "top" };
        case "top-right":
            return { widthEdge: "left", heightEdge: "bottom" };
        case "top-left":
            return { widthEdge: "right", heightEdge: "bottom" };
    }
}
export function panelSizeToStyle(size, applyFixedHeight = false) {
    const margin = getViewportMarginPx();
    const style = {
        width: size.width,
        maxWidth: `calc(100svw - ${margin}px)`,
        maxHeight: `calc(100svh - ${margin}px)`,
    };
    if (applyFixedHeight && size.height !== null) {
        style.height = size.height;
    }
    return style;
}
const RESIZE_LISTENER_OPTIONS = { capture: true };
export function usePanelResize({ enabled, corner, heightResizeEnabled, panelRef, }) {
    const [size, setSize] = useState(() => readStoredPanelSize());
    const [isResizing, setIsResizing] = useState(false);
    const resizeSessionRef = useRef(null);
    const resizeListenersRef = useRef(null);
    const { widthEdge, heightEdge } = getResizeEdgesForCorner(corner);
    const detachResizeListeners = useCallback(() => {
        const listeners = resizeListenersRef.current;
        if (!listeners) {
            return;
        }
        window.removeEventListener("pointermove", listeners.move, RESIZE_LISTENER_OPTIONS);
        window.removeEventListener("pointerup", listeners.up, RESIZE_LISTENER_OPTIONS);
        window.removeEventListener("pointercancel", listeners.up, RESIZE_LISTENER_OPTIONS);
        resizeListenersRef.current = null;
    }, []);
    useEffect(() => {
        if (enabled) {
            return;
        }
        detachResizeListeners();
        resizeSessionRef.current = null;
        setIsResizing(false);
    }, [detachResizeListeners, enabled]);
    useEffect(() => {
        if (!enabled) {
            return;
        }
        const handleWindowResize = () => {
            setSize((current) => clampPanelSize(current));
        };
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, [enabled]);
    useEffect(() => () => detachResizeListeners(), [detachResizeListeners]);
    const resolveResizeSizeForEdge = useCallback((edge) => {
        if (edge !== "top" && edge !== "bottom") {
            return size;
        }
        if (size.height !== null) {
            return size;
        }
        const measuredHeight = panelRef.current?.getBoundingClientRect().height;
        return {
            ...size,
            height: measuredHeight ? clampHeight(measuredHeight) : PANEL_HEIGHT_MIN,
        };
    }, [panelRef, size]);
    const applyResize = useCallback((session, clientX, clientY) => {
        const deltaX = clientX - session.startX;
        const deltaY = clientY - session.startY;
        const startHeight = session.startSize.height ?? PANEL_HEIGHT_MIN;
        let nextWidth = session.startSize.width;
        let nextHeight = startHeight;
        if (session.edge === "left") {
            if (session.corner.endsWith("right")) {
                nextWidth = session.startSize.width - deltaX;
            }
            else {
                nextWidth = session.startSize.width + deltaX;
            }
        }
        if (session.edge === "right") {
            if (session.corner.endsWith("left")) {
                nextWidth = session.startSize.width + deltaX;
            }
            else {
                nextWidth = session.startSize.width - deltaX;
            }
        }
        if (session.edge === "top") {
            if (session.corner.startsWith("bottom")) {
                nextHeight = startHeight - deltaY;
            }
            else {
                nextHeight = startHeight + deltaY;
            }
        }
        if (session.edge === "bottom") {
            if (session.corner.startsWith("top")) {
                nextHeight = startHeight + deltaY;
            }
            else {
                nextHeight = startHeight - deltaY;
            }
        }
        setSize(clampPanelSize({
            width: nextWidth,
            height: session.edge === "top" || session.edge === "bottom" ? nextHeight : session.startSize.height,
        }));
    }, []);
    const finishResize = useCallback(() => {
        detachResizeListeners();
        setSize((current) => {
            const clamped = clampPanelSize(current);
            persistPanelSize(clamped);
            return clamped;
        });
        resizeSessionRef.current = null;
        setIsResizing(false);
    }, [detachResizeListeners]);
    const handleResizePointerDown = useCallback((edge) => (event) => {
        if (!enabled || event.button !== 0) {
            return;
        }
        if ((edge === "top" || edge === "bottom") && !heightResizeEnabled) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        detachResizeListeners();
        event.currentTarget.setPointerCapture(event.pointerId);
        const startSize = resolveResizeSizeForEdge(edge);
        if (startSize.height !== size.height) {
            setSize(startSize);
        }
        resizeSessionRef.current = {
            edge,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startSize,
            corner,
        };
        setIsResizing(true);
        const handlePointerMove = (moveEvent) => {
            const session = resizeSessionRef.current;
            if (!session || session.pointerId !== moveEvent.pointerId) {
                return;
            }
            applyResize(session, moveEvent.clientX, moveEvent.clientY);
        };
        const handlePointerUp = (upEvent) => {
            const session = resizeSessionRef.current;
            if (!session || session.pointerId !== upEvent.pointerId) {
                return;
            }
            finishResize();
        };
        resizeListenersRef.current = { move: handlePointerMove, up: handlePointerUp };
        window.addEventListener("pointermove", handlePointerMove, RESIZE_LISTENER_OPTIONS);
        window.addEventListener("pointerup", handlePointerUp, RESIZE_LISTENER_OPTIONS);
        window.addEventListener("pointercancel", handlePointerUp, RESIZE_LISTENER_OPTIONS);
    }, [applyResize, corner, detachResizeListeners, enabled, finishResize, heightResizeEnabled, resolveResizeSizeForEdge, size]);
    const resetPanelSize = useCallback(() => {
        const next = clampPanelSize(DEFAULT_PANEL_SIZE);
        setSize(next);
        persistPanelSize(next);
    }, []);
    return {
        panelSize: size,
        isResizing,
        widthEdge,
        heightEdge,
        heightResizeEnabled,
        handleResizePointerDown,
        resetPanelSize,
        isDefaultSize: size.width === PANEL_DEFAULT_WIDTH && size.height === null,
    };
}
//# sourceMappingURL=usePanelResize.js.map