import { FEEDBACK_DISPLAY_STATUS_ORDER } from "../constants/feedbackStatus.js";
import { getFeedbackDisplayStatus } from "../utils/feedbackThread.js";
import { isCreatedToday } from "../utils/routeDetailStatus.js";
export function buildPanelStats(reports) {
    let resolved = 0;
    let inProgress = 0;
    for (const report of reports) {
        const status = getFeedbackDisplayStatus(report, true);
        if (status === "resolved") {
            resolved += 1;
        }
        else if (status === "wait_for_reply" ||
            status === "additional_question" ||
            status === "suggested" ||
            status === "found_error" ||
            status === "recheck_requested") {
            inProgress += 1;
        }
    }
    return {
        found: reports.length,
        resolved,
        inProgress,
    };
}
export function buildRouteDetailsSummary(reports, fields, pathname) {
    const statusRows = FEEDBACK_DISPLAY_STATUS_ORDER.map((status) => ({
        status,
        all: 0,
        today: 0,
    }));
    const statusIndex = new Map(statusRows.map((row, index) => [row.status, index]));
    for (const report of reports) {
        const status = getFeedbackDisplayStatus(report, true);
        const index = statusIndex.get(status);
        if (index === undefined) {
            continue;
        }
        statusRows[index].all += 1;
        if (isCreatedToday(report.created_at)) {
            statusRows[index].today += 1;
        }
    }
    const fieldCounts = fields
        .filter((field) => field.key !== "message")
        .map((field) => {
        const count = reports.filter((report) => {
            if (field.type === "checkbox") {
                return report.field_values[field.key] === true;
            }
            return String(report.field_values[field.key] ?? "").trim().length > 0;
        }).length;
        return {
            key: field.key,
            label: field.label,
            type: field.type,
            count,
        };
    });
    return {
        pathname,
        statusRows,
        fieldCounts,
    };
}
export function buildPanelBootstrapFromReports(reports, fields, pathname) {
    return {
        stats: buildPanelStats(reports),
        routeDetails: buildRouteDetailsSummary(reports, fields, pathname),
    };
}
//# sourceMappingURL=panelBootstrap.js.map