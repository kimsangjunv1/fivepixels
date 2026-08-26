import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from "react";
import { FEED_RAIL_WIDTH } from "./FeedTimelineRow.js";
/**
 * Continuous main spine that ends at the center of the last spine node
 * (no trailing line below the final history icon).
 */
export function FeedTimelineTrack({ children, className = "" }) {
    const rootRef = useRef(null);
    const [spineHeightPx, setSpineHeightPx] = useState(null);
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return;
        }
        const measure = () => {
            const nodes = root.querySelectorAll("[data-feed-spine-node='true']");
            const last = nodes[nodes.length - 1];
            if (!last) {
                setSpineHeightPx((current) => (current == null ? current : null));
                return;
            }
            const rootRect = root.getBoundingClientRect();
            const nodeRect = last.getBoundingClientRect();
            const centerY = Math.max(0, nodeRect.top - rootRect.top + nodeRect.height / 2);
            setSpineHeightPx((current) => (current != null && Math.abs(current - centerY) < 0.5 ? current : centerY));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(root);
        for (const node of root.querySelectorAll("[data-feed-spine-node='true']")) {
            observer.observe(node);
        }
        return () => observer.disconnect();
    });
    return (_jsxs("div", { ref: rootRef, className: `relative ${className}`, children: [_jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute top-0 w-px bg-[var(--adaptive-black300)]", style: {
                    left: FEED_RAIL_WIDTH / 2,
                    transform: "translateX(-50%)",
                    height: spineHeightPx == null ? "100%" : spineHeightPx,
                } }), children] }));
}
//# sourceMappingURL=FeedTimelineTrack.js.map