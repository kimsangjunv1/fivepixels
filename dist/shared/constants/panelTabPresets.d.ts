import type { PanelRole } from "../../shared/constants/panelRole.js";
import type { UserSelectablePanelTab } from "../../shared/constants/panelTabRegistry.js";
import type { ReportListScope } from "../../shared/types/report-ui.js";
export type PanelHeaderStatsScope = "current-page" | "all";
export type PanelRoleTabPreset = {
    recommended: UserSelectablePanelTab[];
    defaultVisible: UserSelectablePanelTab[];
    defaultTab: UserSelectablePanelTab;
    headerStatsScope: PanelHeaderStatsScope;
    defaultListScope: ReportListScope;
};
export declare const PANEL_ROLE_TAB_PRESETS: Record<PanelRole, PanelRoleTabPreset>;
export declare function getPanelRoleTabPreset(role: PanelRole): PanelRoleTabPreset;
//# sourceMappingURL=panelTabPresets.d.ts.map