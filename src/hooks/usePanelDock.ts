import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";

export type PanelEdge = "top" | "bottom" | "left" | "right";

export type PanelPlacement = {
    edge: PanelEdge;
    offset: number;
};

const STORAGE_KEY = "stitchable:panel-placement";
const LEGACY_STORAGE_KEY = "stitchable:panel-dock-position";
const EDGE_MARGIN = 16;
const DEFAULT_PLACEMENT: PanelPlacement = { edge: "left", offset: EDGE_MARGIN };

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function isPanelEdge(value: string | null): value is PanelEdge {
    return value === "top" || value === "bottom" || value === "left" || value === "right";
}

function isPanelPlacement(value: unknown): value is PanelPlacement {
    return (
        typeof value === "object" &&
        value !== null &&
        "edge" in value &&
        "offset" in value &&
        isPanelEdge(String((value as PanelPlacement).edge)) &&
        typeof (value as PanelPlacement).offset === "number"
    );
}

function readStoredPlacement(): PanelPlacement {
    if (typeof window === "undefined") {
        return DEFAULT_PLACEMENT;
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (isPanelPlacement(parsed)) {
                return parsed;
            }
        }

        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (isPanelEdge(legacy)) {
            return { edge: legacy, offset: EDGE_MARGIN };
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return DEFAULT_PLACEMENT;
}

function persistPlacement(placement: PanelPlacement) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(placement));
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function getNearestPanelEdge(clientX: number, clientY: number): PanelEdge {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const distances: Array<[PanelEdge, number]> = [
        ["top", clientY],
        ["bottom", viewportHeight - clientY],
        ["left", clientX],
        ["right", viewportWidth - clientX],
    ];

    distances.sort((a, b) => a[1] - b[1]);
    return distances[0][0];
}

function getPanelSize(panelRef: RefObject<HTMLElement | null>) {
    const rect = panelRef.current?.getBoundingClientRect();
    return {
        width: rect?.width ?? 320,
        height: rect?.height ?? 240,
    };
}

export function clampPanelPlacement(
    placement: PanelPlacement,
    panelWidth: number,
    panelHeight: number,
): PanelPlacement {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (placement.edge === "top" || placement.edge === "bottom") {
        const min = EDGE_MARGIN;
        const max = Math.max(min, viewportWidth - panelWidth - EDGE_MARGIN);
        return {
            edge: placement.edge,
            offset: clamp(placement.offset, min, max),
        };
    }

    const min = EDGE_MARGIN;
    const max = Math.max(min, viewportHeight - panelHeight - EDGE_MARGIN);
    return {
        edge: placement.edge,
        offset: clamp(placement.offset, min, max),
    };
}

export function projectPointerToPlacement(
    clientX: number,
    clientY: number,
    panelWidth: number,
    panelHeight: number,
): PanelPlacement {
    const edge = getNearestPanelEdge(clientX, clientY);

    if (edge === "top" || edge === "bottom") {
        return clampPanelPlacement(
            {
                edge,
                offset: clientX - panelWidth / 2,
            },
            panelWidth,
            panelHeight,
        );
    }

    return clampPanelPlacement(
        {
            edge,
            offset: clientY - panelHeight / 2,
        },
        panelWidth,
        panelHeight,
    );
}

export function placementToPanelStyle(placement: PanelPlacement): CSSProperties {
    const style: CSSProperties = {
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto",
        overflow: "visible",
        maxHeight: "none",
    };

    switch (placement.edge) {
        case "top":
            style.top = EDGE_MARGIN;
            style.left = placement.offset;
            break;
        case "bottom":
            style.bottom = EDGE_MARGIN;
            style.left = placement.offset;
            style.maxHeight = "min(68vh, 560px)";
            style.overflow = "auto";
            break;
        case "left":
            style.left = EDGE_MARGIN;
            style.top = placement.offset;
            style.maxHeight = `calc(100vh - ${EDGE_MARGIN * 2}px)`;
            style.overflow = "auto";
            break;
        case "right":
            style.right = EDGE_MARGIN;
            style.top = placement.offset;
            style.maxHeight = `calc(100vh - ${EDGE_MARGIN * 2}px)`;
            style.overflow = "auto";
            break;
    }

    return style;
}

export function getMobilePanelStyle(): CSSProperties {
    return {
        top: "auto",
        right: EDGE_MARGIN,
        bottom: EDGE_MARGIN,
        left: EDGE_MARGIN,
        maxHeight: "min(68vh, 560px)",
        overflow: "auto",
    };
}

export function usePanelDock({ enabled, measureKey }: { enabled: boolean; measureKey?: unknown }) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [placement, setPlacement] = useState<PanelPlacement>(() => readStoredPlacement());
    const [previewPlacement, setPreviewPlacement] = useState<PanelPlacement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragPointerIdRef = useRef<number | null>(null);

    const currentPlacement = previewPlacement ?? placement;
    const activeEdge = isDragging ? currentPlacement.edge : null;

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

        const panelSize = getPanelSize(panelRef);
        setPlacement((current) => clampPanelPlacement(current, panelSize.width, panelSize.height));
    }, [enabled, measureKey]);

    const updatePlacementFromPointer = useCallback((clientX: number, clientY: number) => {
        const panelSize = getPanelSize(panelRef);
        const nextPlacement = projectPointerToPlacement(clientX, clientY, panelSize.width, panelSize.height);
        setPreviewPlacement(nextPlacement);
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
            const panelSize = getPanelSize(panelRef);
            setPlacement((current) => clampPanelPlacement(current, panelSize.width, panelSize.height));
            setPreviewPlacement((current) =>
                current ? clampPanelPlacement(current, panelSize.width, panelSize.height) : current,
            );
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [enabled]);

    useEffect(() => {
        if (!isDragging) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            if (dragPointerIdRef.current !== event.pointerId) {
                return;
            }

            updatePlacementFromPointer(event.clientX, event.clientY);
        };

        const handlePointerUp = (event: PointerEvent) => {
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

    const handleDragHandlePointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (!enabled || event.button !== 0) {
                return;
            }

            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            dragPointerIdRef.current = event.pointerId;
            setIsDragging(true);
            updatePlacementFromPointer(event.clientX, event.clientY);
        },
        [enabled, updatePlacementFromPointer],
    );

    const panelStyle = enabled ? placementToPanelStyle(currentPlacement) : getMobilePanelStyle();

    return {
        panelRef,
        panelStyle,
        isDragging,
        activeEdge,
        handleDragHandlePointerDown,
    };
}
