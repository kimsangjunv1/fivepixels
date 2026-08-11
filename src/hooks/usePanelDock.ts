import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { OVERLAY_EDGE_MARGIN } from "@/constants/overlayChrome.js";
import type { DockEdge } from "@/types/pinnedFeedback.js";
import {
    DEFAULT_PANEL_EDGE_PLACEMENT,
    edgeTopFromPlacement,
    isDockEdge,
    isEdgeDockPlacement,
    projectPointerToEdgePlacement,
    resolvePanelPlacementAwayFromPin,
    sanitizeEdgeDockPlacement,
    type EdgeDockPlacement,
} from "@/utils/overlay/edgeDock.js";

export type PanelCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type PanelPlacement = EdgeDockPlacement;

type LegacyCornerPlacement = {
    corner: PanelCorner;
};

type LegacyPanelPlacement = {
    edge: "top" | "bottom" | "left" | "right";
    offset: number;
};

const STORAGE_KEY = "fivepixels:panel-placement";
const LEGACY_STORAGE_KEY = "fivepixels:panel-dock-position";
const DEFAULT_PLACEMENT: PanelPlacement = { ...DEFAULT_PANEL_EDGE_PLACEMENT };
const PANEL_FALLBACK_HEIGHT = 320;
const COLLAPSED_TAB_HEIGHT = 105;
const DRAG_THRESHOLD_PX = 6;

export const PANEL_CORNERS: PanelCorner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

type DragListenerOptions = {
    capture: true;
};

const DRAG_LISTENER_OPTIONS: DragListenerOptions = { capture: true };

const DRAG_INTERACTIVE_SELECTOR =
    'button,a,input,textarea,select,option,[role="button"],[role="menu"],[role="menuitem"],[role="listbox"],[role="option"],[contenteditable="true"],[data-fivepixels-interactive]';

function isPanelCorner(value: string | null | undefined): value is PanelCorner {
    return value === "top-left" || value === "top-right" || value === "bottom-left" || value === "bottom-right";
}

function isLegacyCornerPlacement(value: unknown): value is LegacyCornerPlacement {
    return typeof value === "object" && value !== null && "corner" in value && isPanelCorner(String((value as LegacyCornerPlacement).corner));
}

function isLegacyPanelPlacement(value: unknown): value is LegacyPanelPlacement {
    return (
        typeof value === "object" &&
        value !== null &&
        "edge" in value &&
        "offset" in value &&
        typeof (value as LegacyPanelPlacement).offset === "number" &&
        ["top", "bottom", "left", "right"].includes(String((value as LegacyPanelPlacement).edge))
    );
}

function cornerToEdgePlacement(corner: PanelCorner): PanelPlacement {
    return {
        edge: corner.endsWith("right") ? "right" : "left",
        offsetRatio: corner.startsWith("top") ? 0 : 1,
    };
}

function legacyEdgeOffsetToPlacement(edge: LegacyPanelPlacement["edge"], offset: number): PanelPlacement {
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

function legacyEdgeToPlacement(edge: string): PanelPlacement {
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

export function placementToPanelCorner(placement: PanelPlacement): PanelCorner {
    const vertical = placement.offsetRatio < 0.5 ? "top" : "bottom";
    return `${vertical}-${placement.edge}`;
}

function readStoredPlacement(): PanelPlacement {
    if (typeof window === "undefined") {
        return DEFAULT_PLACEMENT;
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (isEdgeDockPlacement(parsed) && !("corner" in (parsed as object))) {
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
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return DEFAULT_PLACEMENT;
}

/** Read the persisted panel dock for collision avoidance with other chrome. */
export function getStoredPanelPlacement(): PanelPlacement {
    return readStoredPlacement();
}

/** @deprecated Prefer getStoredPanelPlacement — kept for callers that only need a coarse corner. */
export function getStoredPanelCorner(): PanelCorner {
    return placementToPanelCorner(readStoredPlacement());
}

function persistPlacement(placement: PanelPlacement) {
    const next = sanitizeEdgeDockPlacement(placement, DEFAULT_PLACEMENT);

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
        // Ignore storage failures in restricted environments.
    }

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fivepixels:panel-placement", { detail: next }));
    }
}

export function clampPanelPlacement(placement: PanelPlacement): PanelPlacement {
    return sanitizeEdgeDockPlacement(placement, DEFAULT_PLACEMENT);
}

export function projectPointerToPlacement(clientX: number, clientY: number, height = PANEL_FALLBACK_HEIGHT): PanelPlacement {
    return projectPointerToEdgePlacement(clientX, clientY, { height, fallback: DEFAULT_PLACEMENT });
}

type PanelStyleOptions = {
    collapsed?: boolean;
    isDragging?: boolean;
    dragLeft?: number | null;
    dragTop?: number | null;
    height?: number;
};

export function placementToPanelStyle(placement: PanelPlacement, options: PanelStyleOptions = {}): CSSProperties {
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
    const style: CSSProperties = {
        position: "fixed",
        top,
        bottom: "auto",
        maxHeight: collapsed ? "none" : undefined,
        maxWidth: collapsed ? "none" : undefined,
    };

    if (placement.edge === "left") {
        style.left = collapsed ? 0 : OVERLAY_EDGE_MARGIN;
        style.right = "auto";
    } else {
        style.right = collapsed ? 0 : OVERLAY_EDGE_MARGIN;
        style.left = "auto";
    }

    return style;
}

export function placementToCollapsedPanelStyle(placement: PanelPlacement): CSSProperties {
    return placementToPanelStyle(placement, { collapsed: true });
}

export function getMobilePanelStyle(): CSSProperties {
    return {
        position: "fixed",
        top: "auto",
        right: OVERLAY_EDGE_MARGIN,
        bottom: OVERLAY_EDGE_MARGIN,
        left: OVERLAY_EDGE_MARGIN,
        maxHeight: "min(68vh, 560px)",
    };
}

export function usePanelDock({
    enabled,
    measureKey,
    collapsed = false,
    pinPlacement = null,
    onTap,
    onPlacementSettled,
}: {
    enabled: boolean;
    measureKey?: unknown;
    collapsed?: boolean;
    pinPlacement?: EdgeDockPlacement | null;
    onTap?: () => void;
    onPlacementSettled?: (placement: PanelPlacement) => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [placement, setPlacement] = useState<PanelPlacement>(() => readStoredPlacement());
    const [previewPlacement, setPreviewPlacement] = useState<PanelPlacement | null>(null);
    const [isPointerDown, setIsPointerDown] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [dragPosition, setDragPosition] = useState<{ left: number; top: number } | null>(null);
    const [measuredHeight, setMeasuredHeight] = useState(PANEL_FALLBACK_HEIGHT);
    const dragPointerIdRef = useRef<number | null>(null);
    const dragOriginRef = useRef<{ startX: number; startY: number; originLeft: number; originTop: number; height: number } | null>(null);
    const suppressClickRef = useRef(false);
    const onTapRef = useRef(onTap);
    const onPlacementSettledRef = useRef(onPlacementSettled);
    const pinPlacementRef = useRef(pinPlacement);
    const dragListenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);

    onTapRef.current = onTap;
    onPlacementSettledRef.current = onPlacementSettled;
    pinPlacementRef.current = pinPlacement;

    const currentPlacement = sanitizeEdgeDockPlacement(previewPlacement ?? placement, DEFAULT_PLACEMENT);
    const isDragging = isPointerDown && hasMoved;
    const activeEdge: DockEdge | null = isDragging ? currentPlacement.edge : null;
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

    const finishDrag = useCallback(
        (clientX: number, clientY: number, didMove: boolean) => {
            detachDragListeners();
            suppressClickRef.current = true;

            if (didMove) {
                const origin = dragOriginRef.current;
                const next = resolvePanelPlacementAwayFromPin(
                    projectPointerToEdgePlacement(clientX, clientY, {
                        height: origin?.height ?? measuredHeight,
                        fallback: DEFAULT_PLACEMENT,
                    }),
                    pinPlacementRef.current,
                );
                setPlacement(next);
                persistPlacement(next);
                onPlacementSettledRef.current?.(next);
            } else {
                onTapRef.current?.();
            }

            dragPointerIdRef.current = null;
            dragOriginRef.current = null;
            setPreviewPlacement(null);
            setDragPosition(null);
            setIsPointerDown(false);
            setHasMoved(false);
        },
        [detachDragListeners, measuredHeight],
    );

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

    const handleDragHandlePointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
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

            const handlePointerMove = (moveEvent: PointerEvent) => {
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
                setPreviewPlacement(
                    projectPointerToEdgePlacement(moveEvent.clientX, moveEvent.clientY, {
                        height: origin.height,
                        fallback: DEFAULT_PLACEMENT,
                    }),
                );
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
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
        },
        [detachDragListeners, enabled, finishDrag],
    );

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

export function panelHeaderAlignModifier(corner: PanelCorner): "align-left" | "align-right" {
    return corner.endsWith("left") ? "align-left" : "align-right";
}

export function panelAnchorSide(cornerOrEdge: PanelCorner | DockEdge): "left" | "right" {
    if (isDockEdge(cornerOrEdge)) {
        return cornerOrEdge;
    }

    return cornerOrEdge.endsWith("left") ? "left" : "right";
}
