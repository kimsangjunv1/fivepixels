import { useReportPreferences } from "@/providers/reportContext.js";
import { filterMyTasks } from "@/utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";

export function ReportMyTasksPanel() {
    const { messages } = useReportPreferences();

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ExperimentalFilteredListPanel
                title={messages.panel.tabMyTasks}
                filter={filterMyTasks}
            />
        </div>
    );
}
