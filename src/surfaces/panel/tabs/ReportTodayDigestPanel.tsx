import { useCallback } from "react";
import type { ReportFeedback } from "@/shared/types/report.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { filterTodayDigest } from "@/shared/utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";

export function ReportTodayDigestPanel() {
    const { messages } = useReportPreferences();
    const filter = useCallback((reports: ReportFeedback[]) => filterTodayDigest(reports), []);

    return (
        <ExperimentalFilteredListPanel
            title={messages.panel.tabTodayDigest}
            filter={filter}
        />
    );
}
