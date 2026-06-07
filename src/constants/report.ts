import type { ReportField, ReportTargetType } from "@/types/report.js";
import { ko } from "@/i18n/ko.js";
import { getDefaultFields } from "@/i18n/index.js";

export const DOT_SIZE = 14;
export const TARGET_SELECTOR = "[data-report-id]";

export const TARGET_COLOR: Record<ReportTargetType, string> = {
    group: "#7d44f0",
    item: "#f04452",
};

export const TARGET_SURFACE: Record<ReportTargetType, string> = {
    group: "#7d44f010",
    item: "rgba(240, 68, 82, 0.15)",
};

export const DEFAULT_FIELDS: ReportField[] = getDefaultFields(ko);
