import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { PanelCorner } from "@/hooks/usePanelDock.js";

export type PanelSizeState = {
    width: number;
    height: number | null;
};

export type PanelResizeEdge = "top" | "bottom" | "left" | "right";

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

const DEFAULT_PANEL_SIZE: PanelSizeState = {
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

export function getPanelSizeLimits(): { maxWidth: number; maxHeight: number } {
    if (typeof window === "undefined") {
        return { maxWidth: 800, maxHeight: 600 };
    }

    const margin = getViewportMarginPx();
    return {
        maxWidth: Math.max(PANEL_WIDTH_MIN, window.innerWidth - margin),
        maxHeight: Math.max(PANEL_HEIGHT_MIN, window.innerHeight - margin),
    };
}

function clampWidth(width: number) {
    const { maxWidth } = getPanelSizeLimits();
    return Math.min(Math.max(width, PANEL_WIDTH_MIN), maxWidth);
}

function clampHeight(height: number) {
    const { maxHeight } = getPanelSizeLimits();
    return Math.min(Math.max(height, PANEL_HEIGHT_MIN), maxHeight);
}

function clampPanelSize(size: PanelSizeState): PanelSizeState {
    return {
        width: clampWidth(size.width),
        height: size.height === null ? null : clampHeight(size.height),
    };
}

function normalizeStoredWidth(width: number | null): number {
    if (width === null || width === LEGACY_PANEL_DEFAULT_WIDTH) {
        return PANEL_DEFAULT_WIDTH;
    }

    return width;
}

function isLegacyPanelSize(value: unknown): value is { width: number; height: number } {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as { width: number }).width === "number" &&
        typeof (value as { height: number }).height === "number"
    );
}

function isPanelSizeState(value: unknown): value is { width: number | null; height: number | null } {
    return (
        typeof value === "object" &&
        value !== null &&
        ((value as { width: number | null }).width === null || typeof (value as { width: number | null }).width === "number") &&
        ((value as { height: number | null }).height === null || typeof (value as { height: number | null }).height === "number")
    );
}

function readStoredPanelSize(): PanelSizeState {
    if (typeof window === "undefined") {
        return DEFAULT_PANEL_SIZE;
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed: unknown = JSON.parse(stored);

            if (isPanelSizeState(parsed)) {
                const migrated: PanelSizeState = {
                    width: normalizeStoredWidth(parsed.width),
                    height: parsed.height,
                };
                return clampPanelSize(migrated);
            }

            if (isLegacyPanelSize(parsed)) {
                const migrated: PanelSizeState = {
                    width: normalizeStoredWidth(parsed.width),
                    height: parsed.height === PANEL_DEFAULT_HEIGHT ? null : parsed.height,
                };
                return clampPanelSize(migrated);
            }
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return DEFAULT_PANEL_SIZE;
}

function persistPanelSize(size: PanelSizeState) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function getResizeEdgesForCorner(corner: PanelCorner): { widthEdge: "left" | "right"; heightEdge: "top" | "bottom" } {
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

export function panelSizeToStyle(size: PanelSizeState, applyFixedHeight = false): CSSProperties {
    const margin = getViewportMarginPx();
    const style: CSSProperties = {
        width: size.width,
        maxWidth: `calc(100svw - ${margin}px)`,
        maxHeight: `calc(100svh - ${margin}px)`,
    };

    if (applyFixedHeight && size.height !== null) {
        style.height = size.height;
    }

    return style;
}

type ResizeSession = {
    edge: PanelResizeEdge;
    pointerId: number;
    startX: number;
    startY: number;
    startSize: PanelSizeState;
    corner: PanelCorner;
};

const RESIZE_LISTENER_OPTIONS = { capture: true } as const;

export function usePanelResize({
    enabled,
    corner,
    heightResizeEnabled,
    panelRef,
}: {
    enabled: boolean;
    corner: PanelCorner;
    heightResizeEnabled: boolean;
    panelRef: RefObject<HTMLDivElement | null>;
}) {
    const [size, setSize] = useState<PanelSizeState>(() => readStoredPanelSize());
    const [isResizing, setIsResizing] = useState(false);
    const resizeSessionRef = useRef<ResizeSession | null>(null);
    const resizeListenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);
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

    const resolveResizeSizeForEdge = useCallback(
        (edge: PanelResizeEdge): PanelSizeState => {
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
        },
        [panelRef, size],
    );

    const applyResize = useCallback((session: ResizeSession, clientX: number, clientY: number) => {
        const deltaX = clientX - session.startX;
        const deltaY = clientY - session.startY;
        const startHeight = session.startSize.height ?? PANEL_HEIGHT_MIN;
        let nextWidth = session.startSize.width;
        let nextHeight = startHeight;

        if (session.edge === "left") {
            if (session.corner.endsWith("right")) {
                nextWidth = session.startSize.width - deltaX;
            } else {
                nextWidth = session.startSize.width + deltaX;
            }
        }

        if (session.edge === "right") {
            if (session.corner.endsWith("left")) {
                nextWidth = session.startSize.width + deltaX;
            } else {
                nextWidth = session.startSize.width - deltaX;
            }
        }

        if (session.edge === "top") {
            if (session.corner.startsWith("bottom")) {
                nextHeight = startHeight - deltaY;
            } else {
                nextHeight = startHeight + deltaY;
            }
        }

        if (session.edge === "bottom") {
            if (session.corner.startsWith("top")) {
                nextHeight = startHeight + deltaY;
            } else {
                nextHeight = startHeight - deltaY;
            }
        }

        setSize(
            clampPanelSize({
                width: nextWidth,
                height: session.edge === "top" || session.edge === "bottom" ? nextHeight : session.startSize.height,
            }),
        );
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

    const handleResizePointerDown = useCallback(
        (edge: PanelResizeEdge) => (event: ReactPointerEvent<HTMLElement>) => {
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

            const handlePointerMove = (moveEvent: PointerEvent) => {
                const session = resizeSessionRef.current;

                if (!session || session.pointerId !== moveEvent.pointerId) {
                    return;
                }

                applyResize(session, moveEvent.clientX, moveEvent.clientY);
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
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
        },
        [applyResize, corner, detachResizeListeners, enabled, finishResize, heightResizeEnabled, resolveResizeSizeForEdge, size],
    );

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
