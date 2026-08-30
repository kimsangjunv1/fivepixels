import { useEffect, useRef } from "react";
import { FIVEPIXELS_HOST_ID, OVERLAY_HOST_YIELD_DELAY_MS, OVERLAY_HOST_YIELD_HOLD_MS } from "@/constants/overlayChrome.js";
import type { ReportMode } from "@/types/report-ui.js";

type UseOverlayChromeArgs = {
    mode: ReportMode;
};

function getMountElement(): HTMLElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    const host = document.getElementById(FIVEPIXELS_HOST_ID);

    return host?.shadowRoot?.querySelector("[data-fivepixels-mount]") as HTMLElement | null;
}

function isFivepixelsPointerTarget(target: EventTarget | null): boolean {
    return target instanceof Element && (target.id === FIVEPIXELS_HOST_ID || Boolean(target.closest(`#${FIVEPIXELS_HOST_ID}`)));
}

/**
 * Host-yield dimming for floating chrome (panel) when the user interacts with the host page.
 * Writes `data-fp-host-yield` on the shadow mount for CSS-driven dimming/peek.
 */
export function useOverlayChrome({ mode }: UseOverlayChromeArgs) {
    const yieldDelayRef = useRef<number | null>(null);
    const yieldHoldRef = useRef<number | null>(null);
    const modeRef = useRef(mode);

    modeRef.current = mode;

    useEffect(() => {
        const clearYieldTimers = () => {
            if (yieldDelayRef.current !== null) {
                window.clearTimeout(yieldDelayRef.current);
                yieldDelayRef.current = null;
            }

            if (yieldHoldRef.current !== null) {
                window.clearTimeout(yieldHoldRef.current);
                yieldHoldRef.current = null;
            }
        };

        const yieldingRef = { current: false };

        const setYielding = (yielding: boolean) => {
            if (yieldingRef.current === yielding) {
                return;
            }

            yieldingRef.current = yielding;
            const mount = getMountElement();

            if (mount) {
                mount.setAttribute("data-fp-host-yield", yielding ? "true" : "false");
            }
        };

        const markChromeActive = () => {
            clearYieldTimers();
            setYielding(false);
        };

        const markHostActive = () => {
            clearYieldTimers();
            yieldDelayRef.current = window.setTimeout(() => {
                setYielding(true);
                yieldHoldRef.current = window.setTimeout(() => {
                    setYielding(false);
                }, OVERLAY_HOST_YIELD_HOLD_MS);
            }, OVERLAY_HOST_YIELD_DELAY_MS);
        };

        const handlePointerDown = (event: PointerEvent) => {
            if (isFivepixelsPointerTarget(event.target)) {
                markChromeActive();
                return;
            }

            markHostActive();
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!isFivepixelsPointerTarget(event.target)) {
                return;
            }

            markChromeActive();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isFivepixelsPointerTarget(event.target)) {
                markChromeActive();
                return;
            }

            markHostActive();
        };

        setYielding(false);

        document.addEventListener("pointerdown", handlePointerDown, true);
        document.addEventListener("pointermove", handlePointerMove, true);
        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            clearYieldTimers();
            setYielding(false);
            document.removeEventListener("pointerdown", handlePointerDown, true);
            document.removeEventListener("pointermove", handlePointerMove, true);
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, []);

    useEffect(() => {
        if (mode !== "idle") {
            const mount = getMountElement();
            mount?.setAttribute("data-fp-host-yield", "false");
        }
    }, [mode]);
}
