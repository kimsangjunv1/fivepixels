export const PANEL_USER_TAB_REGISTRY = [
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
        experimental: false,
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
export const PANEL_USER_TAB_IDS = PANEL_USER_TAB_REGISTRY.map((tab) => tab.id);
export function isUserSelectablePanelTab(value) {
    return typeof value === "string" && PANEL_USER_TAB_IDS.includes(value);
}
export function getPanelTabDefinition(tabId) {
    const definition = PANEL_USER_TAB_REGISTRY.find((tab) => tab.id === tabId);
    if (!definition) {
        throw new Error(`Unknown panel tab: ${tabId}`);
    }
    return definition;
}
export function getAvailableUserTabs(context) {
    return PANEL_USER_TAB_REGISTRY.filter((tab) => tab.isAvailable(context));
}
export function getStableUserTabs(context) {
    return getAvailableUserTabs(context).filter((tab) => !tab.experimental);
}
export function getExperimentalUserTabs(context) {
    return getAvailableUserTabs(context).filter((tab) => tab.experimental);
}
//# sourceMappingURL=panelTabRegistry.js.map