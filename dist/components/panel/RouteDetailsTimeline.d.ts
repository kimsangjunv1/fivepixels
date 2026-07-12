import type { MonthlySparkline } from "../../utils/monthlySparkline.js";
type RouteDetailsTimelineProps = {
    sparkline: MonthlySparkline;
    selectedDateKey: string;
    onSelectDateKey: (dateKey: string) => void;
    basedOnThisMonthLabel: string;
    timelineAriaLabel: string;
    dayAriaLabelTemplate: string;
    referenceDate?: Date;
};
export declare function RouteDetailsTimeline({ sparkline, selectedDateKey, onSelectDateKey, basedOnThisMonthLabel, timelineAriaLabel, dayAriaLabelTemplate, referenceDate, }: RouteDetailsTimelineProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=RouteDetailsTimeline.d.ts.map