import type { PanelRole } from "../constants/panelRole.js";
import { type PanelTabAvailabilityContext, type UserSelectablePanelTab } from "../constants/panelTabRegistry.js";
export type PanelTabPreference = {
    visibleTabs: UserSelectablePanelTab[];
    customized: boolean;
};
export declare function isTabRecommendedForRole(role: PanelRole, tabId: UserSelectablePanelTab): boolean;
export declare function getDefaultVisibleTabsForRole(role: PanelRole, context: PanelTabAvailabilityContext): UserSelectablePanelTab[];
export declare function sanitizeVisibleTabs(value: unknown, context: PanelTabAvailabilityContext): UserSelectablePanelTab[];
export declare function resolveVisibleTabs({ role, preference, context, }: {
    role: PanelRole;
    preference: PanelTabPreference | null;
    context: PanelTabAvailabilityContext;
}): UserSelectablePanelTab[];
export declare function resolveDefaultPanelTab(role: PanelRole, visibleTabs: UserSelectablePanelTab[]): UserSelectablePanelTab;
export declare function createRoleDefaultPreference(role: PanelRole, context: PanelTabAvailabilityContext): PanelTabPreference;
export declare function formatVisibleTabSummary(visibleTabs: UserSelectablePanelTab[], labels: Record<UserSelectablePanelTab, string>): string;
export declare function moveVisibleTab(tabs: UserSelectablePanelTab[], tabId: UserSelectablePanelTab, direction: "up" | "down"): UserSelectablePanelTab[];
//# sourceMappingURL=panelTabPreference.d.ts.map