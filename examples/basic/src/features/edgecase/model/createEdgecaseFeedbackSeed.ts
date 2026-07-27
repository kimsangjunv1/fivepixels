import type { ElementMention } from "@/types/mention.js";
import type { ReportFeedback, ReportPosition, ReportReply, ReportTargetType } from "@/types/report.js";
import { createReportCase } from "@/utils/report/reportCases.js";
import { ISSUE_ROOT_PARENT_ID } from "@/utils/feedback/feedbackThread.js";
import { createAutoPickReportId } from "@/utils/marker/targetSelector.js";
import { EDGECASE_PATHNAME } from "./reportProjectScope.js";

/** Mirrors `team` in examples/basic/src/App.tsx */
const TEAM = {
    user: "Alex",
    alex: "Alex, QA Assistant",
    sophia: "Sophia, QA",
    william: "William, Developer",
    emma: "Emma, Designer",
} as const;

const CASE = {
    wait: "edgecase-case-wait",
    multiA: "edgecase-case-multi-a",
    multiB: "edgecase-case-multi-b",
    multiResolved: "edgecase-case-multi-resolved",
    threadA: "edgecase-case-thread-a",
    threadB: "edgecase-case-thread-b",
    threadC: "edgecase-case-thread-c",
    resolvedOnly: "edgecase-case-resolved-only",
    question: "edgecase-case-question",
    happy: "edgecase-case-happy",
    denyApprove: "edgecase-case-deny-approve",
    denyOfDeny: "edgecase-case-deny-of-deny",
    recheckFirst: "edgecase-case-recheck-first",
    longQa: "edgecase-case-long-qa",
    stuckError: "edgecase-case-stuck-error",
    stuckRecheck: "edgecase-case-stuck-recheck",
    mention: "edgecase-case-mention",
    transferFight: "edgecase-case-transfer-fight",
    gitOpen: "edgecase-case-git-open",
    gitDone: "edgecase-case-git-done",
} as const;

export type EdgecaseSeedCatalogEntry = {
    id: string;
    label: string;
    summary: string;
};

function daysAgo(days: number, hour = 10) {
    const date = new Date();

    date.setUTCDate(date.getUTCDate() - days);
    date.setUTCHours(hour, 0, 0, 0);

    return date.toISOString();
}

function hoursAgo(hours: number) {
    const date = new Date();

    date.setUTCHours(date.getUTCHours() - hours, 0, 0, 0);

    return date.toISOString();
}

function todayIso() {
    const date = new Date();

    date.setUTCHours(11, 30, 0, 0);

    return date.toISOString();
}

function fields(message: string, options: { isBug?: boolean; isImportant?: boolean } = {}) {
    return {
        message,
        isBug: options.isBug ?? false,
        isImportant: options.isImportant ?? false,
    };
}

function anchorPosition(reportId: string, reportType: ReportTargetType, scrollY = 180, y = 0.35): ReportPosition {
    return {
        target: { x: 0.5, y: 0.5 },
        viewport: { x: 0.5, y, width: 1280, height: 800 },
        scrollY,
        anchor: { reportId, reportType, x: 0.5, y: 0.5 },
    };
}

function coordinatePosition(x: number, y: number, scrollY = 240): ReportPosition {
    return {
        target: { x, y },
        viewport: { x, y, width: 1280, height: 800 },
        scrollY,
        anchor: null,
    };
}

function reply(id: string, message: string, createdAt: string, status: ReportReply["status"], overrides: Partial<ReportReply> = {}): ReportReply {
    return {
        id,
        message,
        created_at: createdAt,
        status,
        case_ids: overrides.case_ids ?? [],
        ...overrides,
    };
}

function seedFeedback(id: string, overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "report_id" | "report_type" | "cases" | "position">): ReportFeedback {
    const createdAt = overrides.created_at ?? daysAgo(3);

    return {
        id,
        pathname: EDGECASE_PATHNAME,
        report_id: overrides.report_id,
        report_type: overrides.report_type,
        cases: overrides.cases,
        status: overrides.status ?? "open",
        field_values: overrides.field_values ?? fields(`[${id}] Edgecase demo feedback`),
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

function untaggedFeedback(id: string, selector: string, overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "cases" | "position">): ReportFeedback {
    return seedFeedback(id, {
        report_id: createAutoPickReportId(selector),
        report_type: "item",
        target_selector: selector,
        ...overrides,
    });
}

const PRIMARY_CTA_MENTION: ElementMention = {
    id: "m_edge_primary_cta",
    label: "Primary CTA",
    targetSelector: null,
    reportId: "edge-primary-cta",
    suggestedReportId: null,
};

const FLEX_CHIP_MENTION: ElementMention = {
    id: "m_edge_flex_chip",
    label: "Nested chip",
    targetSelector: null,
    reportId: "edge-flex-nested-chip",
    suggestedReportId: null,
};

export function createEdgecaseFeedbackSeed(): ReportFeedback[] {
    const secondaryLinkSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(3)";
    const flexSecondarySelector = ".pulse-edgecase-flex-toolbar > button.pulse-edgecase-flex-chip--untagged";
    const gridCellBSelector = ".pulse-edgecase-grid-board .pulse-edgecase-grid-cell--untagged:nth-child(2)";
    const missingSelector = ".edgecase-seed-missing-target";
    const stagedMetricSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(5)";
    const warningBannerSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(6)";
    const submitActionSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(8)";
    const footerHintSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(10)";
    const settingsTooltipSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(11)";

    return [
        // --- Lifecycle stories -------------------------------------------------
        seedFeedback("edgecase-seed-open-currently-wait", {
            report_id: "edge-hero-banner",
            report_type: "group",
            cases: [
                createReportCase(
                    "On viewports below 768px the hero headline and supporting copy no longer share the same left edge. The title shifts 8px further left than the body text.",
                    { id: CASE.wait },
                ),
            ],
            field_values: fields(
                "[currently_wait] No replies yet — starting state before anyone claims or answers. Confirm whether the typography token update caused this alignment drift.",
            ),
            position: anchorPosition("edge-hero-banner", "group", 0, 0.22),
            created_at: todayIso(),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seedFeedback("edgecase-seed-story-happy-path-resolved", {
            report_id: "edge-primary-cta",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase(
                    "Primary CTA label wraps to two lines on Korean locale builds even though the Figma spec shows a single-line treatment.",
                    {
                        id: CASE.happy,
                        status: "resolved",
                        assignee_name: TEAM.william,
                        previous_assignee_name: TEAM.sophia,
                    },
                ),
            ],
            field_values: fields(
                "[happy-path] Full conversation from create → assign → Q&A → suggest → resolve. Use this to verify the complete success timeline.",
                { isImportant: true },
            ),
            replies: [
                reply("edgecase-reply-happy-assigned", "An assignee has been assigned.", daysAgo(6, 9), "assignee_assigned", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
                reply("edgecase-reply-happy-transferred", "The assignee has been changed.", daysAgo(6, 11), "assignee_transferred", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                reply(
                    "edgecase-reply-happy-q1",
                    "Before I change min-width — is this only on Korean locale, or do German/Japanese builds wrap as well?",
                    daysAgo(5, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-happy-a1",
                    "Korean and Japanese wrap; German stays single-line. Prefer widening min-width over shortening copy.",
                    daysAgo(5, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-happy-suggested",
                    "Raised CTA min-width to 168px and kept Korean copy intact. Please confirm single-line rendering on iPhone SE + Pixel 7.",
                    daysAgo(4, 12),
                    "suggested",
                    {
                        case_ids: [CASE.happy],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-happy-q2",
                    "Looks good on SE — does the wider min-width collide with the secondary link on 320px?",
                    daysAgo(3, 15),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: "edgecase-reply-happy-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-happy-resolved",
                    "Verified 320–414px — CTA stays single-line and secondary link still fits. Marking resolved.",
                    daysAgo(2, 16),
                    "resolved",
                    {
                        case_ids: [CASE.happy],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-primary-cta", "item", 40, 0.28),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seedFeedback("edgecase-seed-story-deny-then-approve", {
            report_id: "edge-metric-open",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase(
                    "Open-issues metric card still uses the neutral gray accent. Product asked us to surface severity through color.",
                    { id: CASE.denyApprove, status: "resolved", assignee_name: TEAM.emma },
                ),
            ],
            field_values: fields(
                "[deny→approve] Suggested fix was rejected once, then a revised suggestion was approved. Exercises found_error → suggested → resolved.",
            ),
            replies: [
                reply(
                    "edgecase-reply-deny-approve-suggested-1",
                    "Swapped the metric accent to semantic.warning. Please verify light and dark themes.",
                    daysAgo(5, 10),
                    "suggested",
                    {
                        case_ids: [CASE.denyApprove],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                reply(
                    "edgecase-reply-deny-approve-found-error",
                    "Dark mode still looks identical to the resolved metric card — warning token isn't applied on the icon stroke. Rejecting this pass.",
                    daysAgo(4, 12),
                    "found_error",
                    {
                        case_ids: [CASE.denyApprove],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-deny-approve-suggested-2",
                    "Updated both fill and stroke tokens for dark theme. Side-by-side with resolved metrics now reads clearly as attention.",
                    daysAgo(3, 11),
                    "suggested",
                    {
                        case_ids: [CASE.denyApprove],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                reply(
                    "edgecase-reply-deny-approve-resolved",
                    "Confirmed on both themes. Approving and resolving.",
                    daysAgo(2, 14),
                    "resolved",
                    {
                        case_ids: [CASE.denyApprove],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-metric-open", "item", 80),
        }),

        seedFeedback("edgecase-seed-story-deny-of-deny", {
            report_id: "edge-search-field",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase(
                    "Filter input placeholder truncates with an ellipsis on mobile even though there is enough horizontal space.",
                    { id: CASE.denyOfDeny, status: "resolved", assignee_name: TEAM.william },
                ),
            ],
            field_values: fields(
                "[거절의 거절] suggested → found_error → recheck_requested → found_error → suggested → resolved. Full deny/recheck ping-pong.",
                { isBug: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-dod-suggested-1",
                    "Removed flex shrink on the input wrapper. Placeholder should show the full string on mobile.",
                    daysAgo(7, 9),
                    "suggested",
                    {
                        case_ids: [CASE.denyOfDeny],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-dod-found-1",
                    "Still truncates on iPhone 14 Safari — the parent flex item still has min-width:0 from a shared utility.",
                    daysAgo(6, 11),
                    "found_error",
                    {
                        case_ids: [CASE.denyOfDeny],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-dod-recheck",
                    "I checked again — Safari shows the full placeholder at 390px. This may be a zoom/font-size illusion rather than a layout bug.",
                    daysAgo(5, 13),
                    "recheck_requested",
                    {
                        case_ids: [CASE.denyOfDeny],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-dod-found-2",
                    "Reproduced with default Safari settings and a fresh profile. Still truncates. Rejecting the 'not a bug' claim.",
                    daysAgo(4, 10),
                    "found_error",
                    {
                        case_ids: [CASE.denyOfDeny],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-dod-suggested-2",
                    "Overrode the shared min-width:0 on this input only and shortened the placeholder for locales over 28 chars. Please re-test Safari.",
                    daysAgo(3, 12),
                    "suggested",
                    {
                        case_ids: [CASE.denyOfDeny],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-dod-resolved",
                    "Safari + Chrome Android both show the full placeholder now. Resolving.",
                    daysAgo(2, 15),
                    "resolved",
                    {
                        case_ids: [CASE.denyOfDeny],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-search-field", "item", 120),
        }),

        seedFeedback("edgecase-seed-story-recheck-first", {
            report_id: "edge-sidebar-note",
            report_type: "item",
            cases: [
                createReportCase(
                    "Sidebar note typography hierarchy is flat — title, body, and meta all render at 14px regular.",
                    { id: CASE.recheckFirst, assignee_name: TEAM.emma },
                ),
            ],
            field_values: fields(
                "[recheck-first] Assignee claimed 'not an error' before any suggestion. Latest root is recheck_requested — waiting on creator response.",
            ),
            replies: [
                reply("edgecase-reply-recheck-first-assigned", "An assignee has been assigned.", daysAgo(2, 9), "assignee_assigned", {
                    case_ids: [CASE.recheckFirst],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                reply(
                    "edgecase-reply-recheck-first-root",
                    "Flat hierarchy is intentional for dense panel notes — the design system uses a single size here. Not a bug; happy to add a code comment.",
                    daysAgo(1, 14),
                    "recheck_requested",
                    {
                        case_ids: [CASE.recheckFirst],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-sidebar-note", "item", 160),
        }),

        seedFeedback("edgecase-seed-story-long-qa-then-resolve", {
            report_id: "edge-flex-toolbar",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase(
                    "Toolbar chips wrap onto a second row when the panel is narrow, but the ghost link stays on the first row alone.",
                    { id: CASE.longQa, status: "resolved", assignee_name: TEAM.william },
                ),
            ],
            field_values: fields(
                "[long-qa→resolve] Multiple root questions, a suggested branch with nested questions, then final resolution.",
            ),
            replies: [
                reply(
                    "edgecase-reply-long-q1",
                    "Which panel width should we optimize for first — 360 docked or 320 mobile overlay?",
                    daysAgo(8, 9),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
                reply(
                    "edgecase-reply-long-q2",
                    "Also — should the ghost link shrink with the chips, or stay fixed width?",
                    daysAgo(8, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                reply(
                    "edgecase-reply-long-a",
                    "Prioritize 360 docked. Ghost link can share the same min-width as chips.",
                    daysAgo(7, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-long-suggested",
                    "Applied nowrap + shared min-width so chips and ghost link scale together down to 320px.",
                    daysAgo(6, 12),
                    "suggested",
                    {
                        case_ids: [CASE.longQa],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-long-branch-q",
                    "Does nowrap remove the ghost link underline on hover?",
                    daysAgo(5, 13),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: "edgecase-reply-long-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-long-branch-a",
                    "Underline still works — hover styles are on the link itself, not the flex container.",
                    daysAgo(4, 15),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: "edgecase-reply-long-suggested",
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-long-resolved",
                    "Verified at 320/360/414. Resolving the toolbar wrap case.",
                    daysAgo(3, 16),
                    "resolved",
                    {
                        case_ids: [CASE.longQa],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-toolbar", "group", 200, 0.55),
        }),

        seedFeedback("edgecase-seed-story-stuck-found-error", {
            report_id: "edge-flex-btn-primary",
            report_type: "item",
            cases: [
                createReportCase(
                    "Primary chip still overlaps the secondary chip at 320px width even after the nowrap patch.",
                    { id: CASE.stuckError, assignee_name: TEAM.william },
                ),
            ],
            field_values: fields(
                "[stuck found_error] Conversation ended on a rejection — attention / deny actions should remain available.",
                { isBug: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-stuck-suggested",
                    "Nudged chip padding down 2px. Should clear the overlap on iPhone SE.",
                    daysAgo(2, 10),
                    "suggested",
                    {
                        case_ids: [CASE.stuckError],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-stuck-q",
                    "Did you test with the panel docked at 360 as well, or only SE?",
                    daysAgo(1, 12),
                    "additional_question",
                    {
                        case_ids: [CASE.stuckError],
                        parent_reply_id: "edgecase-reply-stuck-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-stuck-found",
                    "Still overlaps ~12px on SE and blocks the secondary tap target. Rejecting until hit areas no longer collide.",
                    hoursAgo(6),
                    "found_error",
                    {
                        case_ids: [CASE.stuckError],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-btn-primary", "item", 220, 0.58),
        }),

        seedFeedback("edgecase-seed-story-stuck-recheck", {
            report_id: "edge-flex-nested-chip",
            report_type: "item",
            cases: [
                createReportCase(
                    "Tagged chip border radius reads as 6px in the browser but the design token file specifies 8px.",
                    { id: CASE.stuckRecheck, assignee_name: TEAM.emma },
                ),
            ],
            field_values: fields(
                "[stuck recheck] Latest root claims 'not an error'. Creator can deny the recheck or accept.",
            ),
            replies: [
                reply(
                    "edgecase-reply-stuck-recheck-root",
                    "Shared chip utility intentionally maps to 6px on dense toolbars. Figma shows the spacious 8px variant — not a bug.",
                    daysAgo(1, 11),
                    "recheck_requested",
                    {
                        case_ids: [CASE.stuckRecheck],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-nested-chip", "item", 280, 0.64),
        }),

        seedFeedback("edgecase-seed-open-suggested-pending", {
            report_id: "edge-flex-stack-title",
            report_type: "item",
            cases: [
                createReportCase("Stack title font weight looks heavier than the documented 600 semibold token."),
            ],
            field_values: fields(
                "[suggested pending] Single manager suggestion waiting for confirm — REQUEST CONFIRM display state.",
            ),
            replies: [
                reply(
                    "edgecase-reply-suggested-pending",
                    "Title uses font-weight 600; macOS subpixel AA can look heavier. Reduced to 500 in this compact stack — please confirm both themes.",
                    daysAgo(1, 10),
                    "suggested",
                    {
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-stack-title", "item", 300, 0.66),
        }),

        seedFeedback("edgecase-seed-open-question-on-root", {
            report_id: "edge-flex-nested",
            report_type: "group",
            cases: [
                createReportCase(
                    "Nested flex row loses vertical alignment between the tagged chip and the untagged note.",
                    { id: CASE.question },
                ),
            ],
            field_values: fields(
                "[question on root] additional_question attached to ISSUE_ROOT_PARENT_ID with no branch yet.",
                { isBug: true, isImportant: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-question-root",
                    "Should the untagged note stay baseline-aligned with body copy, or center against the chip?",
                    daysAgo(1, 12),
                    "additional_question",
                    {
                        case_ids: [CASE.question],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-nested", "group", 260, 0.62),
        }),

        seedFeedback("edgecase-seed-open-suggested-with-question", {
            report_id: "edge-grid-dashboard",
            report_type: "group",
            cases: [
                createReportCase(
                    "Dashboard grid gap collapses from 16px to 4px on tablet breakpoints, causing cells to visually merge.",
                    { id: CASE.resolvedOnly },
                ),
            ],
            field_values: fields(
                "[suggested + nested question] Branch root suggested with a child question still open.",
            ),
            replies: [
                reply(
                    "edgecase-reply-grid-suggested",
                    "Updated md breakpoint to keep a 12px minimum gap. Cells should no longer touch at 768px.",
                    daysAgo(2, 10),
                    "suggested",
                    {
                        case_ids: [CASE.resolvedOnly],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-grid-question",
                    "Does the 12px gap also hold when one cell spans two columns?",
                    daysAgo(1, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.resolvedOnly],
                        parent_reply_id: "edgecase-reply-grid-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-dashboard", "group", 340, 0.72),
        }),

        seedFeedback("edgecase-seed-story-deny-of-deny-open", {
            report_id: "edge-grid-cell-span",
            report_type: "item",
            cases: [
                createReportCase(
                    "Span cell label still clips descenders on the second line after the grid-column fix.",
                    { id: "edgecase-case-deny-open", assignee_name: TEAM.william },
                ),
            ],
            field_values: fields(
                "[거절의 거절 · open] Mid-fight: found_error after recheck. Next action should be another suggestion or resolve.",
                { isBug: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-deny-open-s1",
                    "Increased line-height on the span label. Descenders should clear.",
                    daysAgo(4, 9),
                    "suggested",
                    {
                        case_ids: ["edgecase-case-deny-open"],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-deny-open-f1",
                    "Still clips in Firefox at 110% zoom.",
                    daysAgo(3, 11),
                    "found_error",
                    {
                        case_ids: ["edgecase-case-deny-open"],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-deny-open-r1",
                    "Firefox at 110% is a known sub-pixel case we accepted last quarter — not blocking release.",
                    daysAgo(2, 13),
                    "recheck_requested",
                    {
                        case_ids: ["edgecase-case-deny-open"],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-deny-open-f2",
                    "Rejecting that — product still wants descenders visible at common zoom levels. Please try padding-bottom instead.",
                    daysAgo(1, 10),
                    "found_error",
                    {
                        case_ids: ["edgecase-case-deny-open"],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-cell-span", "item", 380, 0.76),
        }),

        // --- Multi-case / assignee / mention -----------------------------------
        seedFeedback("edgecase-seed-open-multicase-diverged", {
            report_id: "edge-grid-nested-pill",
            report_type: "item",
            cases: [
                createReportCase("Pill min-width is too small — Korean locale labels clip after three characters.", {
                    id: CASE.threadA,
                    status: "resolved",
                    assignee_name: TEAM.william,
                }),
                createReportCase("Caption should truncate with ellipsis instead of wrapping and pushing row height.", {
                    id: CASE.threadB,
                    assignee_name: TEAM.emma,
                }),
                createReportCase("Hover outline on the pill disappears against the teal grid background.", {
                    id: CASE.threadC,
                    assignee_name: TEAM.sophia,
                }),
            ],
            field_values: fields(
                "[multi-case diverged] Case A resolved, B suggested pending, C found_error mid-fight. Per-case thread scoping.",
                { isImportant: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-div-a-suggested",
                    "Increased pill min-width to 72px. Korean 3-char labels fit.",
                    daysAgo(4, 10),
                    "suggested",
                    {
                        case_ids: [CASE.threadA],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-div-a-resolved",
                    "Verified KO/EN. Resolving case A.",
                    daysAgo(3, 12),
                    "resolved",
                    {
                        case_ids: [CASE.threadA],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
                reply(
                    "edgecase-reply-div-b-suggested",
                    "Applied ellipsis + nowrap on the caption. Row height stays 32px.",
                    daysAgo(2, 11),
                    "suggested",
                    {
                        case_ids: [CASE.threadB],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                reply(
                    "edgecase-reply-div-c-suggested",
                    "Bumped outline to a high-contrast token on teal backgrounds.",
                    daysAgo(2, 14),
                    "suggested",
                    {
                        case_ids: [CASE.threadC],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
                reply(
                    "edgecase-reply-div-c-found",
                    "Outline still vanishes in dark mode on the teal cell. Rejecting case C for now.",
                    daysAgo(1, 9),
                    "found_error",
                    {
                        case_ids: [CASE.threadC],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-nested-pill", "item", 420, 0.8),
        }),

        seedFeedback("edgecase-seed-open-assignee-events", {
            report_id: createAutoPickReportId(settingsTooltipSelector),
            report_type: "item",
            target_selector: settingsTooltipSelector,
            cases: [
                createReportCase(
                    "Tooltip arrow is clipped by the parent overflow container on the settings panel.",
                    { id: "edgecase-case-assigned-only", assignee_name: TEAM.william },
                ),
                createReportCase(
                    "Keyboard focus ring on the segmented control is hidden behind the sticky header.",
                    {
                        id: "edgecase-case-transferred",
                        assignee_name: TEAM.emma,
                        previous_assignee_name: TEAM.william,
                    },
                ),
            ],
            replies: [
                reply("edgecase-reply-assignee-assigned-only", "An assignee has been assigned.", daysAgo(2, 10), "assignee_assigned", {
                    case_ids: ["edgecase-case-assigned-only"],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                reply("edgecase-reply-assignee-assigned-transfer", "An assignee has been assigned.", daysAgo(1, 10), "assignee_assigned", {
                    case_ids: ["edgecase-case-transferred"],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                reply("edgecase-reply-assignee-transferred", "The assignee has been changed.", hoursAgo(8), "assignee_transferred", {
                    case_ids: ["edgecase-case-transferred"],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
            ],
            field_values: fields(
                "[assignee events] claim + transfer timeline with previous_assignee_name on the transferred case.",
            ),
            position: coordinatePosition(0.42, 0.62, 170),
        }),

        seedFeedback("edgecase-seed-story-transfer-then-fight", {
            report_id: "edge-grid-nested-flex",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase(
                    "Nested flex caption spacing drifts 4px below the chip center at certain zoom levels.",
                    {
                        id: CASE.transferFight,
                        status: "resolved",
                        assignee_name: TEAM.emma,
                        previous_assignee_name: TEAM.william,
                    },
                ),
            ],
            field_values: fields(
                "[transfer→fight→approve] Assign, transfer, suggest, deny, re-suggest, resolve.",
                { isBug: true },
            ),
            replies: [
                reply("edgecase-reply-tf-assigned", "An assignee has been assigned.", daysAgo(6, 9), "assignee_assigned", {
                    case_ids: [CASE.transferFight],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                reply("edgecase-reply-tf-transferred", "The assignee has been changed.", daysAgo(5, 10), "assignee_transferred", {
                    case_ids: [CASE.transferFight],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                reply(
                    "edgecase-reply-tf-suggested-1",
                    "Set align-items:center on the nested row. Should center chip and caption.",
                    daysAgo(4, 12),
                    "suggested",
                    {
                        case_ids: [CASE.transferFight],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                reply(
                    "edgecase-reply-tf-found",
                    "Still drops on Firefox 110% zoom. Rejecting.",
                    daysAgo(3, 14),
                    "found_error",
                    {
                        case_ids: [CASE.transferFight],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-tf-suggested-2",
                    "Applied line-height lock on the caption span only. Chrome/Safari/Firefox now match at 100–110%.",
                    daysAgo(2, 11),
                    "suggested",
                    {
                        case_ids: [CASE.transferFight],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                reply(
                    "edgecase-reply-tf-resolved",
                    "Verified. Approving after the transfer + deny cycle.",
                    daysAgo(1, 15),
                    "resolved",
                    {
                        case_ids: [CASE.transferFight],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-nested-flex", "group", 400, 0.78),
        }),

        seedFeedback("edgecase-seed-open-with-mentions", {
            report_id: "edge-grid-cell-a",
            report_type: "item",
            cases: [
                createReportCase(
                    `Focus ring on cell A is too faint — compare with @{${PRIMARY_CTA_MENTION.id}} and @{${FLEX_CHIP_MENTION.id}} which already use the stronger outline token.`,
                    {
                        id: CASE.mention,
                        assignee_name: TEAM.william,
                        mentions: [PRIMARY_CTA_MENTION, FLEX_CHIP_MENTION],
                    },
                ),
            ],
            field_values: fields(
                "[mentions] Case text and a reply both embed element @mentions for highlight/navigation.",
                { isBug: true, isImportant: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-mention-suggested",
                    `Aligned cell A outline with @{${PRIMARY_CTA_MENTION.id}}. Please confirm the ring is visible on teal.`,
                    daysAgo(1, 13),
                    "suggested",
                    {
                        case_ids: [CASE.mention],
                        author_type: "manager",
                        author_name: TEAM.william,
                        mentions: [PRIMARY_CTA_MENTION],
                    },
                ),
            ],
            position: anchorPosition("edge-grid-cell-a", "item", 360, 0.74),
        }),

        seedFeedback("edgecase-seed-open-empty-case-actions", {
            report_id: createAutoPickReportId(submitActionSelector),
            report_type: "item",
            target_selector: submitActionSelector,
            cases: [
                createReportCase(
                    "Submit action disabled state has no accessible label — screen readers announce only 'button'.",
                    { id: "edgecase-case-empty-a" },
                ),
                createReportCase(
                    "Cancel affordance is unclear — the text link style matches body copy.",
                    { id: "edgecase-case-empty-b" },
                ),
            ],
            replies: [],
            field_values: fields(
                "[issue_apply] Two open cases, zero replies — per-case entry actions before any review activity.",
            ),
            position: coordinatePosition(0.28, 0.48, 130),
        }),

        seedFeedback("edgecase-seed-multi-question-thread", {
            report_id: createAutoPickReportId(footerHintSelector),
            report_type: "item",
            target_selector: footerHintSelector,
            cases: [
                createReportCase(
                    "Footer hint overlaps the next section by roughly 16px on scroll.",
                    { id: "edgecase-case-questions" },
                ),
            ],
            replies: [
                reply(
                    "edgecase-reply-q1",
                    "I can reproduce at 1280px but not 1440px. Which viewport and browser showed the 16px collision?",
                    daysAgo(2, 10),
                    "additional_question",
                    {
                        case_ids: ["edgecase-case-questions"],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
                reply(
                    "edgecase-reply-q2",
                    "Follow-up — does this only happen in dark mode? Footer hint tokens differ between themes.",
                    daysAgo(1, 12),
                    "additional_question",
                    {
                        case_ids: ["edgecase-case-questions"],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            field_values: fields(
                "[multi-question] Multiple open root questions from different reviewers on one case.",
            ),
            position: coordinatePosition(0.82, 0.52, 150),
        }),

        // --- Lifecycle terminals + target edgecases ----------------------------
        seedFeedback("edgecase-seed-git-issued", {
            report_id: createAutoPickReportId(stagedMetricSelector),
            report_type: "item",
            target_selector: stagedMetricSelector,
            status: "git_issued",
            cases: [
                createReportCase(
                    "Staged feedback metric card is missing the delta indicator arrow.",
                    { id: CASE.gitOpen, assignee_name: TEAM.william },
                ),
                createReportCase(
                    "Related: weekly summary email still shows a stale count — tracked with the same GitHub issue.",
                    { id: CASE.gitDone, status: "resolved", assignee_name: TEAM.sophia },
                ),
            ],
            field_values: fields(
                "[git_issued] Partial case resolve + GitHub integration + system reply.",
                { isBug: true, isImportant: true },
            ),
            integrations: {
                github: {
                    issue_number: 4821,
                    issue_url: "https://github.com/kimsangjunv1/fivepixels/issues/4821",
                    issued_at: daysAgo(1, 16),
                },
            },
            replies: [
                reply(
                    "edgecase-reply-git-system",
                    "GitHub issue #4821 was created and linked to this feedback.",
                    daysAgo(1, 16),
                    "suggested",
                    {
                        author_type: "system",
                        author_name: null,
                    },
                ),
                reply(
                    "edgecase-reply-git-case-resolved",
                    "Email count fixed in staging. Resolving that case; delta arrow still open on GitHub.",
                    hoursAgo(5),
                    "resolved",
                    {
                        case_ids: [CASE.gitDone],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: coordinatePosition(0.55, 0.33, 70),
        }),

        seedFeedback("edgecase-seed-feedback-resolved", {
            report_id: createAutoPickReportId(warningBannerSelector),
            report_type: "item",
            target_selector: warningBannerSelector,
            status: "resolved",
            author_id: "demo-user",
            author_name: TEAM.user,
            cases: [
                createReportCase(
                    "Warning banner icon sits 2px below the first line of text instead of aligning to cap height.",
                    { status: "resolved" },
                ),
            ],
            field_values: fields(
                "[resolved] Closed after verification — list filters / route detail resolved sample. Author metadata present.",
            ),
            replies: [
                reply(
                    "edgecase-reply-feedback-resolved",
                    "Icon now aligns to cap height when the banner wraps. Confirmed Safari/Chrome/Firefox.",
                    daysAgo(2, 14),
                    "resolved",
                    {
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: coordinatePosition(0.72, 0.36, 90),
        }),

        seedFeedback("edgecase-seed-archived", {
            report_id: "edge-grid-cell-a",
            report_type: "item",
            status: "archived",
            cases: [
                createReportCase(
                    "Archived sample — historical focus-ring note from the 1.0 cycle, no longer actionable.",
                    { status: "resolved" },
                ),
            ],
            field_values: fields("[archived] Read-only historical record for archived UI."),
            replies: [
                reply(
                    "edgecase-reply-archived",
                    "Archived following 1.0 sign-off — no further action expected.",
                    daysAgo(10, 10),
                    "resolved",
                    {
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-cell-a", "item", 360, 0.74),
        }),

        untaggedFeedback("edgecase-seed-untagged-grid-card", secondaryLinkSelector, {
            cases: [
                createReportCase(
                    "Untagged card picked via CSS selector only — no data-report-id. Verifies selector-based marker restoration.",
                ),
            ],
            field_values: fields("[untagged grid card] Selector-based target on Secondary link card."),
            position: {
                target: { x: 0.35, y: 0.4 },
                viewport: { x: 0.35, y: 0.4, width: 1280, height: 800 },
                scrollY: 60,
                anchor: null,
            },
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        untaggedFeedback("edgecase-seed-untagged-flex-chip", flexSecondarySelector, {
            cases: [
                createReportCase(
                    "Untagged flex chip tap target is smaller than the 44px minimum — visible chip is 36px.",
                ),
            ],
            field_values: fields("[untagged flex chip] Auto-pick + selector path inside flex toolbar."),
            position: {
                target: { x: 0.42, y: 0.57 },
                viewport: { x: 0.42, y: 0.57, width: 1280, height: 800 },
                scrollY: 210,
                anchor: null,
            },
        }),

        untaggedFeedback("edgecase-seed-untagged-grid-cell", gridCellBSelector, {
            cases: [
                createReportCase(
                    "Untagged grid cell B text contrast ratio is 3.8:1 — below 4.5:1 AA for body text.",
                ),
            ],
            field_values: fields("[untagged grid cell] Contrast bug on cell without report id.", { isBug: true }),
            position: {
                target: { x: 0.62, y: 0.73 },
                viewport: { x: 0.62, y: 0.73, width: 1280, height: 800 },
                scrollY: 350,
                anchor: null,
            },
        }),

        seedFeedback("edgecase-seed-detached-coordinates", {
            report_id: createAutoPickReportId(missingSelector),
            report_type: "item",
            target_selector: missingSelector,
            cases: [
                createReportCase(
                    "Detached marker — original CSS selector no longer resolves after a DOM refactor. Fall back to stored coordinates.",
                ),
            ],
            field_values: fields("[detached] Stale selector; marker should render at saved coordinates."),
            position: coordinatePosition(0.18, 0.42, 500),
        }),

        seedFeedback("edgecase-seed-open-user-suggested", {
            report_id: "edge-flex-btn-primary",
            report_type: "item",
            cases: [
                createReportCase("Creator left a suggested-style note as user author — author_type user on a branch root."),
            ],
            field_values: fields("[user suggested] Non-manager author_type on a suggested reply."),
            replies: [
                reply(
                    "edgecase-reply-user-suggested",
                    "I tried padding: 8px on the primary chip locally and the overlap improved. Sharing as a suggested direction for William.",
                    daysAgo(1, 8),
                    "suggested",
                    {
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-btn-primary", "item", 220, 0.58),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seedFeedback("edgecase-seed-open-found-error-branch", {
            report_id: "edge-flex-nested",
            report_type: "group",
            cases: [
                createReportCase(
                    "Deep branch sample — nested flex alignment with suggest → question → resuggest → found_error → follow-up question.",
                ),
            ],
            field_values: fields(
                "[deep branch] Long open branch ending on a question under found_error.",
                { isBug: true, isImportant: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-branch-suggested",
                    "First pass: align-items center on the nested row.",
                    daysAgo(5, 9),
                    "suggested",
                    { author_type: "manager", author_name: TEAM.william },
                ),
                reply(
                    "edgecase-reply-branch-question",
                    "Center against the chip, or keep body baseline?",
                    daysAgo(4, 11),
                    "additional_question",
                    {
                        parent_reply_id: "edgecase-reply-branch-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-branch-resuggested",
                    "Emma confirmed center alignment for chip pairs. Re-applied on the chip container only.",
                    daysAgo(3, 12),
                    "suggested",
                    { author_type: "manager", author_name: TEAM.william },
                ),
                reply(
                    "edgecase-reply-branch-found-error",
                    "Chip aligns, but note still drops on Firefox at 110% zoom.",
                    daysAgo(2, 14),
                    "found_error",
                    { author_type: "user", author_name: TEAM.user },
                ),
                reply(
                    "edgecase-reply-branch-followup-question",
                    "Can you share a 320px screenshot at Firefox 110% zoom before I try a line-height tweak?",
                    daysAgo(1, 10),
                    "additional_question",
                    {
                        parent_reply_id: "edgecase-reply-branch-found-error",
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-nested", "group", 260, 0.62),
        }),
    ];
}

export const EDGECASE_FEEDBACK_SEED_IDS = createEdgecaseFeedbackSeed().map((item) => item.id);

export const EDGECASE_FEEDBACK_SEED_CATALOG: EdgecaseSeedCatalogEntry[] = [
    { id: "edgecase-seed-open-currently-wait", label: "대기 (currently_wait)", summary: "답글 없음 · 초기 상태" },
    { id: "edgecase-seed-story-happy-path-resolved", label: "해피패스 해결", summary: "담당→질문→제안→승인까지 완주" },
    { id: "edgecase-seed-story-deny-then-approve", label: "거절 후 승인", summary: "suggested → found_error → suggested → resolved" },
    { id: "edgecase-seed-story-deny-of-deny", label: "거절의 거절 (해결)", summary: "deny↔recheck 왕복 후 해결" },
    { id: "edgecase-seed-story-deny-of-deny-open", label: "거절의 거절 (진행중)", summary: "recheck 후 재거절로 멈춤" },
    { id: "edgecase-seed-story-recheck-first", label: "처음부터 오류 아님", summary: "담당 직후 recheck_requested" },
    { id: "edgecase-seed-story-long-qa-then-resolve", label: "장문 Q&A 후 해결", summary: "다중 질문 + 브랜치 질문" },
    { id: "edgecase-seed-story-stuck-found-error", label: "거절로 멈춤", summary: "Attention · found_error" },
    { id: "edgecase-seed-story-stuck-recheck", label: "오류 아님으로 멈춤", summary: "recheck_requested 대기" },
    { id: "edgecase-seed-open-suggested-pending", label: "확인 요청 대기", summary: "suggested 단일 제안" },
    { id: "edgecase-seed-open-question-on-root", label: "루트 질문", summary: "ISSUE_ROOT 질문" },
    { id: "edgecase-seed-open-suggested-with-question", label: "제안+하위 질문", summary: "브랜치 nested question" },
    { id: "edgecase-seed-open-found-error-branch", label: "깊은 브랜치", summary: "suggest↔deny↔질문 체인" },
    { id: "edgecase-seed-open-multicase-diverged", label: "멀티케이스 분기", summary: "케이스별 다른 진행 상태" },
    { id: "edgecase-seed-story-transfer-then-fight", label: "이관 후 거절→승인", summary: "transfer + deny + approve" },
    { id: "edgecase-seed-open-with-mentions", label: "요소 멘션", summary: "case/reply @mention" },
    { id: "edgecase-seed-open-assignee-events", label: "담당 이벤트", summary: "assign / transfer" },
    { id: "edgecase-seed-open-empty-case-actions", label: "이슈 접수", summary: "issue_apply · 답글 없음" },
    { id: "edgecase-seed-multi-question-thread", label: "다중 질문", summary: "여러 reviewer 루트 질문" },
    { id: "edgecase-seed-git-issued", label: "GitHub 발행", summary: "부분 해결 + issue 링크" },
    { id: "edgecase-seed-feedback-resolved", label: "피드백 해결", summary: "resolved + author meta" },
    { id: "edgecase-seed-archived", label: "아카이브", summary: "읽기 전용" },
    { id: "edgecase-seed-untagged-grid-card", label: "Untagged 카드", summary: "selector 타겟" },
    { id: "edgecase-seed-untagged-flex-chip", label: "Untagged flex", summary: "flex chip selector" },
    { id: "edgecase-seed-untagged-grid-cell", label: "Untagged grid", summary: "grid cell selector" },
    { id: "edgecase-seed-detached-coordinates", label: "Detached", summary: "좌표 폴백" },
    { id: "edgecase-seed-open-user-suggested", label: "User suggested", summary: "author_type user" },
];
