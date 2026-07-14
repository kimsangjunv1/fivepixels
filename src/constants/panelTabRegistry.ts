import type { ReportPanelTab } from "@/types/report-ui.js";

export type UserSelectablePanelTab = Extract<
    ReportPanelTab,
    "route-details" | "feedback-list" | "overview" | "diagnostics" | "my-tasks" | "page-brief" | "needs-attention" | "project-health" | "today-digest"
>;

export type PanelTabAvailabilityContext = {
    showFeedbackList: boolean;
    canListAllFeedback: boolean;
};

export type PanelTabLabelKey = "tabThisPage" | "tabFeedbackList" | "tabOverview" | "tabDiagnostics" | "tabMyTasks" | "tabPageBrief" | "tabNeedsAttention" | "tabProjectHealth" | "tabTodayDigest";

export type PanelTabDefinition = {
    id: UserSelectablePanelTab;
    labelKey: PanelTabLabelKey;
    userSelectable: true;
    experimental: boolean;
    needsFullReportList: boolean;
    isAvailable: (context: PanelTabAvailabilityContext) => boolean;
};

/**
 * Tabs that need cross-page aggregation via listAll.
 * Fetched only while the tab is **active** (not merely visible in the tab bar).
 */
export const ALL_SCOPE_PANEL_TABS = ["overview", "my-tasks", "needs-attention", "project-health", "today-digest"] as const satisfies readonly UserSelectablePanelTab[];

/** @deprecated Use ALL_SCOPE_PANEL_TABS. Kept for older imports. */
export const HIGH_API_RISK_PANEL_TABS = ALL_SCOPE_PANEL_TABS;

export function isAllScopePanelTab(tabId: string | null | undefined): tabId is (typeof ALL_SCOPE_PANEL_TABS)[number] {
    return typeof tabId === "string" && (ALL_SCOPE_PANEL_TABS as readonly string[]).includes(tabId);
}

/** True when the active panel tab requires fetching listAll (deferred until selected). */
export function shouldEnableAllReportsFetch(params: {
    fetchEnabled: boolean;
    needsFullReportList: boolean;
    activePanelTab: string | null;
}): boolean {
    return params.fetchEnabled && params.needsFullReportList && isAllScopePanelTab(params.activePanelTab);
}

export const PANEL_USER_TAB_REGISTRY: PanelTabDefinition[] = [
    {
        id: "route-details",
        labelKey: "tabThisPage",
        userSelectable: true,
        experimental: false,
        needsFullReportList: false,
        isAvailable: () => true,
    },
    {
        id: "feedback-list",
        labelKey: "tabFeedbackList",
        userSelectable: true,
        experimental: false,
        needsFullReportList: true,
        isAvailable: (context) => context.showFeedbackList,
    },
    {
        id: "overview",
        labelKey: "tabOverview",
        userSelectable: true,
        experimental: true,
        needsFullReportList: true,
        isAvailable: () => true,
    },
    {
        id: "diagnostics",
        labelKey: "tabDiagnostics",
        userSelectable: true,
        experimental: false,
        needsFullReportList: false,
        isAvailable: () => true,
    },
    {
        id: "my-tasks",
        labelKey: "tabMyTasks",
        userSelectable: true,
        experimental: true,
        needsFullReportList: true,
        isAvailable: (context) => context.showFeedbackList,
    },
    {
        id: "page-brief",
        labelKey: "tabPageBrief",
        userSelectable: true,
        experimental: true,
        needsFullReportList: false,
        isAvailable: () => true,
    },
    {
        id: "needs-attention",
        labelKey: "tabNeedsAttention",
        userSelectable: true,
        experimental: true,
        needsFullReportList: true,
        isAvailable: (context) => context.showFeedbackList,
    },
    {
        id: "project-health",
        labelKey: "tabProjectHealth",
        userSelectable: true,
        experimental: true,
        needsFullReportList: true,
        isAvailable: () => true,
    },
    {
        id: "today-digest",
        labelKey: "tabTodayDigest",
        userSelectable: true,
        experimental: true,
        needsFullReportList: true,
        isAvailable: (context) => context.showFeedbackList,
    },
];

export const PANEL_USER_TAB_IDS = PANEL_USER_TAB_REGISTRY.map((tab) => tab.id) as UserSelectablePanelTab[];

export function isUserSelectablePanelTab(value: unknown): value is UserSelectablePanelTab {
    return typeof value === "string" && (PANEL_USER_TAB_IDS as readonly string[]).includes(value);
}

export function getPanelTabDefinition(tabId: UserSelectablePanelTab): PanelTabDefinition {
    const definition = PANEL_USER_TAB_REGISTRY.find((tab) => tab.id === tabId);

    if (!definition) {
        throw new Error(`Unknown panel tab: ${tabId}`);
    }

    return definition;
}

export function getAvailableUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[] {
    return PANEL_USER_TAB_REGISTRY.filter((tab) => tab.isAvailable(context));
}

export function getStableUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[] {
    return getAvailableUserTabs(context).filter((tab) => !tab.experimental);
}

export function getExperimentalUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[] {
    return getAvailableUserTabs(context).filter((tab) => tab.experimental);
}
