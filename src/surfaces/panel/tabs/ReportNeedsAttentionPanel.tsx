import { useCallback } from "react";
import type { ReportFeedback } from "@/shared/types/report.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { filterNeedsAttention } from "@/shared/utils/panel/experimentalPanelTabs.js";
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
