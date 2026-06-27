export function createCaseId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `case-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
export function createReportCase(text, overrides = {}) {
    const timestamp = overrides.created_at ?? new Date().toISOString();
    return {
        id: overrides.id ?? createCaseId(),
        text,
        status: overrides.status ?? "open",
        assignee_name: overrides.assignee_name ?? null,
        created_at: timestamp,
        updated_at: overrides.updated_at ?? timestamp,
    };
}
export function getReportCases(report) {
    return report.cases ?? [];
}
export function getOpenCases(report) {
    return getReportCases(report).filter((item) => item.status === "open");
}
export function getResolvedCases(report) {
    return getReportCases(report).filter((item) => item.status === "resolved");
}
export function getResolvedCaseCount(report) {
    return getResolvedCases(report).length;
}
export function allCasesResolved(report) {
    const cases = getReportCases(report);
    return cases.length > 0 && cases.every((item) => item.status === "resolved");
}
export function hasOpenCases(report) {
    return getOpenCases(report).length > 0;
}
export function resolveCases(cases, caseIds, resolvedAt = new Date().toISOString()) {
    const targetIds = new Set(caseIds);
    return cases.map((item) => {
        if (!targetIds.has(item.id) || item.status === "resolved") {
            return item;
        }
        return {
            ...item,
            status: "resolved",
            updated_at: resolvedAt,
        };
    });
}
export function syncIssueStatusFromCases(report) {
    if (report.status === "archived") {
        return "archived";
    }
    if (allCasesResolved(report)) {
        return "resolved";
    }
    if (report.status === "resolved" || report.status === "git_issued") {
        return "open";
    }
    return report.status;
}
export function applyCaseStatusSync(report) {
    return {
        ...report,
        status: syncIssueStatusFromCases(report),
    };
}
export function getIssueSummary(report, options) {
    const cases = getReportCases(report).map((item) => item.text.trim()).filter(Boolean);
    if (cases.length === 0) {
        return "";
    }
    if (cases.length === 1) {
        return cases[0];
    }
    const formatMore = options?.summaryMore ?? ((count) => `외 ${count}건`);
    return `${cases[0]} ${formatMore(cases.length - 1)}`;
}
export function shouldShowCaseProgress(report) {
    return getReportCases(report).length > 1;
}
export function getIssueProgressLabel(report) {
    const total = getReportCases(report).length;
    const resolved = getResolvedCaseCount(report);
    if (total === 0) {
        return "";
    }
    return `${resolved}/${total}`;
}
export function casesToSearchText(cases) {
    return cases.map((item) => item.text).join(" ");
}
function isCaseStatus(value) {
    return value === "open" || value === "resolved";
}
export function normalizeReportCase(value, fallbackTimestamp) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }
    const item = value;
    if (typeof item.id !== "string" || typeof item.text !== "string") {
        return null;
    }
    const createdAt = typeof item.created_at === "string" && item.created_at.trim().length > 0 ? item.created_at : fallbackTimestamp;
    const updatedAt = typeof item.updated_at === "string" && item.updated_at.trim().length > 0 ? item.updated_at : createdAt;
    return {
        id: item.id,
        text: item.text,
        status: isCaseStatus(item.status) ? item.status : "open",
        assignee_name: item.assignee_name === null || typeof item.assignee_name === "string" ? (item.assignee_name ?? null) : null,
        created_at: createdAt,
        updated_at: updatedAt,
    };
}
export function normalizeReportCases(value, fallbackTimestamp) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.flatMap((item) => {
        const normalized = normalizeReportCase(item, fallbackTimestamp);
        return normalized ? [normalized] : [];
    });
}
export function normalizeReplyCaseIds(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === "string" && item.trim().length > 0);
}
export function normalizeFeedbackCases(item) {
    const normalized = normalizeReportCases(item.cases, item.created_at);
    if (normalized.length > 0) {
        return normalized;
    }
    const legacyMessage = typeof item.message === "string" ? item.message.trim() : "";
    if (legacyMessage) {
        return [createReportCase(legacyMessage, { created_at: item.created_at, updated_at: item.created_at })];
    }
    return normalized;
}
export function canEditReportCases(report) {
    return report.status !== "archived";
}
export function getOpenCaseIds(report) {
    return getOpenCases(report).map((item) => item.id);
}
export function isValidCaseSelection(report, selectedCaseIds) {
    if (selectedCaseIds.length === 0) {
        return false;
    }
    const openCaseIds = new Set(getOpenCaseIds(report));
    return selectedCaseIds.every((caseId) => openCaseIds.has(caseId));
}
export function getCaseLabels(report, caseIds) {
    const caseMap = new Map(getReportCases(report).map((item) => [item.id, item.text]));
    return caseIds.flatMap((caseId) => {
        const label = caseMap.get(caseId)?.trim();
        return label ? [label] : [];
    });
}
export function buildResolvedCasesUpdate(report, caseIds) {
    return resolveCases(getReportCases(report), caseIds);
}
export function validateCasesForSubmit(cases, messages) {
    if (cases.length === 0) {
        return messages.casesRequired;
    }
    for (const [index, item] of cases.entries()) {
        if (!item.text.trim()) {
            return messages.caseTextRequired(index + 1);
        }
    }
    return "";
}
//# sourceMappingURL=reportCases.js.map