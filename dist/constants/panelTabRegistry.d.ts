import type { ReportPanelTab } from "../types/report-ui.js";
export type UserSelectablePanelTab = Extract<ReportPanelTab, "route-details" | "feedback-list" | "overview" | "diagnostics">;
export type PanelTabAvailabilityContext = {
    showFeedbackList: boolean;
    canListAllFeedback: boolean;
};
export type PanelTabDefinition = {
    id: UserSelectablePanelTab;
    labelKey: "tabThisPage" | "tabFeedbackList" | "tabOverview" | "tabDiagnostics";
    userSelectable: true;
    needsFullReportList: boolean;
    isAvailable: (context: PanelTabAvailabilityContext) => boolean;
};
export declare const PANEL_USER_TAB_REGISTRY: PanelTabDefinition[];
export declare const PANEL_USER_TAB_IDS: UserSelectablePanelTab[];
export declare function isUserSelectablePanelTab(value: unknown): value is UserSelectablePanelTab;
export declare function getPanelTabDefinition(tabId: UserSelectablePanelTab): PanelTabDefinition;
export declare function getAvailableUserTabs(context: PanelTabAvailabilityContext): PanelTabDefinition[];
//# sourceMappingURL=panelTabRegistry.d.ts.map