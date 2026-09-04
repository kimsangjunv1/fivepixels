import { useLayoutEffect, useRef, useState, type ReactElement } from "react";

export type FixedPositionOrigin = {
    left: number;
    top: number;
};

const ZERO_ORIGIN: FixedPositionOrigin = { left: 0, top: 0 };

/**
 * Measures where `position: fixed; left:0; top:0` actually lands.
 * In fullscreen report hosts this is ~(0,0). Inside embedded demo mounts it can
 * be offset from the viewport, so callers should subtract this origin when
 * applying viewport-based getBoundingClientRect values to fixed layers.
 */
export function useFixedPositionOrigin() {
    const originProbeRef = useRef<HTMLDivElement | null>(null);
    const [origin, setOrigin] = useState<FixedPositionOrigin>(ZERO_ORIGIN);

    useLayoutEffect(() => {
        const probe = originProbeRef.current;
        if (!probe) {
            return;
        }

        const update = () => {
            const rect = probe.getBoundingClientRect();
            setOrigin((current) => (current.left === rect.left && current.top === rect.top ? current : { left: rect.left, top: rect.top }));
        };

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, []);

    const originProbe: ReactElement = (
        <div
            ref={originProbeRef}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-hidden opacity-0"
        />
    );

    return { origin, originProbe };
}

export function toFixedLayerPosition(viewportLeft: number, viewportTop: number, origin: FixedPositionOrigin) {
    return {
        left: viewportLeft - origin.left,
        top: viewportTop - origin.top,
    };
}
