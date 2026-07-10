import type { PanelRole } from "../constants/panelRole.js";
import type { PanelTabAvailabilityContext } from "../constants/panelTabRegistry.js";
import { type PanelTabPreference } from "../utils/panelTabPreference.js";
import type { UserSelectablePanelTab } from "../constants/panelTabRegistry.js";
export declare function usePanelTabPreference(): {
    storedPreference: PanelTabPreference | null;
    setPanelTabPreference: (nextPreference: PanelTabPreference) => void;
    setVisibleTabs: (visibleTabs: UserSelectablePanelTab[], context: PanelTabAvailabilityContext, customized?: boolean) => void;
    resetTabsToRoleDefault: (role: PanelRole, context: PanelTabAvailabilityContext) => void;
    applyRoleDefaultTabs: (role: PanelRole, context: PanelTabAvailabilityContext) => void;
    getVisibleTabs: (role: PanelRole, context: PanelTabAvailabilityContext) => UserSelectablePanelTab[];
};
//# sourceMappingURL=usePanelTabPreference.d.ts.map