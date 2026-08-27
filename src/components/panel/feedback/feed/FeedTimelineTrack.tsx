import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FEED_RAIL_WIDTH } from "./FeedTimelineRow.js";

type FeedTimelineTrackProps = {
    children: ReactNode;
    className?: string;
};

/**
 * Continuous main spine that ends at the center of the last spine node
 * (no trailing line below the final history icon).
 */
export function FeedTimelineTrack({ children, className = "" }: FeedTimelineTrackProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [spineHeightPx, setSpineHeightPx] = useState<number | null>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;

        if (!root) {
            return;
        }

        const measure = () => {
            const nodes = root.querySelectorAll<HTMLElement>("[data-feed-spine-node='true']");
            const last = nodes[nodes.length - 1];

            if (!last) {
                setSpineHeightPx((current) => (current == null ? current : null));
                return;
            }

            const rootRect = root.getBoundingClientRect();
            const nodeRect = last.getBoundingClientRect();
            const centerY = Math.round(Math.max(0, nodeRect.top - rootRect.top + nodeRect.height / 2));
            setSpineHeightPx((current) => (current === centerY ? current : centerY));
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(root);

        const observeSpineNodes = () => {
            for (const node of root.querySelectorAll<HTMLElement>("[data-feed-spine-node='true']")) {
                resizeObserver.observe(node);
            }
        };

        observeSpineNodes();

        const mutationObserver = new MutationObserver(() => {
            observeSpineNodes();
            measure();
        });
        mutationObserver.observe(root, { childList: true, subtree: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    return (
        <div
            ref={rootRef}
            className={`relative ${className}`}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute top-0 w-px bg-[var(--adaptive-black300)]"
                style={{
                    left: FEED_RAIL_WIDTH / 2,
                    transform: "translateX(-50%)",
                    height: spineHeightPx == null ? "100%" : spineHeightPx,
                }}
            />
            {children}
        </div>
    );
}
