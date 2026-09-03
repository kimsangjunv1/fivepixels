export const PANEL_ROLE_VALUES = ["general", "qa", "developer", "designer", "planner", "general-user"];
export const DEFAULT_PANEL_ROLE = "general";
export function isPanelRole(value) {
    return typeof value === "string" && PANEL_ROLE_VALUES.includes(value);
}
//# sourceMappingURL=panelRole.js.map