import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useSyncExternalStore } from "react";
import { useReportPreferences, useReportSession, useReportData } from "../../shared/providers/reportContext.js";
import { buildRouteDetailsSummary } from "../../shared/utils/panel/panelBootstrap.js";
import { buildHourlyCompareSparkline } from "../../shared/utils/panel/hourlyCompareSparkline.js";
import { getCurrentPathLabel, getCurrentPathname } from "../../shared/utils/shared/pathname.js";
import { subscribeToPathnameChanges } from "../../shared/utils/shared/pathnameNavigation.js";
import { panelNumericClassName } from "../../shared/utils/panel/panelTypography.js";
import { FeedbackStatusBadge } from "../../surfaces/feedback/FeedbackStatusBadge.js";
import { RouteDetailsTimeline } from "./RouteDetailsTimeline.js";
function formatDelta(delta) {
    if (delta <= 0) {
        return null;
    }
    return `+${delta.toLocaleString()}`;
}
export function ReportRouteDetails() {
    const { fields, messages } = useReportPreferences();
    const { currentPathname } = useReportSession();
    const { currentPageReports } = useReportData();
    const browserPathname = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathname, () => "/");
    const browserPathLabel = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathLabel, () => currentPathname);
    const displayPath = browserPathname === currentPathname ? browserPathLabel : currentPathname;
    const sparkline = useMemo(() => buildHourlyCompareSparkline(currentPageReports), [currentPageReports]);
    const summary = useMemo(() => buildRouteDetailsSummary(currentPageReports, fields, displayPath), [currentPageReports, displayPath, fields]);
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-fillOpacity500)]", children: [_jsx(RouteDetailsTimeline, { sparkline: sparkline, todayLabel: messages.routeDetails.today, yesterdayLabel: messages.routeDetails.yesterday, timelineAriaLabel: messages.routeDetails.timelineAriaLabel, hourAriaLabelTemplate: messages.routeDetails.timelineHourAriaLabel, tooltipTodayTemplate: messages.routeDetails.tooltipToday, tooltipYesterdayTemplate: messages.routeDetails.tooltipYesterday }), _jsxs("article", { className: "flex flex-col", children: [_jsxs("section", { className: "flex items-center text-[12px] py-[8px] px-[12px]", children: [_jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "truncate text-[var(--adaptive-black500)] font-[500]", children: summary.pathname }) }), _jsxs("div", { className: "flex-1 flex shrink-0", children: [_jsx("p", { className: "flex-1 text-[var(--adaptive-black500)] font-[500]", children: messages.routeDetails.today }), _jsx("p", { className: "flex-1 text-right text-[var(--adaptive-black500)] font-[500]", children: messages.routeDetails.yesterday })] })] }), summary.statusRows.map((row, mappedIdx) => {
                        const IS_NOT_LAST = mappedIdx + 1 !== summary.statusRows.length;
                        const deltaLabel = formatDelta(row.delta);
                        return (_jsxs("section", { className: "flex flex-col", children: [_jsxs("section", { className: "flex items-center p-[8px_12px]", children: [_jsx("div", { className: "min-w-0 flex-1", children: _jsx(FeedbackStatusBadge, { status: row.status, isNeedGray: true }) }), _jsxs("div", { className: "flex-1 flex shrink-0 items-baseline", children: [_jsxs("div", { className: "flex flex-1 items-baseline gap-[4px]", children: [_jsx("p", { className: `text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: row.today.toLocaleString() }), deltaLabel ? _jsx("span", { className: `text-[12px] font-[600] text-[var(--adaptive-green500)] ${panelNumericClassName}`, children: deltaLabel }) : null] }), _jsx("p", { className: `flex-1 text-right text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: row.yesterday.toLocaleString() })] })] }), IS_NOT_LAST ? _jsx("div", { className: "w-full h-[0.1px] bg-[var(--adaptive-border-subtle)]" }) : null] }, row.status));
                    })] })] }));
}
//# sourceMappingURL=ReportRouteDetails.js.map