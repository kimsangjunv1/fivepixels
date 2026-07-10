import type { ReportPanelTab } from "@/types/report-ui.js";

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

export const PANEL_USER_TAB_REGISTRY: PanelTabDefinition[] = [
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
