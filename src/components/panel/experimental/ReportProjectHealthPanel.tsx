import { useMemo } from "react";
import { useReport } from "@/providers/reportContext.js";
import { buildProjectHealthSummary } from "@/utils/experimentalPanelTabs.js";
import { formatStatCount } from "@/utils/formatStatCount.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";

export function ReportProjectHealthPanel() {
    const { reports, allPageReports, listScope, messages } = useReport();
    const source = listScope === "all" || allPageReports.length > 0 ? (allPageReports.length > 0 ? allPageReports : reports) : reports;
    const summary = useMemo(() => buildProjectHealthSummary(source), [source]);

    const rows = [
        { key: "completion", label: messages.panel.roleStats.completionRate, value: summary.completionRate === null ? "-" : `${summary.completionRate}%` },
        { key: "open", label: messages.panel.experimentalOpen, value: formatStatCount(summary.open) },
        { key: "resolved", label: messages.panel.statsResolved, value: formatStatCount(summary.resolved) },
        { key: "today", label: messages.panel.roleStats.today, value: formatStatCount(summary.todayNew) },
        { key: "issued", label: messages.panel.roleStats.issued, value: formatStatCount(summary.gitIssued) },
        { key: "errors", label: messages.panel.roleStats.errors, value: formatStatCount(summary.errors) },
        { key: "recheck", label: messages.panel.roleStats.recheck, value: formatStatCount(summary.recheck) },
    ];

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]">
            <div className="border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.panel.tabProjectHealth}</p>
                <p className="mt-[2px] text-[11px] text-[var(--adaptive-black500)]">{messages.panel.experimentalScopeAll}</p>
            </div>

            <div className="flex flex-col px-[12px]">
                {rows.map((row, index) => (
                    <div
                        key={row.key}
                        className={`flex items-center justify-between gap-[8px] py-[10px] ${index < rows.length - 1 ? "border-b border-[var(--adaptive-border-subtle)]" : ""}`}
                    >
                        <p className="text-[12px] text-[var(--adaptive-black600)]">{row.label}</p>
                        <p className={`text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.value}</p>
                    </div>
                ))}
            </div>

            {summary.total === 0 ? <p className="px-[12px] py-[8px] text-[12px] text-[var(--adaptive-black500)]">{messages.panel.experimentalEmpty}</p> : null}
        </section>
    );
}
