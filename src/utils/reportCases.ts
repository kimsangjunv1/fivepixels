import type { ReportCase, ReportCaseStatus, ReportFeedback, ReportStatus } from "@/types/report.js";

export function createCaseId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `case-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createReportCase(text: string, overrides: Partial<Omit<ReportCase, "text">> = {}): ReportCase {
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

export function getReportCases(report: Pick<ReportFeedback, "cases">): ReportCase[] {
    return report.cases ?? [];
}

export function getOpenCases(report: Pick<ReportFeedback, "cases">): ReportCase[] {
    return getReportCases(report).filter((item) => item.status === "open");
}

export function getResolvedCases(report: Pick<ReportFeedback, "cases">): ReportCase[] {
    return getReportCases(report).filter((item) => item.status === "resolved");
}

export function getResolvedCaseCount(report: Pick<ReportFeedback, "cases">): number {
    return getResolvedCases(report).length;
}

export function allCasesResolved(report: Pick<ReportFeedback, "cases">): boolean {
    const cases = getReportCases(report);

    return cases.length > 0 && cases.every((item) => item.status === "resolved");
}

export function hasOpenCases(report: Pick<ReportFeedback, "cases">): boolean {
    return getOpenCases(report).length > 0;
}

export function resolveCases(cases: ReportCase[], caseIds: string[], resolvedAt = new Date().toISOString()): ReportCase[] {
    const targetIds = new Set(caseIds);

    return cases.map((item) => {
        if (!targetIds.has(item.id) || item.status === "resolved") {
            return item;
        }

        return {
            ...item,
            status: "resolved" satisfies ReportCaseStatus,
            updated_at: resolvedAt,
        };
    });
}

export function syncIssueStatusFromCases(report: Pick<ReportFeedback, "cases" | "status">): ReportStatus {
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

export function applyCaseStatusSync(report: ReportFeedback): ReportFeedback {
    return {
        ...report,
        status: syncIssueStatusFromCases(report),
    };
}

export function getIssueSummary(report: Pick<ReportFeedback, "cases">, options?: { summaryMore?: (count: number) => string }): string {
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

export function shouldShowCaseProgress(report: Pick<ReportFeedback, "cases">): boolean {
    return getReportCases(report).length > 1;
}

export function getIssueProgressLabel(report: Pick<ReportFeedback, "cases">): string {
    const total = getReportCases(report).length;
    const resolved = getResolvedCaseCount(report);

    if (total === 0) {
        return "";
    }

    return `${resolved}/${total}`;
}

export function casesToSearchText(cases: ReportCase[]): string {
    return cases.map((item) => item.text).join(" ");
}

function isCaseStatus(value: unknown): value is ReportCaseStatus {
    return value === "open" || value === "resolved";
}

export function normalizeReportCase(value: unknown, fallbackTimestamp: string): ReportCase | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const item = value as Partial<ReportCase>;

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

export function normalizeReportCases(value: unknown, fallbackTimestamp: string): ReportCase[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((item) => {
        const normalized = normalizeReportCase(item, fallbackTimestamp);

        return normalized ? [normalized] : [];
    });
}

export function normalizeReplyCaseIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function normalizeFeedbackCases(
    item: Pick<ReportFeedback, "cases" | "created_at"> & { message?: string },
): ReportCase[] {
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

type CaseValidationMessages = {
    casesRequired: string;
    caseTextRequired: (index: number) => string;
};

export function canEditReportCases(report: Pick<ReportFeedback, "status">): boolean {
    return report.status !== "archived";
}

export function getOpenCaseIds(report: Pick<ReportFeedback, "cases">): string[] {
    return getOpenCases(report).map((item) => item.id);
}

export function isValidCaseSelection(report: Pick<ReportFeedback, "cases">, selectedCaseIds: string[]): boolean {
    if (selectedCaseIds.length === 0) {
        return false;
    }

    const openCaseIds = new Set(getOpenCaseIds(report));

    return selectedCaseIds.every((caseId) => openCaseIds.has(caseId));
}

export function getCaseLabels(report: Pick<ReportFeedback, "cases">, caseIds: string[]): string[] {
    const caseMap = new Map(getReportCases(report).map((item) => [item.id, item.text]));

    return caseIds.flatMap((caseId) => {
        const label = caseMap.get(caseId)?.trim();

        return label ? [label] : [];
    });
}

export function buildResolvedCasesUpdate(report: ReportFeedback, caseIds: string[]): ReportCase[] {
    return resolveCases(getReportCases(report), caseIds);
}

export function validateCasesForSubmit(cases: Array<Pick<ReportCase, "text">>, messages: CaseValidationMessages): string {
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
