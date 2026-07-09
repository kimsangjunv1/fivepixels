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
        previous_assignee_name: item.previous_assignee_name === null || typeof item.previous_assignee_name === "string" ? (item.previous_assignee_name ?? null) : null,
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
export function getCaseById(report, caseId) {
    return getReportCases(report).find((item) => item.id === caseId);
}
export function replyBelongsToCase(reply, caseId, report) {
    const caseIds = reply.case_ids ?? [];
    if (caseIds.length === 0) {
        const cases = report ? getReportCases(report) : [];
        return cases.length === 1 && cases[0]?.id === caseId;
    }
    return caseIds.includes(caseId);
}
export function getRepliesForCase(report, caseId) {
    return (report.replies ?? []).filter((reply) => replyBelongsToCase(reply, caseId, report));
}
export function getCaseAssigneeName(report, caseId) {
    const assignee = getCaseById(report, caseId)?.assignee_name?.trim();
    return assignee || null;
}
export function getLatestReplyAuthorForCase(report, caseId) {
    const replies = getRepliesForCase(report, caseId);
    for (let index = replies.length - 1; index >= 0; index -= 1) {
        const reply = replies[index];
        if (reply.author_type === "system") {
            continue;
        }
        const authorName = reply.author_name?.trim();
        if (authorName) {
            return authorName;
        }
    }
    return null;
}
export function getCaseHandlerName(report, caseId) {
    return getCaseAssigneeName(report, caseId);
}
export function resolveAuthorDepartment(authors, authorName) {
    const normalizedName = authorName.trim();
    if (!normalizedName) {
        return null;
    }
    const author = authors.find((item) => item.name.trim() === normalizedName);
    return author?.department?.trim() || null;
}
export function formatAssigneeLabel(authorName, department) {
    const name = authorName.trim();
    const dept = department?.trim();
    if (name && dept) {
        return `${name}, ${dept}`;
    }
    return name;
}
export function hasCaseDiscussion(report, caseId) {
    return getRepliesForCase(report, caseId).length > 0;
}
export function isCaseInProgress(report, caseId) {
    const caseItem = getCaseById(report, caseId);
    if (!caseItem || caseItem.status !== "open") {
        return false;
    }
    return Boolean(getCaseAssigneeName(report, caseId));
}
export function canActOnCase(report, caseId, actorName) {
    const actor = actorName.trim();
    if (!actor) {
        return false;
    }
    const qaName = report.author_name?.trim() ?? "";
    if (qaName && actor === qaName) {
        return true;
    }
    const assignee = getCaseAssigneeName(report, caseId);
    if (!assignee) {
        return true;
    }
    return actor === assignee;
}
export function claimCaseAssignee(cases, caseId, assigneeName, claimedAt = new Date().toISOString()) {
    const normalizedName = assigneeName.trim();
    if (!normalizedName) {
        return cases;
    }
    return cases.map((item) => {
        if (item.id !== caseId || item.assignee_name?.trim()) {
            return item;
        }
        return {
            ...item,
            assignee_name: normalizedName,
            updated_at: claimedAt,
        };
    });
}
export function transferCaseAssignee(cases, caseId, assigneeName, transferredAt = new Date().toISOString()) {
    const normalizedName = assigneeName.trim();
    if (!normalizedName) {
        return cases;
    }
    return cases.map((item) => {
        if (item.id !== caseId) {
            return item;
        }
        const previousAssignee = item.assignee_name?.trim() || null;
        return {
            ...item,
            assignee_name: normalizedName,
            previous_assignee_name: previousAssignee,
            updated_at: transferredAt,
        };
    });
}
export function resolveDefaultFocusedCaseId(report) {
    const cases = getReportCases(report);
    const firstOpenCase = cases.find((item) => item.status === "open");
    return firstOpenCase?.id ?? cases[0]?.id ?? null;
}
export function isValidFocusedCase(report, caseId) {
    if (!caseId) {
        return false;
    }
    return getReportCases(report).some((item) => item.id === caseId);
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