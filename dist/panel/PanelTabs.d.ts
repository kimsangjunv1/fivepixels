import { type UserSelectablePanelTab } from "../constants/panelTabRegistry.js";
import type { ReportMessages } from "../i18n/types.js";
import type { ReportPanelTab } from "../types/report-ui.js";
type PanelTabsProps = {
    tabs: UserSelectablePanelTab[];
    activeTab: ReportPanelTab | null;
    messages: ReportMessages;
    onTabClick: (tab: UserSelectablePanelTab) => void;
};
/** Single visual entry point for panel tab buttons and their styles. */
export declare function PanelTabs({ tabs, activeTab, messages, onTabClick }: PanelTabsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelTabs.d.ts.map