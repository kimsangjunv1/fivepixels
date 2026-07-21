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
export function getPanelRoleTabPreset(role) {
    return PANEL_ROLE_TAB_PRESETS[role];
}
//# sourceMappingURL=panelTabPresets.js.map