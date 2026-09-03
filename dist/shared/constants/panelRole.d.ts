export declare const PANEL_ROLE_VALUES: readonly ["general", "qa", "developer", "designer", "planner", "general-user"];
export type PanelRole = (typeof PANEL_ROLE_VALUES)[number];
export declare const DEFAULT_PANEL_ROLE: PanelRole;
export declare function isPanelRole(value: unknown): value is PanelRole;
//# sourceMappingURL=panelRole.d.ts.map