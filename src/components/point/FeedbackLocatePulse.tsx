import { useEffect, useState } from "react";
import { getMarkerDotSize } from "@/utils/markerRuntime.js";
import { LOCATE_PULSE_DURATION_MS } from "@/utils/locateFeedback.js";

export const LOCATE_PULSE_TRANSITION_MS = 650;
export const LOCATE_PULSE_RIPPLE_TRANSITION_MS = 800;

const PULSE_TICK_MS = 650;

export function useLocatePulseTick(active: boolean) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!active) {
            setTick(0);
            return;
        }

        setTick(0);
        const startedAt = Date.now();
        const intervalId = window.setInterval(() => {
            setTick((current) => current + 1);

            if (Date.now() - startedAt >= LOCATE_PULSE_DURATION_MS) {
                window.clearInterval(intervalId);
            }
        }, PULSE_TICK_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [active]);

    return tick;
}

type MarkerLocatePulseProps = {
    left: number;
    top: number;
    tick: number;
    accentColor: string;
};

export function MarkerLocatePulse({ left, top, tick, accentColor }: MarkerLocatePulseProps) {
    const isPeak = tick % 2 === 0;
    const dotSize = getMarkerDotSize();
    const centerX = left + dotSize / 2;
    const centerY = top + dotSize / 2;

    return (
        <>
            <div
                aria-hidden
                className={`fivepixels-locate-pulse-ring pointer-events-none fixed z-[999998] rounded-full ${isPeak ? "fivepixels-locate-pulse-ring--peak" : "fivepixels-locate-pulse-ring--valley"}`}
                style={{
                    left: centerX,
                    top: centerY,
                    width: 44,
                    height: 44,
                    marginLeft: -22,
                    marginTop: -22,
                    transformOrigin: "center center",
                    border: "2px solid rgba(56, 189, 248, 0.95)",
                    boxShadow: "0 0 28px rgba(56, 189, 248, 0.65)",
                }}
            />

            <div
                aria-hidden
                className={`fivepixels-locate-pulse-core pointer-events-none fixed z-[999999] rounded-full ${isPeak ? "fivepixels-locate-pulse-core--peak" : "fivepixels-locate-pulse-core--valley"}`}
                style={{
                    left: centerX,
                    top: centerY,
                    width: 30,
                    height: 30,
                    marginLeft: -15,
                    marginTop: -15,
                    transformOrigin: "center center",
                    border: `3px solid ${accentColor}`,
                    boxShadow: `0 0 20px ${accentColor}, 0 0 36px rgba(56, 189, 248, 0.55)`,
                }}
            />
        </>
    );
}

type TargetLocatePulseProps = {
    rect: DOMRect;
    tick: number;
    outlineColor: string;
    surfaceColor: string;
};

export function TargetLocatePulse({ rect, tick, outlineColor, surfaceColor }: TargetLocatePulseProps) {
    const isPeak = tick % 2 === 0;

    return (
        <>
            <div
                aria-hidden
                className={`fivepixels-locate-pulse-target-outline pointer-events-none fixed rounded-[6px] ${isPeak ? "fivepixels-locate-pulse-target-outline--peak" : "fivepixels-locate-pulse-target-outline--valley"}`}
                style={{
                    left: rect.left - 8,
                    top: rect.top - 8,
                    width: rect.width + 16,
                    height: rect.height + 16,
                    transformOrigin: "center center",
                    border: "2px solid rgba(56, 189, 248, 0.9)",
                    boxShadow: "0 0 32px rgba(56, 189, 248, 0.45)",
                }}
            />

            <div
                aria-hidden
                className={`fivepixels-locate-pulse-target-surface pointer-events-none fixed rounded-[3px] ${isPeak ? "fivepixels-locate-pulse-target-surface--peak" : "fivepixels-locate-pulse-target-surface--valley"}`}
                style={{
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                    transformOrigin: "center center",
                    outline: `2px solid ${outlineColor}`,
                    backgroundColor: surfaceColor,
                    boxShadow: `0 0 0 2px rgba(56, 189, 248, 0.55), inset 0 0 24px rgba(56, 189, 248, 0.18)`,
                }}
            />
        </>
    );
}
