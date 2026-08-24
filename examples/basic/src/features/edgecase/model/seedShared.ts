import type { ElementMention } from "@/types/mention.js";
import type { ReportFeedback, ReportPosition, ReportReply, ReportTargetType } from "@/types/report.js";
import { ISSUE_ROOT_PARENT_ID } from "@/utils/feedback/feedbackThread.js";
import { createAutoPickReportId } from "@/utils/marker/targetSelector.js";
import { createReportCase } from "@/utils/report/reportCases.js";

/** Mirrors `team` reviewers in examples/basic/src/App.tsx */
export const SEED_TEAM = {
    user: "김민수",
    qa: "박서연, QA",
    frontend: "이준호, 프론트엔드",
    backend: "최유진, 백엔드",
} as const;

export type DemoSeedCatalogEntry = {
    id: string;
    label: string;
    summary: string;
};

export function daysAgo(days: number, hour = 10) {
    const date = new Date();

    date.setUTCDate(date.getUTCDate() - days);
    date.setUTCHours(hour, 0, 0, 0);

    return date.toISOString();
}

export function hoursAgo(hours: number) {
    const date = new Date();

    date.setUTCHours(date.getUTCHours() - hours, 0, 0, 0);

    return date.toISOString();
}

export function todayIso() {
    const date = new Date();

    date.setUTCHours(11, 30, 0, 0);

    return date.toISOString();
}

export function seedFields(message: string, options: { isBug?: boolean; isImportant?: boolean } = {}) {
    return {
        message,
        isBug: options.isBug ?? false,
        isImportant: options.isImportant ?? false,
    };
}

export function anchorPosition(reportId: string, reportType: ReportTargetType, scrollY = 180, y = 0.35): ReportPosition {
    return {
        target: { x: 0.5, y: 0.5 },
        viewport: { x: 0.5, y, width: 1280, height: 800 },
        scrollY,
        anchor: { reportId, reportType, x: 0.5, y: 0.5 },
    };
}

export function coordinatePosition(x: number, y: number, scrollY = 240): ReportPosition {
    return {
        target: { x, y },
        viewport: { x, y, width: 1280, height: 800 },
        scrollY,
        anchor: null,
    };
}

export function seedReply(
    id: string,
    message: string,
    createdAt: string,
    status: ReportReply["status"],
    overrides: Partial<ReportReply> = {},
): ReportReply {
    return {
        id,
        message,
        created_at: createdAt,
        status,
        case_ids: overrides.case_ids ?? [],
        ...overrides,
    };
}

export function buildSeedFeedback(
    id: string,
    pathname: string,
    overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "report_id" | "report_type" | "cases" | "position">,
): ReportFeedback {
    const createdAt = overrides.created_at ?? daysAgo(3);

    return {
        id,
        pathname,
        report_id: overrides.report_id,
        report_type: overrides.report_type,
        cases: overrides.cases,
        status: overrides.status ?? "open",
        field_values: overrides.field_values ?? seedFields(`[${id}] Demo feedback`),
        replies: overrides.replies ?? [],
        position: overrides.position,
        created_at: createdAt,
        environment: "STAGED",
        app_version: "1.0.0",
        author_id: overrides.author_id,
        author_name: overrides.author_name,
        target_selector: overrides.target_selector,
        integrations: overrides.integrations,
    };
}

export function untaggedSeedFeedback(
    id: string,
    pathname: string,
    selector: string,
    overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "cases" | "position">,
): ReportFeedback {
    return buildSeedFeedback(id, pathname, {
        report_id: createAutoPickReportId(selector),
        report_type: "item",
        target_selector: selector,
        ...overrides,
    });
}

export { createReportCase, ISSUE_ROOT_PARENT_ID, createAutoPickReportId };

export type ElementMentionSeed = ElementMention;
