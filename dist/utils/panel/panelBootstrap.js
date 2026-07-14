import { FEEDBACK_DISPLAY_STATUS_ORDER } from "../../constants/feedbackStatus.js";
import { getFeedbackDisplayStatus } from "../../utils/feedbackThread.js";
import { toDateKey } from "../../utils/heatmapActivity.js";
function shiftDateKey(dateKey, deltaDays) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + deltaDays);
    return toDateKey(date);
}
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
export function buildRouteDetailsSummary(reports, fields, pathname, options = {}) {
    const referenceDate = options.referenceDate ?? new Date();
    const todayDateKey = toDateKey(referenceDate);
    const yesterdayDateKey = shiftDateKey(todayDateKey, -1);
    const statusRows = FEEDBACK_DISPLAY_STATUS_ORDER.map((status) => ({
        status,
        today: 0,
        yesterday: 0,
    }));
    const statusIndex = new Map(statusRows.map((row, index) => [row.status, index]));
    for (const report of reports) {
        const status = getFeedbackDisplayStatus(report, true);
        const index = statusIndex.get(status);
        if (index === undefined) {
            continue;
        }
        const created = new Date(report.created_at);
        if (Number.isNaN(created.getTime())) {
            continue;
        }
        const createdKey = toDateKey(created);
        if (createdKey === todayDateKey) {
            statusRows[index].today += 1;
        }
        else if (createdKey === yesterdayDateKey) {
            statusRows[index].yesterday += 1;
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
        todayDateKey,
        yesterdayDateKey,
        statusRows: statusRows.map(({ status, today, yesterday }) => ({
            status,
            today,
            yesterday,
            delta: today - yesterday,
        })),
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