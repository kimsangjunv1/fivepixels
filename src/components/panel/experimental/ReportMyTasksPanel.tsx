import { useReportPreferences } from "@/providers/reportContext.js";
import { filterMyTasks } from "@/utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";

export function ReportMyTasksPanel() {
    const { messages } = useReportPreferences();

    return (
        <ExperimentalFilteredListPanel
            title={messages.panel.tabMyTasks}
            filter={filterMyTasks}
        />
    );
}
