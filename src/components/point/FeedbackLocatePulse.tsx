import { useEffect, useState } from "react";
import { DOT_SIZE } from "../../constants/report.js";
import { motion, type MotionTransition } from "../motion/index.js";
import { LOCATE_PULSE_DURATION_MS } from "../../utils/locateFeedback.js";

export const LOCATE_PULSE_TRANSITION: MotionTransition = {
    duration: 0.65,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
};

export const LOCATE_PULSE_RIPPLE_TRANSITION: MotionTransition = {
    duration: 0.8,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
};

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
    const centerX = left + DOT_SIZE / 2;
    const centerY = top + DOT_SIZE / 2;

    return (
        <>
            <motion.div
                aria-hidden
                className="pointer-events-none fixed z-[999998] rounded-full"
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
                animate={isPeak ? { scale: 1.85, opacity: 0 } : { scale: 1, opacity: 0.8 }}
                transition={LOCATE_PULSE_RIPPLE_TRANSITION}
            />

            <motion.div
                aria-hidden
                className="pointer-events-none fixed z-[999999] rounded-full"
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
                animate={isPeak ? { scale: 1.45, opacity: 1 } : { scale: 0.9, opacity: 0.4 }}
                transition={LOCATE_PULSE_TRANSITION}
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
            <motion.div
                aria-hidden
                className="pointer-events-none fixed rounded-[6px]"
                style={{
                    left: rect.left - 8,
                    top: rect.top - 8,
                    width: rect.width + 16,
                    height: rect.height + 16,
                    transformOrigin: "center center",
                    border: "2px solid rgba(56, 189, 248, 0.9)",
                    boxShadow: "0 0 32px rgba(56, 189, 248, 0.45)",
                }}
                animate={isPeak ? { scale: 1.06, opacity: 1 } : { scale: 1, opacity: 0.35 }}
                transition={LOCATE_PULSE_TRANSITION}
            />

            <motion.div
                aria-hidden
                className="pointer-events-none fixed rounded-[3px]"
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
                animate={isPeak ? { scale: 1.02, opacity: 1 } : { scale: 1, opacity: 0.55 }}
                transition={LOCATE_PULSE_TRANSITION}
            />
        </>
    );
}
