import type { ReportFeedback, ReportPosition, ReportReply, ReportTargetType } from "@/types/report.js";
import { createReportCase } from "@/utils/reportCases.js";
import { ISSUE_ROOT_PARENT_ID } from "@/utils/feedbackThread.js";
import { createAutoPickReportId } from "@/utils/targetSelector.js";
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
    resolvedOnly: "edgecase-case-resolved-only",
    question: "edgecase-case-question",
} as const;

function daysAgo(days: number) {
    const date = new Date();

    date.setUTCDate(date.getUTCDate() - days);
    date.setUTCHours(10, 0, 0, 0);

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

export function createEdgecaseFeedbackSeed(): ReportFeedback[] {
    const secondaryLinkSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(3)";
    const flexSecondarySelector = ".pulse-edgecase-flex-toolbar > button.pulse-edgecase-flex-chip--untagged";
    const gridCellBSelector = ".pulse-edgecase-grid-board .pulse-edgecase-grid-cell--untagged:nth-child(2)";
    const missingSelector = ".edgecase-seed-missing-target";

    return [
        seedFeedback("edgecase-seed-open-currently-wait", {
            report_id: "edge-hero-banner",
            report_type: "group",
            cases: [
                createReportCase(
                    "On viewports below 768px the hero headline and supporting copy no longer share the same left edge. The title shifts 8px further left than the body text, which makes the banner feel visually unbalanced when the sidebar collapses.",
                    { id: CASE.wait },
                ),
            ],
            field_values: fields(
                "I noticed this while testing the responsive layout on a 390px device. The hero banner spacing above the fold feels cramped, and the misaligned text baseline makes the whole section look unintentionally offset. Can someone confirm whether this is a regression from last week's typography token update?",
            ),
            position: anchorPosition("edge-hero-banner", "group", 0, 0.22),
            created_at: todayIso(),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seedFeedback("edgecase-seed-open-multicase-assignees", {
            report_id: "edge-primary-cta",
            report_type: "item",
            cases: [
                createReportCase(
                    "The primary CTA label wraps to two lines on Korean locale builds even though the Figma spec shows a single-line treatment. We should either widen the min-width or shorten the copy.",
                    { id: CASE.multiA, assignee_name: TEAM.william },
                ),
                createReportCase(
                    "Hover state contrast on the primary button fails WCAG AA against the teal background. The current token pair is `--primary-500` on `--surface-100`.",
                    { id: CASE.multiB, assignee_name: TEAM.emma },
                ),
                createReportCase(
                    "Legacy spacing between the CTA and the subtitle was already corrected in release 0.9.4 — keeping this here only as a reference for resolved-case UI.",
                    { id: CASE.multiResolved, status: "resolved", assignee_name: TEAM.sophia },
                ),
            ],
            field_values: fields(
                "This button block has three separate concerns: copy wrapping, hover contrast, and a previously fixed spacing issue. I split them into individual cases so each owner can track progress independently.",
                { isImportant: true },
            ),
            position: anchorPosition("edge-primary-cta", "item", 40, 0.28),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seedFeedback("edgecase-seed-open-suggested-manager", {
            report_id: "edge-metric-open",
            report_type: "item",
            cases: [
                createReportCase(
                    "The open-issues metric card still uses the neutral gray accent. Product asked us to surface severity through color, so this card should pull from the semantic warning token instead.",
                ),
            ],
            field_values: fields(
                "During the dashboard review Sophia flagged that open-issue counts aren't visually distinct from resolved metrics. Attaching a screenshot from staging where all three cards look identical.",
            ),
            replies: [
                reply(
                    "edgecase-reply-suggested-manager",
                    "I swapped the metric accent to `semantic.warning` and bumped the icon stroke to match the token spec. The card now reads clearly as an attention state without breaking dark mode. Please verify on both themes before we merge.",
                    daysAgo(1),
                    "suggested",
                    {
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-metric-open", "item", 80),
        }),

        seedFeedback("edgecase-seed-open-suggested-user", {
            report_id: "edge-search-field",
            report_type: "item",
            cases: [
                createReportCase(
                    "Filter input placeholder text truncates with an ellipsis on mobile even though there is enough horizontal space for the full string. Looks like `min-width: 0` on the flex child is the culprit.",
                ),
            ],
            field_values: fields(
                "Reproduced on iPhone 14 Safari and Chrome Android. The placeholder reads 'Filter by…' instead of the full 'Filter by project or owner'. Desktop is fine.",
            ),
            replies: [
                reply(
                    "edgecase-reply-suggested-user",
                    "Good catch — I removed the flex shrink constraint on the input wrapper and shortened the placeholder copy for locales where the string is longer than 24 characters. Can you re-test on the devices you originally used?",
                    daysAgo(2),
                    "suggested",
                    {
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-search-field", "item", 120),
        }),

        seedFeedback("edgecase-seed-open-question-on-root", {
            report_id: "edge-sidebar-note",
            report_type: "item",
            cases: [
                createReportCase(
                    "Sidebar note typography hierarchy is flat — the title, body, and meta line all render at 14px regular weight. Users can't scan the note quickly enough in the feedback panel context.",
                    { id: CASE.question },
                ),
            ],
            field_values: fields(
                "This note block appears in multiple routes. Before we change spacing globally I want to confirm which breakpoint is the priority.",
            ),
            replies: [
                reply(
                    "edgecase-reply-question-root",
                    "Thanks for logging this. Should we optimize the sidebar note hierarchy for desktop first (where the panel is docked), or do you need mobile/tablet fixed before the next release candidate?",
                    daysAgo(1),
                    "additional_question",
                    {
                        case_ids: [CASE.question],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-sidebar-note", "item", 160),
        }),

        seedFeedback("edgecase-seed-open-suggested-with-question", {
            report_id: "edge-flex-toolbar",
            report_type: "group",
            cases: [
                createReportCase(
                    "Toolbar chips wrap onto a second row when the panel is narrow, but the ghost link stays on the first row alone. The layout jump feels jarring during panel resize.",
                ),
            ],
            field_values: fields(
                "Happens consistently when the feedback panel is docked on the right at ~360px width. Screen recording attached in the internal drive folder.",
            ),
            replies: [
                reply(
                    "edgecase-reply-flex-suggested",
                    "Applied `flex-wrap: nowrap` on the toolbar container and set a shared `min-width` on all chips so they scale down together. The ghost link now stays in the same row as the action chips down to 320px.",
                    daysAgo(3),
                    "suggested",
                    {
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-flex-question",
                    "That helps the wrap issue — but does forcing nowrap mean the ghost link loses its underline affordance on hover? I want to make sure we didn't trade layout stability for interaction clarity.",
                    daysAgo(2),
                    "additional_question",
                    {
                        parent_reply_id: "edgecase-reply-flex-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-toolbar", "group", 200, 0.55),
        }),

        seedFeedback("edgecase-seed-open-found-error", {
            report_id: "edge-flex-btn-primary",
            report_type: "item",
            cases: [
                createReportCase(
                    "Primary chip still overlaps the secondary chip at 320px width even after the nowrap patch. The overlap is roughly 12px and blocks the secondary tap target.",
                ),
            ],
            field_values: fields(
                "I verified on BrowserStack with iPhone SE dimensions. William's earlier fix improved wider breakpoints but this edge case remains.",
                { isBug: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-found-error",
                    "Re-tested after the nowrap change and the overlap is still there on 320px — the primary chip's padding pushes into the secondary button's hit area. Attaching a screenshot with the overlap highlighted in red.",
                    daysAgo(1),
                    "found_error",
                    {
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-btn-primary", "item", 220, 0.58),
        }),

        seedFeedback("edgecase-seed-open-found-error-branch", {
            report_id: "edge-flex-nested",
            report_type: "group",
            cases: [
                createReportCase(
                    "Nested flex row loses vertical alignment between the tagged chip and the untagged note. The note baseline drops 4px below the chip center at certain zoom levels.",
                ),
            ],
            field_values: fields(
                "This is the most complex layout on the page — flex inside flex with mixed tagged/untagged children. Worth exercising the full review thread UI.",
                { isBug: true, isImportant: true },
            ),
            replies: [
                reply(
                    "edgecase-reply-branch-suggested",
                    "First pass: set `align-items: center` on the nested row and removed the extra bottom margin from the note span. Should center both elements on the cross axis.",
                    daysAgo(4),
                    "suggested",
                    {
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-branch-question",
                    "Quick question before I sign off — should the untagged note stay baseline-aligned with body copy elsewhere on the page, or is vertical centering against the chip the intended spec?",
                    daysAgo(3),
                    "additional_question",
                    {
                        parent_reply_id: "edgecase-reply-branch-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-branch-resuggested",
                    "Emma confirmed center alignment for chip pairs like this. I re-applied the fix on the chip container only so body copy elsewhere keeps its existing baseline rhythm.",
                    daysAgo(2),
                    "suggested",
                    {
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-branch-found-error",
                    "The chip aligns now, but the note still drops on Firefox at 110% zoom. Chrome and Safari look correct. Seems like a sub-pixel rounding issue on the flex line.",
                    daysAgo(1),
                    "found_error",
                    {
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                reply(
                    "edgecase-reply-branch-followup-question",
                    "Can you share a screenshot at 320px width with the Firefox zoom at 110%? I want to compare sub-pixel values against the Chrome rendering before trying a `line-height` adjustment.",
                    daysAgo(0),
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

        seedFeedback("edgecase-seed-open-recheck-requested", {
            report_id: "edge-flex-nested-chip",
            report_type: "item",
            cases: [
                createReportCase(
                    "Tagged chip border radius reads as 6px in the browser but the design token file specifies 8px. Need confirmation whether this is intentional platform rounding.",
                ),
            ],
            field_values: fields(
                "Emma checked Figma and the component spec shows 8px. Browser devtools report computed `border-radius: 6px` from a legacy utility class.",
            ),
            replies: [
                reply(
                    "edgecase-reply-recheck",
                    "I traced this to the shared chip utility — it intentionally maps to 6px on dense toolbars to match the compact density scale. Not a bug; the Figma component is the spacious variant. Happy to add a comment in code if that helps future QA passes.",
                    daysAgo(1),
                    "recheck_requested",
                    {
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-nested-chip", "item", 280, 0.64),
        }),

        seedFeedback("edgecase-seed-open-recheck-with-response", {
            report_id: "edge-flex-stack-title",
            report_type: "item",
            cases: [
                createReportCase(
                    "Stack title font weight looks heavier than the spec — visually closer to 700 than the documented 600 semibold token.",
                ),
            ],
            field_values: fields(
                "Comparison screenshot uploaded next to the Figma side-by-side. Only noticeable on Retina displays.",
            ),
            replies: [
                reply(
                    "edgecase-reply-recheck-root",
                    "The title uses the `font-weight: 600` token which maps to 600 on Windows but can render heavier on macOS subpixel antialiasing. Design signed off on this cross-platform behavior last quarter.",
                    daysAgo(2),
                    "recheck_requested",
                    {
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                reply(
                    "edgecase-reply-recheck-followup",
                    "Understood — I still reduced the title to weight 500 in this compact stack context so it visually matches adjacent body text hierarchy. Please confirm the lighter weight works for both light and dark themes.",
                    daysAgo(1),
                    "suggested",
                    {
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-stack-title", "item", 300, 0.66),
        }),

        seedFeedback("edgecase-seed-open-reply-resolved", {
            report_id: "edge-grid-dashboard",
            report_type: "group",
            cases: [
                createReportCase(
                    "Dashboard grid gap collapses from 16px to 4px on tablet breakpoints, causing the tagged and untagged cells to visually merge.",
                    { id: CASE.resolvedOnly, status: "resolved" },
                ),
            ],
            field_values: fields(
                "Tablet repro at 768px. William's grid template change should address this — tracking verification here.",
            ),
            replies: [
                reply(
                    "edgecase-reply-case-resolved-suggested",
                    "Updated the md breakpoint grid to keep a 12px minimum gap and added `gap` fallback for browsers without subgrid support. Cells should no longer touch at 768px.",
                    daysAgo(2),
                    "suggested",
                    {
                        case_ids: [CASE.resolvedOnly],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-case-resolved-final",
                    "Verified on iPad Air and Surface Pro viewports — gap holds at 12px and cell borders remain distinct. Marking this case resolved.",
                    daysAgo(1),
                    "resolved",
                    {
                        case_ids: [CASE.resolvedOnly],
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-dashboard", "group", 340, 0.72),
        }),

        seedFeedback("edgecase-seed-git-issued", {
            report_id: "edge-grid-cell-a",
            report_type: "item",
            status: "git_issued",
            cases: [
                createReportCase(
                    "Cell A focus ring is too faint for keyboard navigation — the outline disappears against the teal cell background in both light and dark themes.",
                ),
            ],
            field_values: fields(
                "Accessibility audit item. Tracking in GitHub for eng follow-up since this needs a shared token change across grid cells.",
                { isBug: true, isImportant: true },
            ),
            integrations: {
                github: {
                    issue_number: 4821,
                    issue_url: "https://github.com/kimsangjunv1/fivepixels/issues/4821",
                    issued_at: daysAgo(1),
                },
            },
            replies: [
                reply(
                    "edgecase-reply-git-system",
                    "GitHub issue #4821 was created and linked to this feedback. The engineering ticket includes the focus ring token proposal from the a11y review.",
                    daysAgo(1),
                    "suggested",
                    {
                        author_type: "system",
                        author_name: null,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-cell-a", "item", 360, 0.74),
        }),

        seedFeedback("edgecase-seed-feedback-resolved", {
            report_id: "edge-grid-cell-span",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase(
                    "Span cell label wraps correctly now after the grid-column fix — long labels break across two lines instead of overflowing the cell boundary.",
                    { status: "resolved" },
                ),
            ],
            field_values: fields(
                "Closed after cross-browser verification. Keeping as a resolved-state sample for the feedback list filters.",
            ),
            replies: [
                reply(
                    "edgecase-reply-feedback-resolved",
                    "Confirmed in Safari 17, Chrome 124, and Firefox 125 at multiple viewport widths. Label wrapping behaves consistently and no longer clips the descenders on the second line.",
                    daysAgo(2),
                    "resolved",
                    {
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-cell-span", "item", 380, 0.76),
        }),

        seedFeedback("edgecase-seed-archived", {
            report_id: "edge-grid-nested-flex",
            report_type: "group",
            status: "archived",
            cases: [
                createReportCase(
                    "Archived sample — nested flex caption spacing was adjusted pre-release and is no longer actionable.",
                    { status: "resolved" },
                ),
            ],
            field_values: fields(
                "Historical record from the 1.0 release cycle. Demonstrates archived read-only UI.",
            ),
            replies: [
                reply(
                    "edgecase-reply-archived",
                    "Caption spacing matched the spec after Emma's token update. Archived following the 1.0 release sign-off — no further action expected.",
                    daysAgo(10),
                    "resolved",
                    {
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-nested-flex", "group", 400, 0.78),
        }),

        seedFeedback("edgecase-seed-case-scoped-threads", {
            report_id: "edge-grid-nested-pill",
            report_type: "item",
            cases: [
                createReportCase(
                    "Pill min-width is too small — Korean locale labels clip after three characters.",
                    { id: CASE.threadA, assignee_name: TEAM.william },
                ),
                createReportCase(
                    "Caption should truncate with ellipsis instead of wrapping to a second line and pushing the pill row height.",
                    { id: CASE.threadB, assignee_name: TEAM.emma },
                ),
            ],
            field_values: fields(
                "Two independent cases on the same element group — each should show its own thread timeline in View mode.",
            ),
            replies: [
                reply(
                    "edgecase-reply-thread-a",
                    "Increased pill `min-width` to 72px and added horizontal padding so three-character Korean labels fit without clipping. English labels unaffected.",
                    daysAgo(2),
                    "suggested",
                    {
                        case_ids: [CASE.threadA],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-thread-b",
                    "Applied `text-overflow: ellipsis` and `white-space: nowrap` on the caption span. The pill row height stays fixed at 32px even with long captions.",
                    daysAgo(1),
                    "suggested",
                    {
                        case_ids: [CASE.threadB],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("edge-grid-nested-pill", "item", 420, 0.8),
        }),

        untaggedFeedback("edgecase-seed-untagged-grid-card", secondaryLinkSelector, {
            cases: [
                createReportCase(
                    "Untagged card picked via CSS selector only — no data-report-id on this element. Verifies selector-based marker restoration after page reload.",
                ),
            ],
            field_values: fields(
                "This feedback targets the Secondary link card using a generated CSS selector. Useful for testing pick-mode on elements without explicit report IDs.",
            ),
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
                    "Untagged flex chip tap target is smaller than the 44px minimum — the visible chip is 36px but padding doesn't extend the hit area.",
                ),
            ],
            field_values: fields(
                "Selector-based target inside the flex toolbar. The secondary chip has no data-report-id so this exercises the auto-pick + selector path.",
            ),
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
                    "Untagged grid cell B text contrast ratio is 3.8:1 against the cell background — below the 4.5:1 AA requirement for body text.",
                ),
            ],
            field_values: fields(
                "Cell B has no report ID. Emma flagged the contrast during the design QA pass on the grid layout section.",
                { isBug: true },
            ),
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
                    "Detached marker — the original CSS selector no longer resolves after a DOM refactor. The marker should fall back to stored coordinates.",
                ),
            ],
            field_values: fields(
                "Simulates stale selector data. The marker renders at the saved coordinate position even though the target element was removed from the page.",
            ),
            position: coordinatePosition(0.18, 0.42, 500),
        }),

        seedFeedback("edgecase-seed-fields-all-checkboxes", {
            report_id: createAutoPickReportId(".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(5)"),
            report_type: "item",
            target_selector: ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(5)",
            cases: [
                createReportCase(
                    "Staged feedback metric card is missing the delta indicator arrow — the card shows the count but not whether it increased or decreased vs. last week.",
                ),
            ],
            field_values: fields(
                "Flagged as both a bug and important because the metric is used in the weekly QA summary email. Sophia needs this fixed before Friday's report.",
                { isBug: true, isImportant: true },
            ),
            position: coordinatePosition(0.55, 0.33, 70),
        }),

        seedFeedback("edgecase-seed-author-metadata", {
            report_id: createAutoPickReportId(".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(6)"),
            report_type: "item",
            target_selector: ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(6)",
            author_id: "demo-user",
            author_name: TEAM.user,
            cases: [
                createReportCase(
                    "Warning banner icon sits 2px below the first line of text instead of aligning to the cap height. Most visible when the banner wraps to two lines.",
                ),
            ],
            field_values: fields(
                "Logged by Alex during the warning banner review. Author metadata is explicit on this item to test author display in the thread header.",
            ),
            position: coordinatePosition(0.72, 0.36, 90),
        }),

        seedFeedback("edgecase-seed-open-empty-case-actions", {
            report_id: createAutoPickReportId(".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(8)"),
            report_type: "item",
            target_selector: ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(8)",
            cases: [
                createReportCase(
                    "Submit action disabled state has no accessible label — screen readers announce only 'button' without indicating the disabled reason.",
                    { id: "edgecase-case-empty-a" },
                ),
                createReportCase(
                    "Cancel affordance is unclear — the text link style matches body copy and users don't recognize it as an interactive element.",
                    { id: "edgecase-case-empty-b" },
                ),
            ],
            replies: [],
            field_values: fields(
                "Two open cases with no replies yet — exercises per-case entry actions and the 'issue apply' display state before any review activity.",
            ),
            position: coordinatePosition(0.28, 0.48, 130),
        }),

        seedFeedback("edgecase-seed-open-assignee-events", {
            report_id: createAutoPickReportId(".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(11)"),
            report_type: "item",
            target_selector: ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(11)",
            cases: [
                createReportCase(
                    "Tooltip arrow is clipped by the parent overflow container on the settings panel — the pointer tip disappears when the tooltip is anchored to the right edge.",
                    { id: "edgecase-case-assigned-only", assignee_name: TEAM.william },
                ),
                createReportCase(
                    "Keyboard focus ring on the segmented control is hidden behind the sticky header when navigating with Tab.",
                    { id: "edgecase-case-transferred", assignee_name: TEAM.emma },
                ),
            ],
            replies: [
                reply(
                    "edgecase-reply-assignee-assigned-only",
                    "An assignee has been assigned.",
                    daysAgo(2),
                    "assignee_assigned",
                    {
                        case_ids: ["edgecase-case-assigned-only"],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-assignee-assigned-transfer",
                    "An assignee has been assigned.",
                    daysAgo(1),
                    "assignee_assigned",
                    {
                        case_ids: ["edgecase-case-transferred"],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                reply(
                    "edgecase-reply-assignee-transferred",
                    "The assignee has been changed.",
                    daysAgo(0),
                    "assignee_transferred",
                    {
                        case_ids: ["edgecase-case-transferred"],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            field_values: fields(
                "Assignee claim and transfer timeline events — exercises assignee_assigned and assignee_transferred display states.",
            ),
            position: coordinatePosition(0.42, 0.62, 170),
        }),

        seedFeedback("edgecase-seed-multi-question-thread", {
            report_id: createAutoPickReportId(".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(10)"),
            report_type: "item",
            target_selector: ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(10)",
            cases: [
                createReportCase(
                    "Footer hint overlaps the next section by roughly 16px on scroll, creating a visual collision with the layout demos below.",
                    { id: "edgecase-case-questions" },
                ),
            ],
            replies: [
                reply(
                    "edgecase-reply-q1",
                    "I can reproduce the overlap at 1280px width but not at 1440px. Which viewport width and browser were you using when you saw the 16px collision?",
                    daysAgo(2),
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
                    "Follow-up — does this overlap happen only in dark mode? The footer hint background token differs between themes and I want to rule out a color-contrast illusion before adjusting spacing.",
                    daysAgo(1),
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
                "Multiple open questions on a single case from different reviewers — tests question group expansion and multi-author thread display.",
            ),
            position: coordinatePosition(0.82, 0.52, 150),
        }),
    ];
}

export const EDGECASE_FEEDBACK_SEED_IDS = createEdgecaseFeedbackSeed().map((item) => item.id);
