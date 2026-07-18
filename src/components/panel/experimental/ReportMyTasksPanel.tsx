import { useMemo } from "react";
import type { ReportFeedback } from "@/types/report.js";
import { useReportPreferences, useReportSession, useReportData } from "@/providers/reportContext.js";
import { filterMyTasks } from "@/utils/panel/experimentalPanelTabs.js";
import { ExperimentalFilteredListPanel } from "./ExperimentalFilteredListPanel.js";
import { ExperimentalFeedbackRow } from "./ExperimentalFeedbackRow.js";
import type { PinnedFeedbackItem } from "@/types/pinnedFeedback.js";

function PinnedSnapshotRow({ item, onOpen }: { item: PinnedFeedbackItem; onOpen: () => void }) {
    const { messages } = useReportPreferences();

    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex w-full flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left hover:bg-[var(--adaptive-black100)]"
        >
            <p className="line-clamp-2 text-[12px] font-semibold text-[var(--adaptive-black900)]">{item.summary}</p>
            <p className="truncate text-[11px] text-[var(--adaptive-black500)]">{item.pathname}</p>
            <span className="text-[10px] font-semibold text-[var(--adaptive-blue500)]">{messages.pins.railTitle}</span>
        </button>
    );
}

function PinnedTasksSection() {
    const { messages, pinnedFeedbackItems } = useReportPreferences();
    const { openPinnedFeedback, openPanelTab } = useReportSession();
    const { reports, allPageReports } = useReportData();

    const reportById = useMemo(() => {
        const byId = new Map<string, ReportFeedback>();

        for (const report of [...allPageReports, ...reports]) {
            byId.set(report.id, report);
        }

        return byId;
    }, [allPageReports, reports]);

    const orderedPins = useMemo(() => [...pinnedFeedbackItems].reverse(), [pinnedFeedbackItems]);

    if (orderedPins.length === 0) {
        return null;
    }

    return (
        <section className="shrink-0 border-b border-[var(--adaptive-border-subtle)]">
            <div className="px-[12px] py-[8px]">
                <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.pins.sectionTitle}</p>
            </div>
            {orderedPins.map((item) => {
                const report = reportById.get(item.reportId);
                const handleOpen = () => {
                    openPanelTab("feedback-list");
                    void openPinnedFeedback(item.reportId, {
                        caseId: item.caseId,
                        pathname: item.pathname,
                    });
                };

                if (report) {
                    return (
                        <ExperimentalFeedbackRow
                            key={item.reportId}
                            report={report}
                            onOpen={handleOpen}
                        />
                    );
                }

                return (
                    <PinnedSnapshotRow
                        key={item.reportId}
                        item={item}
                        onOpen={handleOpen}
                    />
                );
            })}
        </section>
    );
}

export function ReportMyTasksPanel() {
    const { messages } = useReportPreferences();

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PinnedTasksSection />
            <ExperimentalFilteredListPanel
                title={messages.panel.tabMyTasks}
                filter={filterMyTasks}
            />
        </div>
    );
}
