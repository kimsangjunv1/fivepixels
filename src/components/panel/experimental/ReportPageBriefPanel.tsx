import { useMemo, useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import { buildPageBriefSummary } from "@/utils/experimentalPanelTabs.js";
import { FeedbackStatusBadge } from "@/components/panel/feedback/FeedbackStatusBadge.js";
import { formatStatCount } from "@/utils/formatStatCount.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";

export function ReportPageBriefPanel() {
    const { currentPageReports, currentPathname, messages } = useReport();
    const summary = useMemo(() => buildPageBriefSummary(currentPageReports), [currentPageReports]);
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]">
            <div className="border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.panel.tabPageBrief}</p>
                <p className="mt-[2px] truncate text-[11px] text-[var(--adaptive-black500)]">
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

                {summary.total === 0 ? <p className="py-[8px] text-[12px] text-[var(--adaptive-black500)]">{messages.panel.experimentalEmpty}</p> : null}
            </div>
        </section>
    );
}
