import type { ReportReplyStatus } from "@/types/report.js";

export type FeedActivityTone = "resolved" | "denied" | "assignee" | "recheck" | "suggested" | "neutral";

const FEED_ACTIVITY_SURFACE_BASE = "rounded-[8px] px-[8px] py-[4px]";

const FEED_ACTIVITY_SURFACE: Record<FeedActivityTone, string> = {
    resolved: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-green)_14%,transparent)]`,
    denied: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-red)_12%,transparent)]`,
    assignee: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-blue)_12%,transparent)]`,
    recheck: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_12%,transparent)]`,
    suggested: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-blue)_10%,transparent)]`,
    neutral: `${FEED_ACTIVITY_SURFACE_BASE} bg-[var(--adaptive-black100)]`,
};

/** Compact spine-node chip — same tone mix as the activity surface, sized for icons. */
const FEED_SPINE_NODE_SURFACE: Record<FeedActivityTone, string> = {
    resolved: "bg-[color-mix(in_srgb,var(--adaptive-accent-green)_14%,transparent)] text-[var(--adaptive-accent-green)]",
    denied: "bg-[color-mix(in_srgb,var(--adaptive-accent-red)_12%,transparent)] text-[var(--adaptive-accent-red)]",
    assignee: "bg-[color-mix(in_srgb,var(--adaptive-accent-blue)_12%,transparent)] text-[var(--adaptive-accent-blue)]",
    recheck: "bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_12%,transparent)] text-[var(--adaptive-accent-coral)]",
    suggested: "bg-[color-mix(in_srgb,var(--adaptive-accent-blue)_10%,transparent)] text-[var(--adaptive-accent-blue)]",
    neutral: "bg-[var(--adaptive-black100)] text-[var(--adaptive-black500)]",
};

export function getFeedActivitySurfaceClass(tone: FeedActivityTone) {
    return FEED_ACTIVITY_SURFACE[tone];
}

export function getFeedSpineNodeSurfaceClass(tone: FeedActivityTone) {
    return FEED_SPINE_NODE_SURFACE[tone];
}

export function resolveFeedActivityTone(status: ReportReplyStatus | "detached"): FeedActivityTone {
    switch (status) {
        case "resolved":
            return "resolved";
        case "found_error":
            return "denied";
        case "assignee_assigned":
        case "assignee_transferred":
            return "assignee";
        case "recheck_requested":
            return "recheck";
        case "suggested":
            return "suggested";
        case "detached":
            return "neutral";
        default:
            return "neutral";
    }
}
