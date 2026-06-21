import type { ReportField, ReportTargetType } from "@/types/report.js";
import { ko } from "@/i18n/ko.js";
import { getDefaultFields } from "@/i18n/index.js";

export const DOT_SIZE = 14;
export const TARGET_SELECTOR = "[data-report-id]";

export const TARGET_COLOR: Record<ReportTargetType, string> = {
    group: "#0ed1b4",
    item: "#0ed1b4",
};

export const TARGET_SURFACE: Record<ReportTargetType, string> = {
    group: "#0ed1b41c",
    item: "#0ed1b41c",
};

export const DEFAULT_FIELDS: ReportField[] = getDefaultFields(ko);
