import { useCallback, useEffect, useState } from "react";
import { useGhostCornerResize } from "../hooks/useGhostCornerResize.js";
const STORAGE_KEY = "fivepixels:panel-size";
export const PANEL_WIDTH_MIN = 375;
export const PANEL_DEFAULT_WIDTH = PANEL_WIDTH_MIN;
export const PANEL_CONTENT_MIN_HEIGHT = 220;
export const PANEL_HEADER_ESTIMATE_HEIGHT = 132;
export const PANEL_TAB_BAR_HEIGHT = 36;
export const PANEL_CHROME_MIN_HEIGHT = PANEL_HEADER_ESTIMATE_HEIGHT + PANEL_TAB_BAR_HEIGHT;
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
function clampPanelBoxSize(width, height, minHeight) {
    const { maxHeight } = getPanelSizeLimits();
    return {
        width: clampWidth(width),
        height: Math.min(Math.max(height, minHeight), maxHeight),
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
export function getOppositeResizeCorner(corner) {
    switch (corner) {
        case "top-left":
            return "bottom-right";
        case "top-right":
            return "bottom-left";
        case "bottom-left":
            return "top-right";
        case "bottom-right":
            return "top-left";
    }
}
/** @deprecated Edge resize replaced by corner ghost resize. */
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
export function usePanelResize({ enabled, corner, heightResizeEnabled, panelRef, }) {
    const [size, setSize] = useState(() => readStoredPanelSize());
    const resizeCorner = getOppositeResizeCorner(corner);
    const resolveMinHeight = useCallback(() => {
        if (heightResizeEnabled) {
            return PANEL_HEIGHT_MIN;
        }
        return panelRef.current?.getBoundingClientRect().height ?? PANEL_CHROME_MIN_HEIGHT;
    }, [heightResizeEnabled, panelRef]);
    const clampResizeBox = useCallback((width, height) => clampPanelBoxSize(width, height, resolveMinHeight()), [resolveMinHeight]);
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
    useEffect(() => {
        if (!enabled || heightResizeEnabled) {
            return;
        }
        setSize((current) => {
            if (current.height === null) {
                return current;
            }
            const next = { ...current, height: null };
            persistPanelSize(next);
            return next;
        });
    }, [enabled, heightResizeEnabled]);
    const resolveStartSize = useCallback(() => {
        if (!heightResizeEnabled) {
            const measuredHeight = panelRef.current?.getBoundingClientRect().height;
            return {
                width: size.width,
                height: measuredHeight ?? PANEL_CHROME_MIN_HEIGHT,
            };
        }
        if (size.height !== null) {
            return { width: size.width, height: size.height };
        }
        const measuredHeight = panelRef.current?.getBoundingClientRect().height;
        return {
            width: size.width,
            height: measuredHeight ? clampHeight(measuredHeight) : PANEL_HEIGHT_MIN,
        };
    }, [heightResizeEnabled, panelRef, size]);
    const handleResizeComplete = useCallback((next) => {
        let height;
        if (!heightResizeEnabled || next.height <= PANEL_CHROME_MIN_HEIGHT + 16) {
            height = null;
        }
        else {
            height = clampHeight(next.height);
        }
        const nextState = clampPanelSize({
            width: next.width,
            height,
        });
        setSize(nextState);
        persistPanelSize(nextState);
    }, [heightResizeEnabled]);
    const { isResizing, ghostRef, handleResizePointerDown } = useGhostCornerResize({
        enabled,
        targetRef: panelRef,
        handleCorner: resizeCorner,
        clampSize: clampResizeBox,
        onResizeComplete: handleResizeComplete,
        resolveStartSize,
    });
    const resetPanelSize = useCallback(() => {
        const next = clampPanelSize(DEFAULT_PANEL_SIZE);
        setSize(next);
        persistPanelSize(next);
    }, []);
    return {
        panelSize: size,
        isResizing,
        resizeCorner,
        handleResizePointerDown,
        resetPanelSize,
        ghostRef,
        isDefaultSize: size.width === PANEL_DEFAULT_WIDTH && size.height === null,
    };
}
//# sourceMappingURL=usePanelResize.js.map