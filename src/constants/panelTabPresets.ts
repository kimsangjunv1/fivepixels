import type { PanelRole } from "@/constants/panelRole.js";
import type { UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";
import type { ReportListScope } from "@/types/report-ui.js";

export type PanelHeaderStatsScope = "current-page" | "all";

export type PanelRoleTabPreset = {
    recommended: UserSelectablePanelTab[];
    defaultVisible: UserSelectablePanelTab[];
    defaultTab: UserSelectablePanelTab;
    headerStatsScope: PanelHeaderStatsScope;
    defaultListScope: ReportListScope;
};

export const PANEL_ROLE_TAB_PRESETS: Record<PanelRole, PanelRoleTabPreset> = {
    "general-user": {
        recommended: ["route-details"],
        defaultVisible: ["route-details"],
        defaultTab: "route-details",
        headerStatsScope: "current-page",
        defaultListScope: "current",
    },
    designer: {
        recommended: ["route-details", "feedback-list"],
        defaultVisible: ["route-details", "feedback-list"],
        defaultTab: "route-details",
        headerStatsScope: "current-page",
        defaultListScope: "current",
    },
    qa: {
        recommended: ["feedback-list", "route-details"],
        defaultVisible: ["feedback-list", "route-details"],
        defaultTab: "feedback-list",
        headerStatsScope: "current-page",
        defaultListScope: "current",
    },
    developer: {
        recommended: ["feedback-list", "route-details"],
        defaultVisible: ["feedback-list", "route-details", "diagnostics"],
        defaultTab: "feedback-list",
        headerStatsScope: "current-page",
        defaultListScope: "current",
    },
    planner: {
        recommended: ["feedback-list", "route-details"],
        defaultVisible: ["feedback-list", "route-details"],
        defaultTab: "feedback-list",
        headerStatsScope: "current-page",
        defaultListScope: "current",
    },
    general: {
        recommended: ["route-details", "feedback-list"],
        defaultVisible: ["route-details", "feedback-list"],
        defaultTab: "route-details",
        headerStatsScope: "current-page",
        defaultListScope: "current",
    },
};

export function getPanelRoleTabPreset(role: PanelRole): PanelRoleTabPreset {
    return PANEL_ROLE_TAB_PRESETS[role];
}
