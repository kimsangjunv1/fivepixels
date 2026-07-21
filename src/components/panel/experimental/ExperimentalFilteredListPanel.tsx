import { useMemo } from "react";
import type { ReportFeedback } from "@/types/report.js";
import { useReportPreferences, useReportSession, useReportData } from "@/providers/reportContext.js";
import { resolveExperimentalListSource } from "@/utils/panel/experimentalPanelTabs.js";
import { ExperimentalFeedbackRow } from "./ExperimentalFeedbackRow.js";

type ExperimentalFilteredListPanelProps = {
    title: string;
    filter: (reports: ReportFeedback[], actorName: string | null) => ReportFeedback[];
};

export function ExperimentalFilteredListPanel({ title, filter }: ExperimentalFilteredListPanelProps) {
    const { messages } = useReportPreferences();
    const { sessionActor, locateFeedback, openPanelTab } = useReportSession();
    const { reports, allPageReports, listScope } = useReportData();
    const source = resolveExperimentalListSource(reports, allPageReports, listScope);
    const actorName = sessionActor?.name ?? null;
    const items = useMemo(() => filter(source, actorName), [actorName, filter, source]);

    const handleOpen = (reportId: string) => {
        openPanelTab("feedback-list");
        void locateFeedback(reportId);
    };

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
            <div className="shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{title}</p>
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
