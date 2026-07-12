import { useMemo } from "react";
import { useReport } from "@/providers/reportContext.js";
import { filterNeedsAttention } from "@/utils/experimentalPanelTabs.js";
import { ExperimentalFeedbackRow } from "./ExperimentalFeedbackRow.js";

export function ReportNeedsAttentionPanel() {
    const { reports, allPageReports, listScope, messages, locateFeedback, openPanelTab } = useReport();
    const source = listScope === "all" || allPageReports.length > 0 ? (allPageReports.length > 0 ? allPageReports : reports) : reports;
    const items = useMemo(() => filterNeedsAttention(source), [source]);

    const handleOpen = (reportId: string) => {
        openPanelTab("feedback-list");
        void locateFeedback(reportId);
    };

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
            <div className="shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.panel.tabNeedsAttention}</p>
                <p className="mt-[2px] text-[11px] text-[var(--adaptive-black500)]">{messages.panel.experimentalScopeAll}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <p className="px-[12px] py-[16px] text-[12px] text-[var(--adaptive-black500)]">{messages.panel.experimentalEmpty}</p>
                ) : (
                    items.map((report) => (
                        <ExperimentalFeedbackRow
                            key={report.id}
                            report={report}
                            onOpen={handleOpen}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
