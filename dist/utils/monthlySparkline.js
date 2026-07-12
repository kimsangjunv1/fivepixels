import { getFeedbackDisplayStatus } from "../utils/feedbackThread.js";
import { toDateKey } from "../utils/heatmapActivity.js";
function isInProgressStatus(status) {
    return (status === "wait_for_reply" ||
        status === "additional_question" ||
        status === "suggested" ||
        status === "found_error" ||
        status === "recheck_requested");
}
function buildDailyStats(reports, dateKey) {
    let found = 0;
    let resolved = 0;
    let inProgress = 0;
    for (const report of reports) {
        const createdAt = new Date(report.created_at);
        const createdKey = Number.isNaN(createdAt.getTime()) ? null : toDateKey(createdAt);
        const status = getFeedbackDisplayStatus(report, true);
        if (createdKey === dateKey) {
            found += 1;
            if (status === "resolved") {
                resolved += 1;
            }
            else if (isInProgressStatus(status)) {
                inProgress += 1;
            }
        }
        if (report.replies) {
            for (const reply of report.replies) {
                if (reply.status !== "resolved") {
                    continue;
                }
                const repliedAt = new Date(reply.created_at);
                if (!Number.isNaN(repliedAt.getTime()) && toDateKey(repliedAt) === dateKey) {
                    resolved += 1;
                }
            }
        }
    }
    return { found, resolved, inProgress };
}
export function buildMonthlySparkline(reports, referenceDate = new Date()) {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(referenceDate);
    const buckets = [];
    let maxCount = 0;
    for (let day = 1; day <= daysInMonth; day += 1) {
        const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
        const stats = buildDailyStats(reports, dateKey);
        const count = stats.found;
        maxCount = Math.max(maxCount, count);
        buckets.push({ dateKey, day, count, stats });
    }
    return { monthKey, monthLabel, buckets, maxCount };
}
export function resolveSparklineBarHeight(count, maxCount) {
    if (count <= 0 || maxCount <= 0) {
        return 0;
    }
    return Math.max(20, Math.round((count / maxCount) * 100));
}
export function resolveSparklineBarTone(count, maxCount) {
    if (count <= 0 || maxCount <= 0) {
        return "empty";
    }
    return count === maxCount ? "peak" : "muted";
}
//# sourceMappingURL=monthlySparkline.js.map