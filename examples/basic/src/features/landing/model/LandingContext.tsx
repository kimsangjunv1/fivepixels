import { createContext, useContext, type PropsWithChildren } from "react";

export type PulseTag = "BUG" | "COPY" | "A11Y" | "UI";

export type KanbanCard = {
    id: string;
    title: string;
    tags: PulseTag[];
    assignee: string;
    description?: string;
};

export type KanbanColumn = {
    id: string;
    title: string;
    cards: KanbanCard[];
};

export type ActivityItem = {
    id: string;
    actor: string;
    action: string;
    linkLabel: string;
    linkId: string;
    time: string;
};

type LandingContextValue = {
    stats: Array<{
        id: string;
        label: string;
        value: number;
        meta: string;
        metaTone: "up" | "info" | "success";
    }>;
    kanbanColumns: KanbanColumn[];
    activities: ActivityItem[];
    navItems: Array<{ id: string; label: string; icon: string; to: string }>;
};

const landingValue: LandingContextValue = {
    stats: [
        { id: "stat-open", label: "Open issues", value: 24, meta: "+3 today", metaTone: "up" },
        { id: "stat-staged", label: "Staged feedback", value: 11, meta: "5 awaiting review", metaTone: "info" },
        { id: "stat-resolved", label: "Resolved this week", value: 38, meta: "+12% vs last week", metaTone: "success" },
    ],
    kanbanColumns: [
        {
            id: "kanban-todo",
            title: "To Do",
            cards: [
                {
                    id: "kanban-card-checkout",
                    title: "Checkout button misaligned on mobile",
                    tags: ["BUG", "UI"],
                    assignee: "Kim",
                    description:
                        "On iPhone 14 Pro the primary checkout CTA drifts 8px below the price summary block.\n\nSteps:\n1. Open cart with 2+ items\n2. Scroll to summary\n3. Rotate to landscape\n\nExpected: CTA stays aligned with summary card.\nActual: CTA overlaps the safe-area inset.\n\nNotes from QA: reproducible in Safari 17. Also seen on smaller Android viewports when the keyboard is open.",
                },
                { id: "kanban-card-copy", title: "Update onboarding copy for trial users", tags: ["COPY"], assignee: "Lee" },
                { id: "kanban-card-focus", title: "Focus ring missing on filter chips", tags: ["A11Y", "UI"], assignee: "Park" },
                { id: "kanban-card-spacing", title: "Reduce vertical spacing in settings panel", tags: ["UI"], assignee: "Kim" },
                { id: "kanban-card-tooltip", title: "Tooltip copy truncated in Korean locale", tags: ["COPY", "BUG"], assignee: "Choi" },
            ],
        },
        {
            id: "kanban-review",
            title: "In Review",
            cards: [
                { id: "kanban-card-contrast", title: "Contrast ratio on secondary buttons", tags: ["A11Y"], assignee: "Lee" },
                { id: "kanban-card-empty", title: "Empty state illustration off-brand", tags: ["UI", "COPY"], assignee: "Kim" },
                { id: "kanban-card-modal", title: "Modal close button too small on tablet", tags: ["BUG", "UI"], assignee: "Park" },
            ],
        },
        {
            id: "kanban-done",
            title: "Done",
            cards: [
                { id: "kanban-card-avatar", title: "Avatar fallback initials style", tags: ["UI"], assignee: "Lee" },
                { id: "kanban-card-search", title: "Search placeholder localization", tags: ["COPY"], assignee: "Kim" },
                { id: "kanban-card-sidebar", title: "Sidebar collapse animation jitter", tags: ["BUG"], assignee: "Park" },
                { id: "kanban-card-table", title: "Table header sticky offset fix", tags: ["BUG", "UI"], assignee: "Choi" },
            ],
        },
    ],
    activities: [
        { id: "activity-1", actor: "Kim", action: "moved", linkLabel: "Checkout button misaligned", linkId: "activity-link-1", time: "2m ago" },
        { id: "activity-2", actor: "Lee", action: "commented on", linkLabel: "Contrast ratio review", linkId: "activity-link-2", time: "18m ago" },
        { id: "activity-3", actor: "Park", action: "resolved", linkLabel: "Avatar fallback initials", linkId: "activity-link-3", time: "1h ago" },
        { id: "activity-4", actor: "Choi", action: "created", linkLabel: "Tooltip copy truncated", linkId: "activity-link-4", time: "2h ago" },
        { id: "activity-5", actor: "Kim", action: "assigned", linkLabel: "Focus ring missing", linkId: "activity-link-5", time: "3h ago" },
        { id: "activity-6", actor: "Lee", action: "reviewed", linkLabel: "Empty state illustration", linkId: "activity-link-6", time: "4h ago" },
        { id: "activity-7", actor: "Park", action: "moved", linkLabel: "Modal close button", linkId: "activity-link-7", time: "5h ago" },
        { id: "activity-8", actor: "Sangjun", action: "exported", linkLabel: "Weekly QA report", linkId: "activity-link-8", time: "6h ago" },
        { id: "activity-9", actor: "Kim", action: "tagged", linkLabel: "Settings panel spacing", linkId: "activity-link-9", time: "7h ago" },
        { id: "activity-10", actor: "Lee", action: "closed", linkLabel: "Search placeholder fix", linkId: "activity-link-10", time: "8h ago" },
    ],
    navItems: [
        { id: "nav-overview", label: "Overview", icon: "grid", to: "/" },
        { id: "nav-issues", label: "Issues", icon: "list", to: "/issues" },
        { id: "nav-reviews", label: "Reviews", icon: "review", to: "/reviews" },
        { id: "nav-releases", label: "Releases", icon: "release", to: "/release" },
        { id: "nav-settings", label: "Settings", icon: "settings", to: "/settings" },
        { id: "nav-edgecase", label: "Edgecase", icon: "edgecase", to: "/edgecase" },
    ],
};

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingPageProvider({ children }: PropsWithChildren) {
    return <LandingContext.Provider value={landingValue}>{children}</LandingContext.Provider>;
}

export function useLandingProvider() {
    const context = useContext(LandingContext);

    if (!context) {
        throw new Error("useLandingProvider must be used within LandingPageProvider");
    }

    return context;
}
