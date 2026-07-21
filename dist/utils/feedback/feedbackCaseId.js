export function formatFeedbackCaseId(fcNumber) {
    return `#FC-${fcNumber}`;
}
export function getFeedbackCaseId(report) {
    if (typeof report.fc_number !== "number" || !Number.isFinite(report.fc_number) || report.fc_number <= 0) {
        return null;
    }
    return formatFeedbackCaseId(Math.trunc(report.fc_number));
}
export function getMaxFcNumber(reports) {
    return reports.reduce((max, report) => {
        if (typeof report.fc_number !== "number" || !Number.isFinite(report.fc_number)) {
            return max;
        }
        return Math.max(max, Math.trunc(report.fc_number));
    }, 0);
}
export function allocateNextFcNumber(reports) {
    return getMaxFcNumber(reports) + 1;
}
export function backfillFcNumbers(reports) {
    let max = getMaxFcNumber(reports);
    const ordered = [...reports].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
    const assigned = new Map();
    for (const report of ordered) {
        if (typeof report.fc_number === "number" && Number.isFinite(report.fc_number) && report.fc_number > 0) {
            assigned.set(report.id, Math.trunc(report.fc_number));
            continue;
        }
        max += 1;
        assigned.set(report.id, max);
    }
    return reports.map((report) => {
        const fcNumber = assigned.get(report.id);
        if (fcNumber === undefined || report.fc_number === fcNumber) {
            return report;
        }
        return {
            ...report,
            fc_number: fcNumber,
        };
    });
}
//# sourceMappingURL=feedbackCaseId.js.map