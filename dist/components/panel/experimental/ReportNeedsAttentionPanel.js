import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import { useReportPreferences } from "../../../providers/reportContext.js";
import { filterNeedsAttention } from "../../../utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";
export function ReportNeedsAttentionPanel() {
    const { messages } = useReportPreferences();
    const filter = useCallback((reports) => filterNeedsAttention(reports), []);
    return (_jsx(ExperimentalFilteredListPanel, { title: messages.panel.tabNeedsAttention, filter: filter }));
}
//# sourceMappingURL=ReportNeedsAttentionPanel.js.map