import type { ReportLocale } from "../../../shared/i18n/types.js";
export declare function createReplyId(): string;
export declare function formatDate(value: string, locale?: ReportLocale): string;
export declare function formatDateOnly(value: string, locale?: ReportLocale): string;
export declare function formatClockTime(value: string): string;
export declare function formatTimeOnly(value: string, locale?: ReportLocale): string;
/** Compact clock for thread meta, e.g. `오후 01:30` / `1:30 PM`. */
export declare function formatTimeCompact(value: string, locale?: ReportLocale): string;
export type RelativeTimeUnit = "second" | "minute" | "hour" | "day" | "month" | "year";
export type RelativeTimeParts = {
    unit: RelativeTimeUnit;
    count: number;
};
export type RelativeTimeLabels = {
    secondsAgo: (count: number) => string;
    minutesAgo: (count: number) => string;
    hoursAgo: (count: number) => string;
    daysAgo: (count: number) => string;
    monthsAgo: (count: number) => string;
    yearsAgo: (count: number) => string;
};
export declare function getRelativeTimeParts(value: string, now?: Date): RelativeTimeParts | null;
export declare function formatRelativeTime(value: string, labels: RelativeTimeLabels, now?: Date): string;
/** Compact feed timestamps like `12m`, `3h`, `5d` (reference activity-feed style). */
export declare function formatRelativeTimeCompact(value: string, now?: Date): string;
//# sourceMappingURL=format.d.ts.map