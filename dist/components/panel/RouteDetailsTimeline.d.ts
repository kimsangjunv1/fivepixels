import { type HourlyCompareSparkline } from "../../utils/hourlyCompareSparkline.js";
type RouteDetailsTimelineProps = {
    sparkline: HourlyCompareSparkline;
    todayLabel: string;
    yesterdayLabel: string;
    timelineAriaLabel: string;
    hourAriaLabelTemplate: string;
    tooltipTodayTemplate: string;
    tooltipYesterdayTemplate: string;
};
export declare function RouteDetailsTimeline({ sparkline, todayLabel, yesterdayLabel, timelineAriaLabel, hourAriaLabelTemplate, tooltipTodayTemplate, tooltipYesterdayTemplate, }: RouteDetailsTimelineProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RouteDetailsTimeline.d.ts.map