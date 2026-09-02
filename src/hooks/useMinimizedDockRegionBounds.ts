import { useEffect, useState } from "react";
import { measureMinimizedDockRegion, type MinimizedDockRegion } from "@/utils/overlay/minimizedDockPanelBounds.js";

const PANEL_SELECTOR = '[data-fp-chrome="panel"]';

function readMinimizedDockRegion(): MinimizedDockRegion {
    if (typeof window === "undefined") {
        return { regionLeft: 16, regionWidth: 1248 };
    }

    return measureMinimizedDockRegion(window.innerWidth, window.innerHeight);
}

export function useMinimizedDockRegionBounds(enabled: boolean): MinimizedDockRegion {
    const [region, setRegion] = useState<MinimizedDockRegion>(() => readMinimizedDockRegion());

    useEffect(() => {
        if (!enabled || typeof window === "undefined") {
            return;
        }

        const update = () => {
            setRegion(readMinimizedDockRegion());
        };

        update();
        window.addEventListener("resize", update);

        const panel = document.querySelector<HTMLElement>(PANEL_SELECTOR);

        if (!panel) {
            return () => {
                window.removeEventListener("resize", update);
            };
        }

        const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
        resizeObserver?.observe(panel);

        const mutationObserver = typeof MutationObserver !== "undefined" ? new MutationObserver(update) : null;
        mutationObserver?.observe(panel, {
            attributes: true,
            attributeFilter: ["data-collapsed", "data-anchor-side", "style"],
        });

        return () => {
            window.removeEventListener("resize", update);
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
        };
    }, [enabled]);

    return region;
}
