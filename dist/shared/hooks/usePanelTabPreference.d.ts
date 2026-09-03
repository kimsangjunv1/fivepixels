import type { PanelRole } from "../../shared/constants/panelRole.js";
import type { PanelTabAvailabilityContext } from "../../shared/constants/panelTabRegistry.js";
import { type PanelTabPreference } from "../../shared/utils/panel/panelTabPreference.js";
import type { UserSelectablePanelTab } from "../../shared/constants/panelTabRegistry.js";
export declare function usePanelTabPreference(): {
    storedPreference: PanelTabPreference | null;
    setPanelTabPreference: (nextPreference: PanelTabPreference) => void;
    setVisibleTabs: (visibleTabs: UserSelectablePanelTab[], context: PanelTabAvailabilityContext, customized?: boolean) => void;
    resetTabsToRoleDefault: (role: PanelRole, context: PanelTabAvailabilityContext) => void;
    applyRoleDefaultTabs: (role: PanelRole, context: PanelTabAvailabilityContext) => void;
    getVisibleTabs: (role: PanelRole, context: PanelTabAvailabilityContext) => UserSelectablePanelTab[];
};
//# sourceMappingURL=usePanelTabPreference.d.ts.map