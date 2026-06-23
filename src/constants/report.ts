import type { ReportField, ReportTargetType } from "@/types/report.js";
import { en } from "@/i18n/en.js";
import { getDefaultFields } from "@/i18n/index.js";

export const DOT_SIZE = 14;
export const TARGET_SELECTOR = "[data-report-id]";

export const TARGET_COLOR: Record<ReportTargetType, string> = {
    group: "#0ed1b4",
    item: "#f6572d",
};

export const TARGET_SURFACE: Record<ReportTargetType, string> = {
    group: "#0ed1b41c",
    item: "#0ed1b41c",
};

export const DEFAULT_FIELDS: ReportField[] = getDefaultFields(en);
