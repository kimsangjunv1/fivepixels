import { jsx as _jsx } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from "react";
const ZERO_ORIGIN = { left: 0, top: 0 };
/**
 * Measures where `position: fixed; left:0; top:0` actually lands.
 * In fullscreen report hosts this is ~(0,0). Inside embedded demo mounts it can
 * be offset from the viewport, so callers should subtract this origin when
 * applying viewport-based getBoundingClientRect values to fixed layers.
 */
export function useFixedPositionOrigin() {
    const originProbeRef = useRef(null);
    const [origin, setOrigin] = useState(ZERO_ORIGIN);
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
    const originProbe = (_jsx("div", { ref: originProbeRef, "aria-hidden": true, className: "pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-hidden opacity-0" }));
    return { origin, originProbe };
}
export function toFixedLayerPosition(viewportLeft, viewportTop, origin) {
    return {
        left: viewportLeft - origin.left,
        top: viewportTop - origin.top,
    };
}
//# sourceMappingURL=useFixedPositionOrigin.js.map