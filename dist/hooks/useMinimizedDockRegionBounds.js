import { useEffect, useState } from "react";
import { measureMinimizedDockRegion } from "../utils/overlay/minimizedDockPanelBounds.js";
const PANEL_SELECTOR = '[data-fp-chrome="panel"]';
function readMinimizedDockRegion() {
    if (typeof window === "undefined") {
        return { regionLeft: 16, regionWidth: 1248 };
    }
    return measureMinimizedDockRegion(window.innerWidth, window.innerHeight);
}
export function useMinimizedDockRegionBounds(enabled) {
    const [region, setRegion] = useState(() => readMinimizedDockRegion());
    useEffect(() => {
        if (!enabled || typeof window === "undefined") {
            return;
        }
        const update = () => {
            setRegion(readMinimizedDockRegion());
        };
        update();
        window.addEventListener("resize", update);
        const panel = document.querySelector(PANEL_SELECTOR);
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
//# sourceMappingURL=useMinimizedDockRegionBounds.js.map