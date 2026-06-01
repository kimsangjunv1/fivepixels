import type { ReportField, ReportTargetType } from "../types/report.js";

export const DOT_SIZE = 14;
export const TARGET_SELECTOR = "[data-report-id][data-report-type]";

export const TARGET_COLOR: Record<ReportTargetType, string> = {
    group: "#3182f6",
    item: "#f04452",
};

export const TARGET_SURFACE: Record<ReportTargetType, string> = {
    group: "rgba(49, 130, 246, 0.15)",
    item: "rgba(240, 68, 82, 0.15)",
};

export const DEFAULT_FIELDS: ReportField[] = [
    { key: "message", type: "textarea", label: "메시지", required: true },
    { key: "checkbox1", type: "checkbox", label: "checkbox1 사용 여부" },
    { key: "checkbox2", type: "checkbox", label: "checkbox2 사용 여부" },
];
