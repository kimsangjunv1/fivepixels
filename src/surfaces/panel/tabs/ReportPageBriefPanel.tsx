import { useMemo, useState } from "react";
import { useReportPreferences, useReportSession, useReportData } from "@/shared/providers/reportContext.js";
import { buildPageBriefSummary } from "@/shared/utils/panel/experimentalPanelTabs.js";
import { FeedbackStatusBadge } from "@/surfaces/feedback/FeedbackStatusBadge.js";
import { formatStatCount } from "@/shared/utils/panel/formatStatCount.js";
import { panelNumericClassName } from "@/shared/utils/panel/panelTypography.js";
import { ChevronDownIcon } from "@/shared/components/icons/Icons.js";
import { NoticeDialog } from "@/shared/components/ui/NoticeDialog.js";

export function ReportPageBriefPanel() {
    const { messages } = useReportPreferences();
    const { currentPathname } = useReportSession();
    const { currentPageReports } = useReportData();
    const summary = useMemo(() => buildPageBriefSummary(currentPageReports), [currentPageReports]);
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-fillOpacity500)]">
            <div className="border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.panel.tabPageBrief}</p>
                <p className="truncate text-[10px] text-[var(--adaptive-black700)]">
                    {messages.panel.experimentalScopeCurrent} · {currentPathname}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[12px]">
                <div className="flex flex-col gap-[2px]">
                    <p className="text-[11px] text-[var(--adaptive-black500)]">{messages.panel.experimentalOpen}</p>
                    <p className={`text-[16px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(summary.open)}</p>
                </div>
                <div className="flex flex-col gap-[2px]">
                    <p className="text-[11px] text-[var(--adaptive-black500)]">{messages.panel.roleStats.review}</p>
                    <p className={`text-[16px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(summary.inProgress)}</p>
                </div>
                <div className="flex flex-col gap-[2px]">
                    <p className="text-[11px] text-[var(--adaptive-black500)]">{messages.panel.statsResolved}</p>
                    <p className={`text-[16px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(summary.resolved)}</p>
                </div>
            </div>

            <div className="px-[12px] py-[8px]">
                <button
                    type="button"
                    onClick={() => setExpanded((current) => !current)}
                    className="flex w-full items-center justify-between py-[6px] text-left"
                >
                    <p className="text-[12px] font-semibold text-[var(--adaptive-black800)]">{messages.panel.experimentalTopStatuses}</p>
                    <ChevronDownIcon className={`h-[14px] w-[14px] text-[var(--adaptive-black500)] transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>

                {(expanded ? summary.topStatuses : summary.topStatuses.slice(0, 3)).map((row) => (
                    <div
                        key={row.status}
                        className="flex items-center justify-between gap-[8px] border-t border-[var(--adaptive-border-subtle)] py-[8px]"
                    >
                        <FeedbackStatusBadge status={row.status} />
                        <p className={`text-[13px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.count}</p>
                    </div>
                ))}

                {summary.total === 0 ? (
                    <NoticeDialog
                        role="status"
                        title={messages.panel.experimentalEmpty}
                    />
                ) : null}
            </div>
        </section>
    );
}
