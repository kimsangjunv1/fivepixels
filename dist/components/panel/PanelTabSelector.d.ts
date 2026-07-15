import type { PanelRole } from "../../constants/panelRole.js";
import { type PanelTabAvailabilityContext, type UserSelectablePanelTab } from "../../constants/panelTabRegistry.js";
import type { ReportMessages } from "../../i18n/types.js";
type PanelTabSelectorProps = {
    role: PanelRole;
    selectedTabs: UserSelectablePanelTab[];
    context: PanelTabAvailabilityContext;
    messages: ReportMessages;
    onChange: (nextTabs: UserSelectablePanelTab[]) => void;
};
export declare function PanelTabSelector({ role, selectedTabs, context, messages, onChange }: PanelTabSelectorProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelTabSelector.d.ts.map