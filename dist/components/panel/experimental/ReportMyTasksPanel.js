import { jsx as _jsx } from "react/jsx-runtime";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { filterMyTasks } from "../../../utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";
export function ReportMyTasksPanel() {
    const { messages } = useReportPreferences();
    return (_jsx(ExperimentalFilteredListPanel, { title: messages.panel.tabMyTasks, filter: filterMyTasks }));
}
//# sourceMappingURL=ReportMyTasksPanel.js.map