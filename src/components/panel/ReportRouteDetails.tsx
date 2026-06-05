import { useReport } from "../../providers/reportContext.js";
import { formatStatCount } from "../../utils/formatStatCount.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import { ROUTE_DETAIL_STATUS_LABEL } from "../../utils/routeDetailStatus.js";

function StatusRowIcon({ status }: { status: "wait" | "suggested" | "resolved" }) {
    if (status === "wait") {
        return <span aria-hidden>⚑</span>;
    }

    if (status === "suggested") {
        return <span aria-hidden>↻</span>;
    }

    return <span aria-hidden>✓</span>;
}

export function ReportRouteDetails() {
    const { routeDetailsStats, projectId, environment, appVersion } = useReport();
    const { pathname, statusRows, fieldCounts } = routeDetailsStats;

    return (
        <section className="flex flex-col gap-[12px] rounded-[12px] bg-[var(--adaptive-grey100)] p-[12px]">
            <section className="flex flex-col gap-[8px]">
                <p className="text-[12px] text-[var(--adaptive-grey500)]">{pathname}</p>
                <div className="grid grid-cols-[1fr_56px_56px] items-center gap-x-[8px] text-[12px] text-[var(--adaptive-grey500)]">
                    <span />
                    <span className="text-right">All</span>
                    <span className="text-right">Today</span>
                </div>
                {statusRows.map((row) => (
                    <div
                        key={row.status}
                        className="grid grid-cols-[1fr_56px_56px] items-center gap-x-[8px]"
                    >
                        <div className="flex items-center gap-[6px] text-[13px] font-semibold text-[var(--adaptive-grey800)]">
                            <StatusRowIcon status={row.status} />
                            <span>{ROUTE_DETAIL_STATUS_LABEL[row.status]}</span>
                        </div>
                        <p className={`text-right text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`}>{row.all.toLocaleString()}</p>
                        <p className={`text-right text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`}>{row.today.toLocaleString()}</p>
                    </div>
                ))}
            </section>

            {fieldCounts.length > 0 ? (
                <section className="grid grid-cols-3 gap-[8px] border-t border-[var(--adaptive-grey200)] pt-[12px]">
                    {fieldCounts.map((field) => (
                        <div
                            key={field.key}
                            className="flex flex-col items-center gap-[4px] text-center"
                        >
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--adaptive-grey500)]">{field.label}</span>
                            <p className={`text-[14px] font-bold text-[var(--adaptive-grey900)] ${panelNumericClassName}`}>{formatStatCount(field.count)}</p>
                        </div>
                    ))}
                </section>
            ) : null}

            <section className="border-t border-[var(--adaptive-grey200)] pt-[10px] text-[11px] text-[var(--adaptive-grey500)]">
                <p className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px]">
                    <span>
                        projectId: <strong className="text-[var(--adaptive-grey800)]">{projectId}</strong>
                    </span>
                    <span aria-hidden>|</span>
                    <span>
                        environment: <strong className="text-[var(--adaptive-grey800)]">{environment ?? "-"}</strong>
                    </span>
                    <span aria-hidden>|</span>
                    <span>
                        appVersion: <strong className="text-[var(--adaptive-grey800)]">{appVersion ?? "-"}</strong>
                    </span>
                </p>
            </section>
        </section>
    );
}
