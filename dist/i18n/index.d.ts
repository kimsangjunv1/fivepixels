import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "./types.js";
export declare function resolveReportLocale(locale?: ReportLocale): ReportLocale;
export declare function ensureReportLocaleMessages(locale: ReportLocale): Promise<void>;
export declare function getReportMessages(locale: ReportLocale, overrides?: DeepPartialReportMessages): ReportMessages;
export declare function setActiveReportMessages(messages: ReportMessages): void;
export declare function getActiveReportMessages(): ReportMessages;
export declare function getDefaultFields(messages: ReportMessages): ({
    key: string;
    type: "textarea";
    label: string;
    required: boolean;
} | {
    key: string;
    type: "checkbox";
    label: string;
    required?: undefined;
})[];
export type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "./types.js";
export { en } from "./en.js";
//# sourceMappingURL=index.d.ts.map