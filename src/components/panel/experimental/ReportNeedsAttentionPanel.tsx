import { useCallback } from "react";
import type { ReportFeedback } from "@/types/report.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { filterNeedsAttention } from "@/utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";

export function ReportNeedsAttentionPanel() {
    const { messages } = useReportPreferences();
    const filter = useCallback((reports: ReportFeedback[]) => filterNeedsAttention(reports), []);

    return (
        <ExperimentalFilteredListPanel
            title={messages.panel.tabNeedsAttention}
            filter={filter}
        />
    );
}
