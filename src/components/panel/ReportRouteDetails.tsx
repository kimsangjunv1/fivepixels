import { useMemo, useState, useSyncExternalStore } from "react";
import { useReport } from "@/providers/reportContext.js";
import { buildRouteDetailsSummary } from "@/utils/panelBootstrap.js";
import { buildMonthlySparkline } from "@/utils/monthlySparkline.js";
import { getCurrentPathLabel, getCurrentPathname } from "@/utils/pathname.js";
import { subscribeToPathnameChanges } from "@/utils/pathnameNavigation.js";
import { toDateKey } from "@/utils/heatmapActivity.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import { FeedbackStatusBadge } from "./feedback/FeedbackStatusBadge.js";
import { RouteDetailsTimeline } from "./RouteDetailsTimeline.js";

function formatDelta(delta: number) {
    if (delta <= 0) {
        return null;
    }

    return `+${delta.toLocaleString()}`;
}

function resolveDefaultDateKey(buckets: Array<{ dateKey: string }>, todayKey: string) {
    if (buckets.some((bucket) => bucket.dateKey === todayKey)) {
        return todayKey;
    }

    for (let index = buckets.length - 1; index >= 0; index -= 1) {
        const dateKey = buckets[index]?.dateKey;

        if (dateKey && dateKey <= todayKey) {
            return dateKey;
        }
    }

    return buckets[buckets.length - 1]?.dateKey ?? todayKey;
}

export function ReportRouteDetails() {
    const { currentPageReports, fields, currentPathname, messages } = useReport();
    const browserPathname = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathname, () => "/");
    const browserPathLabel = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathLabel, () => currentPathname);
    const displayPath = browserPathname === currentPathname ? browserPathLabel : currentPathname;
    const sparkline = useMemo(() => buildMonthlySparkline(currentPageReports), [currentPageReports]);
    const todayKey = toDateKey(new Date());
    const defaultDateKey = resolveDefaultDateKey(sparkline.buckets, todayKey);
    const [selectedDateKey, setSelectedDateKey] = useState(defaultDateKey);

    const resolvedSelectedDateKey = sparkline.buckets.some((bucket) => bucket.dateKey === selectedDateKey) ? selectedDateKey : defaultDateKey;

    const summary = useMemo(
        () => buildRouteDetailsSummary(currentPageReports, fields, displayPath, { selectedDateKey: resolvedSelectedDateKey }),
        [currentPageReports, displayPath, fields, resolvedSelectedDateKey],
    );

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]">
            <RouteDetailsTimeline
                sparkline={sparkline}
                selectedDateKey={resolvedSelectedDateKey}
                onSelectDateKey={setSelectedDateKey}
                basedOnThisMonthLabel={messages.routeDetails.basedOnThisMonth}
                timelineAriaLabel={messages.routeDetails.timelineAriaLabel}
                dayAriaLabelTemplate={messages.routeDetails.timelineDayAriaLabel}
            />

            <article className="flex flex-col px-[16px]">
                <section className="flex items-center text-[12px] py-[8px]">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[var(--adaptive-black500)] font-[500]">{summary.pathname}</p>
                    </div>

                    <div className="flex w-[132px] shrink-0">
                        <p className="flex-1 text-[var(--adaptive-black500)] font-[500]">{messages.routeDetails.current}</p>
                        <p className="flex-1 text-right text-[var(--adaptive-black500)] font-[500]">{messages.routeDetails.selected}</p>
                    </div>
                </section>

                <div className="w-full h-[1px] bg-[var(--adaptive-black200)]" />

                {summary.statusRows.map((row, mappedIdx) => {
                    const IS_NOT_LAST = mappedIdx + 1 !== summary.statusRows.length;
                    const deltaLabel = formatDelta(row.delta);

                    return (
                        <section
                            key={row.status}
                            className="flex flex-col"
                        >
                            <section className="flex items-center gap-x-[8px] py-[8px]">
                                <div className="min-w-0 flex-1">
                                    <FeedbackStatusBadge
                                        status={row.status}
                                        isNeedGray
                                    />
                                </div>

                                <div className="flex w-[132px] shrink-0 items-baseline">
                                    <div className="flex flex-1 items-baseline gap-[4px]">
                                        <p className={`text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.current.toLocaleString()}</p>
                                        {deltaLabel ? <span className={`text-[11px] font-[600] text-[var(--adaptive-green500)] ${panelNumericClassName}`}>{deltaLabel}</span> : null}
                                    </div>
                                    <p className={`flex-1 text-right text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.selected.toLocaleString()}</p>
                                </div>
                            </section>

                            {IS_NOT_LAST ? <div className="w-full h-[1px] bg-[var(--adaptive-black200)]" /> : null}
                        </section>
                    );
                })}
            </article>
        </section>
    );
}
