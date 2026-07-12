import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useReport } from "../../providers/reportContext.js";
import { buildRouteDetailsSummary } from "../../utils/panelBootstrap.js";
import { buildMonthlySparkline } from "../../utils/monthlySparkline.js";
import { getCurrentPathLabel, getCurrentPathname } from "../../utils/pathname.js";
import { subscribeToPathnameChanges } from "../../utils/pathnameNavigation.js";
import { toDateKey } from "../../utils/heatmapActivity.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import { FeedbackStatusBadge } from "./feedback/FeedbackStatusBadge.js";
import { RouteDetailsTimeline } from "./RouteDetailsTimeline.js";
function formatDelta(delta) {
    if (delta <= 0) {
        return null;
    }
    return `+${delta.toLocaleString()}`;
}
function resolveDefaultDateKey(buckets, todayKey) {
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
    const { currentPageReports, fields, currentPathname, projectId, environment, appVersion, messages } = useReport();
    const browserPathname = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathname, () => "/");
    const browserPathLabel = useSyncExternalStore(subscribeToPathnameChanges, getCurrentPathLabel, () => currentPathname);
    const displayPath = browserPathname === currentPathname ? browserPathLabel : currentPathname;
    const sparkline = useMemo(() => buildMonthlySparkline(currentPageReports), [currentPageReports]);
    const todayKey = toDateKey(new Date());
    const defaultDateKey = resolveDefaultDateKey(sparkline.buckets, todayKey);
    const [selectedDateKey, setSelectedDateKey] = useState(defaultDateKey);
    const resolvedSelectedDateKey = sparkline.buckets.some((bucket) => bucket.dateKey === selectedDateKey)
        ? selectedDateKey
        : defaultDateKey;
    const summary = useMemo(() => buildRouteDetailsSummary(currentPageReports, fields, displayPath, { selectedDateKey: resolvedSelectedDateKey }), [currentPageReports, displayPath, fields, resolvedSelectedDateKey]);
    return (_jsxs("section", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)] rounded-[0_0_24px_24px]", children: [_jsx(RouteDetailsTimeline, { sparkline: sparkline, selectedDateKey: resolvedSelectedDateKey, onSelectDateKey: setSelectedDateKey, basedOnThisMonthLabel: messages.routeDetails.basedOnThisMonth, timelineAriaLabel: messages.routeDetails.timelineAriaLabel, dayAriaLabelTemplate: messages.routeDetails.timelineDayAriaLabel }), _jsxs("article", { className: "flex flex-col px-[16px]", children: [_jsxs("section", { className: "flex items-center text-[12px] py-[8px]", children: [_jsx("div", { className: "min-w-0 flex-1", children: _jsx("p", { className: "truncate text-[var(--adaptive-black500)] font-[500]", children: summary.pathname }) }), _jsxs("div", { className: "flex w-[132px] shrink-0", children: [_jsx("p", { className: "flex-1 text-[var(--adaptive-black500)] font-[500]", children: messages.routeDetails.current }), _jsx("p", { className: "flex-1 text-right text-[var(--adaptive-black500)] font-[500]", children: messages.routeDetails.selected })] })] }), _jsx("div", { className: "w-full h-[1px] bg-[var(--adaptive-black200)]" }), summary.statusRows.map((row, mappedIdx) => {
                        const IS_NOT_LAST = mappedIdx + 1 !== summary.statusRows.length;
                        const deltaLabel = formatDelta(row.delta);
                        return (_jsxs("section", { className: "flex flex-col", children: [_jsxs("section", { className: "flex items-center gap-x-[8px] py-[8px]", children: [_jsx("div", { className: "min-w-0 flex-1", children: _jsx(FeedbackStatusBadge, { status: row.status, isNeedGray: true }) }), _jsxs("div", { className: "flex w-[132px] shrink-0 items-baseline", children: [_jsxs("div", { className: "flex flex-1 items-baseline gap-[4px]", children: [_jsx("p", { className: `text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: row.current.toLocaleString() }), deltaLabel ? _jsx("span", { className: `text-[11px] font-[600] text-[var(--adaptive-green500)] ${panelNumericClassName}`, children: deltaLabel }) : null] }), _jsx("p", { className: `flex-1 text-right text-[14px] font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: row.selected.toLocaleString() })] })] }), IS_NOT_LAST ? _jsx("div", { className: "w-full h-[1px] bg-[var(--adaptive-black200)]" }) : null] }, row.status));
                    })] }), _jsxs("article", { className: "mt-auto flex justify-center gap-[8px] border-t border-[var(--adaptive-black200)] text-[12px] text-[var(--adaptive-black500)] bg-[var(--adaptive-black100)] uppercase", children: [_jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)]", children: projectId }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-black300)]" }), _jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)]", children: appVersion ?? "-" }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-black300)]" }), _jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)]", children: environment ?? "-" })] })] }));
}
//# sourceMappingURL=ReportRouteDetails.js.map