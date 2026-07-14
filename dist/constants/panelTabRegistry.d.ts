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
export declare const PANEL_USER_TAB_REGISTRY: PanelTabDefinition[];
export declare const PANEL_USER_TAB_IDS: UserSelectablePanelTab[];
export declare function isUserSelectablePanelTab(value: unknown): value is UserSelectablePanelTab;
export declare function getPanelTabDefinition(tabId: UserSelectablePanelTab): PanelTabDefinition;
export declare function getAvailableUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[];
export declare function getStableUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[];
export declare function getExperimentalUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[];
//# sourceMappingURL=panelTabRegistry.d.ts.map