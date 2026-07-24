import type { ReportLocale } from "../../i18n/types.js";
export declare function createReplyId(): string;
export declare function formatDate(value: string, locale?: ReportLocale): string;
export declare function formatDateOnly(value: string, locale?: ReportLocale): string;
export declare function formatClockTime(value: string): string;
export declare function formatTimeOnly(value: string, locale?: ReportLocale): string;
/** Compact clock for thread meta, e.g. `오후 01:30` / `1:30 PM`. */
export declare function formatTimeCompact(value: string, locale?: ReportLocale): string;
//# sourceMappingURL=format.d.ts.map