import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getOverlayMinimizedDockOrder,
    isOverlayMinimizedDocked,
    registerOverlayMinimizedDock,
    reorderOverlayMinimizedDock,
    subscribeOverlayMinimizedDock,
    unregisterOverlayMinimizedDock,
} from "@/utils/overlay/overlayMinimizedDockRegistry.js";
import {
    MINIMIZED_DOCK_SLIDE_TRANSITION,
    MINIMIZED_WINDOW_HEIGHT,
    MINIMIZED_WINDOW_MARGIN,
    MINIMIZED_WINDOW_WIDTH,
    MINIMIZE_MORPH_TRANSITION,
    prefersReducedMotion,
    resolveMinimizedDockPosition,
} from "@/utils/overlay/minimizedDockLayout.js";

export type DockMorphRect = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export type DockMorphState = (DockMorphRect & { phase: "minimizing" | "restoring" }) | null;

type UseOverlayMinimizedDockOptions = {
    windowId: string;
    enabled: boolean;
    isMinimized: boolean;
    onMinimizedChange: (minimized: boolean) => void;
};

export function useOverlayMinimizedDock({ windowId, enabled, isMinimized, onMinimizedChange }: UseOverlayMinimizedDockOptions) {
    const [dockOrder, setDockOrder] = useState<string[]>(() => [...getOverlayMinimizedDockOrder()]);
    const [dockMorph, setDockMorph] = useState<DockMorphState>(null);

    useEffect(() => {
        return subscribeOverlayMinimizedDock(() => {
            setDockOrder([...getOverlayMinimizedDockOrder()]);
        });
    }, []);

    const dockIndex = Math.max(0, dockOrder.indexOf(windowId));
    const dockCount = Math.max(isMinimized ? dockOrder.length : dockOrder.length || 1, 1);

    const minimizedWidth = useMemo(() => {
        const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
        return Math.min(MINIMIZED_WINDOW_WIDTH, Math.max(0, viewportWidth - MINIMIZED_WINDOW_MARGIN * 2));
    }, [dockOrder.length]);

    const dockPosition = useMemo(() => {
        const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
        const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;

        return resolveMinimizedDockPosition(dockIndex, dockCount, viewportWidth, viewportHeight, minimizedWidth, MINIMIZED_WINDOW_HEIGHT);
    }, [dockCount, dockIndex, minimizedWidth]);

    const runDockMorph = useCallback((phase: "minimizing" | "restoring", from: DockMorphRect, to: DockMorphRect, onComplete?: () => void) => {
        if (prefersReducedMotion()) {
            onComplete?.();
            setDockMorph(null);
            return;
        }

        setDockMorph({ ...from, phase });

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                setDockMorph({ ...to, phase });
                window.setTimeout(() => {
                    onComplete?.();
                    setDockMorph(null);
                }, 460);
            });
        });
    }, []);

    const minimizeToDock = useCallback(
        (from: DockMorphRect) => {
            registerOverlayMinimizedDock(windowId);
            const nextOrder = getOverlayMinimizedDockOrder();
            const nextIndex = Math.max(0, nextOrder.indexOf(windowId));
            const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
            const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
            const to = resolveMinimizedDockPosition(nextIndex, nextOrder.length, viewportWidth, viewportHeight, minimizedWidth, MINIMIZED_WINDOW_HEIGHT);

            const target: DockMorphRect = {
                left: to.left,
                top: to.top,
                width: minimizedWidth,
                height: MINIMIZED_WINDOW_HEIGHT,
            };

            if (prefersReducedMotion()) {
                onMinimizedChange(true);
                setDockMorph(null);
                return;
            }

            runDockMorph("minimizing", from, target, () => {
                onMinimizedChange(true);
            });
        },
        [minimizedWidth, onMinimizedChange, runDockMorph, windowId],
    );

    const restoreFromDock = useCallback(
        (to: DockMorphRect) => {
            unregisterOverlayMinimizedDock(windowId);

            const from: DockMorphRect = {
                left: dockPosition.left,
                top: dockPosition.top,
                width: minimizedWidth,
                height: MINIMIZED_WINDOW_HEIGHT,
            };

            if (prefersReducedMotion()) {
                onMinimizedChange(false);
                setDockMorph(null);
                return;
            }

            runDockMorph("restoring", from, to, () => {
                onMinimizedChange(false);
            });
        },
        [dockPosition.left, dockPosition.top, minimizedWidth, onMinimizedChange, runDockMorph, windowId],
    );

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (!isMinimized && isOverlayMinimizedDocked(windowId)) {
            unregisterOverlayMinimizedDock(windowId);
        }
    }, [enabled, isMinimized, windowId]);

    const layoutTransition = dockMorph ? MINIMIZE_MORPH_TRANSITION : isMinimized ? MINIMIZED_DOCK_SLIDE_TRANSITION : undefined;

    return {
        dockMorph,
        dockPosition,
        dockIndex,
        dockCount,
        minimizedWidth,
        layoutTransition,
        minimizeToDock,
        restoreFromDock,
        reorderDockItem: reorderOverlayMinimizedDock,
    };
}
