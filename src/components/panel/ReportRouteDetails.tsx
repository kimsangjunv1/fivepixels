import { useReport } from "@/providers/reportContext.js";
import { formatStatCount } from "@/utils/formatStatCount.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { FeedbackStatusBadge } from "./feedback/FeedbackStatusBadge.js";
import { FeedbackActivityHeatmap } from "./FeedbackActivityHeatmap.js";

export function ReportRouteDetails() {
    const { routeDetailsStats, projectId, environment, appVersion, messages } = useReport();
    const { pathname, statusRows, fieldCounts } = routeDetailsStats;

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]">
            <FeedbackActivityHeatmap />

            <article className="flex flex-col px-[16px]">
                <section className="flex items-center text-[12px] py-[8px]">
                    <div className="flex-1">
                        <p className="text-[var(--adaptive-black500)] font-[500]">{pathname}</p>
                    </div>

                    <div className="flex-1 flex">
                        <p className="flex-1 text-[var(--adaptive-black500)] font-[500]">{messages.routeDetails.all}</p>
                        <p className="flex-1 text-[var(--adaptive-black500)] font-[500]">{messages.routeDetails.today}</p>
                    </div>
                </section>

                <div className="w-full h-[1px] bg-[var(--adaptive-black200)]" />

                {statusRows.map((row, mappedIdx) => {
                    const IS_NOT_LAST = mappedIdx + 1 !== statusRows.length;

                    return (
                        <section
                            key={row.status}
                            className="flex flex-col"
                        >
                            <section className="flex items-center gap-x-[8px] py-[8px]">
                                <div className="flex-1">
                                    <FeedbackStatusBadge status={row.status} />
                                </div>

                                <div className="flex-1 flex">
                                    <p className={`flex-1 text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.all.toLocaleString()}</p>
                                    <p className={`flex-1 text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.today.toLocaleString()}</p>
                                </div>
                            </section>

                            {IS_NOT_LAST ? <div className="w-full h-[1px] bg-[var(--adaptive-black200)]" /> : null}
                        </section>
                    );
                })}
            </article>

            {fieldCounts.length > 0 ? (
                <article className="flex border-t border-[var(--adaptive-black200)]">
                    {fieldCounts.map((field, mappedIdx) => {
                        const IS_NOT_LAST = mappedIdx + 1 !== fieldCounts.length;

                        return (
                            <section
                                key={field.key}
                                className="contents"
                            >
                                <section className="flex-1 flex flex-col items-center gap-[4px] text-center py-[0.4rem]">
                                    <ChevronDownIcon className={`h-4 w-4 transition-transform`} />
                                    <span className="text-[var(--adaptive-black500)]">{field.label}</span>
                                    <p className={`font-normal text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{formatStatCount(field.count)}</p>
                                </section>

                                {IS_NOT_LAST ? <div className="w-[1px] h-full bg-[var(--adaptive-black200)]" /> : null}
                            </section>
                        );
                    })}
                </article>
            ) : null}

            <article className="flex justify-center gap-[8px] border-t border-[var(--adaptive-black200)] text-[12px] text-[var(--adaptive-black500)] bg-[var(--adaptive-black100)] uppercase">
                <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{projectId}</p>
                <div className="h-full w-[1px] bg-[var(--adaptive-black300)]" />
                <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{appVersion ?? "-"}</p>
                <div className="h-full w-[1px] bg-[var(--adaptive-black300)]" />
                <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{environment ?? "-"}</p>
            </article>
        </section>
    );
}
