const FEED_ACTIVITY_SURFACE_BASE = "rounded-[8px] px-[8px] py-[4px]";
const FEED_ACTIVITY_SURFACE = {
    resolved: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-green)_14%,transparent)]`,
    denied: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-red)_12%,transparent)]`,
    assignee: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-blue)_12%,transparent)]`,
    recheck: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_12%,transparent)]`,
    suggested: `${FEED_ACTIVITY_SURFACE_BASE} bg-[color-mix(in_srgb,var(--adaptive-accent-blue)_10%,transparent)]`,
    neutral: `${FEED_ACTIVITY_SURFACE_BASE} bg-[var(--adaptive-black100)]`,
};
export function getFeedActivitySurfaceClass(tone) {
    return FEED_ACTIVITY_SURFACE[tone];
}
export function resolveFeedActivityTone(status) {
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
//# sourceMappingURL=feedActivitySurface.js.map