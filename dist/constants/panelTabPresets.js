export const PANEL_ROLE_TAB_PRESETS = {
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
        recommended: ["feedback-list", "overview"],
        defaultVisible: ["feedback-list", "overview", "route-details"],
        defaultTab: "feedback-list",
        headerStatsScope: "all",
        defaultListScope: "all",
    },
    developer: {
        recommended: ["feedback-list", "route-details"],
        defaultVisible: ["feedback-list", "route-details", "diagnostics"],
        defaultTab: "feedback-list",
        headerStatsScope: "all",
        defaultListScope: "all",
    },
    planner: {
        recommended: ["overview", "feedback-list"],
        defaultVisible: ["overview", "feedback-list"],
        defaultTab: "overview",
        headerStatsScope: "all",
        defaultListScope: "all",
    },
    general: {
        recommended: ["route-details", "feedback-list"],
        defaultVisible: ["route-details", "feedback-list"],
        defaultTab: "route-details",
        headerStatsScope: "all",
        defaultListScope: "all",
    },
};
export function getPanelRoleTabPreset(role) {
    return PANEL_ROLE_TAB_PRESETS[role];
}
//# sourceMappingURL=panelTabPresets.js.map