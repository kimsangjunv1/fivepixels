export const PANEL_ROLE_VALUES = ["general", "qa", "developer", "designer", "planner", "general-user"] as const;

export type PanelRole = (typeof PANEL_ROLE_VALUES)[number];

export const DEFAULT_PANEL_ROLE: PanelRole = "general";

export function isPanelRole(value: unknown): value is PanelRole {
    return typeof value === "string" && (PANEL_ROLE_VALUES as readonly string[]).includes(value);
}
