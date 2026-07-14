import { useMemo, useSyncExternalStore } from "react";
import { useReport } from "@/providers/reportContext.js";
import { buildRouteDetailsSummary } from "@/utils/panelBootstrap.js";
import { buildHourlyCompareSparkline } from "@/utils/hourlyCompareSparkline.js";
import { getCurrentPathLabel, getCurrentPathname } from "@/utils/pathname.js";
import { subscribeToPathnameChanges } from "@/utils/pathnameNavigation.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import { FeedbackStatusBadge } from "./feedback/FeedbackStatusBadge.js";
import { RouteDetailsTimeline } from "./RouteDetailsTimeline.js";

function formatDelta(delta: number) {
    if (delta <= 0) {
        return null;
    }

    return `+${delta.toLocaleString()}`;
}

export function ReportRouteDetails() {
    const { currentPageReports, fields, currentPathname, messages } = useReport();
    const browserPathname = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathname, () => "/");
    const browserPathLabel = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathLabel, () => currentPathname);
    const displayPath = browserPathname === currentPathname ? browserPathLabel : currentPathname;
    const sparkline = useMemo(() => buildHourlyCompareSparkline(currentPageReports), [currentPageReports]);
    const summary = useMemo(() => buildRouteDetailsSummary(currentPageReports, fields, displayPath), [currentPageReports, displayPath, fields]);

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]">
            <RouteDetailsTimeline
                sparkline={sparkline}
                todayLabel={messages.routeDetails.today}
                yesterdayLabel={messages.routeDetails.yesterday}
                timelineAriaLabel={messages.routeDetails.timelineAriaLabel}
                hourAriaLabelTemplate={messages.routeDetails.timelineHourAriaLabel}
                tooltipTodayTemplate={messages.routeDetails.tooltipToday}
                tooltipYesterdayTemplate={messages.routeDetails.tooltipYesterday}
            />

            <article className="flex flex-col px-[16px]">
                <section className="flex items-center text-[12px] py-[8px]">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[var(--adaptive-black500)] font-[500]">{summary.pathname}</p>
                    </div>

                    <div className="flex w-[132px] shrink-0">
                        <p className="flex-1 text-[var(--adaptive-black500)] font-[500]">{messages.routeDetails.today}</p>
                        <p className="flex-1 text-right text-[var(--adaptive-black500)] font-[500]">{messages.routeDetails.yesterday}</p>
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
                                        <p className={`text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.today.toLocaleString()}</p>
                                        {deltaLabel ? <span className={`text-[11px] font-[600] text-[var(--adaptive-green500)] ${panelNumericClassName}`}>{deltaLabel}</span> : null}
                                    </div>
                                    <p className={`flex-1 text-right text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{row.yesterday.toLocaleString()}</p>
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
