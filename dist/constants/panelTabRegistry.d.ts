import type { ReportPanelTab } from "../types/report-ui.js";
export type UserSelectablePanelTab = Extract<ReportPanelTab, "route-details" | "feedback-list" | "overview" | "diagnostics" | "my-tasks" | "page-brief" | "needs-attention" | "project-health" | "today-digest">;
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
export declare const ALL_SCOPE_PANEL_TABS: readonly ["overview", "my-tasks", "needs-attention", "project-health", "today-digest"];
export declare function isAllScopePanelTab(tabId: string | null | undefined): tabId is (typeof ALL_SCOPE_PANEL_TABS)[number];
/** True when the active panel tab requires fetching listAll (deferred until selected). */
export declare function shouldEnableAllReportsFetch(params: {
    fetchEnabled: boolean;
    needsFullReportList: boolean;
    activePanelTab: string | null;
}): boolean;
export declare const PANEL_USER_TAB_REGISTRY: PanelTabDefinition[];
export declare const PANEL_USER_TAB_IDS: UserSelectablePanelTab[];
export declare function isUserSelectablePanelTab(value: unknown): value is UserSelectablePanelTab;
export declare function getPanelTabDefinition(tabId: UserSelectablePanelTab): PanelTabDefinition;
export declare function getAvailableUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[];
export declare function getStableUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[];
export declare function getExperimentalUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[];
//# sourceMappingURL=panelTabRegistry.d.ts.map