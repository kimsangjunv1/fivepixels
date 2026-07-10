export const PANEL_USER_TAB_REGISTRY = [
    {
        id: "route-details",
        labelKey: "tabThisPage",
        userSelectable: true,
        needsFullReportList: false,
        isAvailable: () => true,
    },
    {
        id: "feedback-list",
        labelKey: "tabFeedbackList",
        userSelectable: true,
        needsFullReportList: true,
        isAvailable: (context) => context.showFeedbackList,
    },
    {
        id: "overview",
        labelKey: "tabOverview",
        userSelectable: true,
        needsFullReportList: true,
        isAvailable: () => true,
    },
    {
        id: "diagnostics",
        labelKey: "tabDiagnostics",
        userSelectable: true,
        needsFullReportList: false,
        isAvailable: () => true,
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
//# sourceMappingURL=panelTabRegistry.js.map