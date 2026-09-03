import type { ReportFeedback } from "@/shared/types/report.js";
import { EDGECASE_PATHNAME } from "./reportProjectScope.js";
import {
    anchorPosition,
    buildSeedFeedback,
    coordinatePosition,
    createReportCase,
    daysAgo,
    hoursAgo,
    ISSUE_ROOT_PARENT_ID,
    seedFields,
    seedReply,
    SEED_TEAM,
    todayIso,
    untaggedSeedFeedback,
    type DemoSeedCatalogEntry,
} from "./seedShared.js";

const TEAM = SEED_TEAM;

const CASE = {
    wait: "edgecase-case-wait",
    happy: "edgecase-case-happy",
    denyApprove: "edgecase-case-deny-approve",
    denyOfDeny: "edgecase-case-deny-of-deny",
    denyOpen: "edgecase-case-deny-open",
    recheckFirst: "edgecase-case-recheck-first",
    longQa: "edgecase-case-long-qa",
    stuckError: "edgecase-case-stuck-error",
    stuckRecheck: "edgecase-case-stuck-recheck",
    suggestedPending: "edgecase-case-suggested-pending",
    threadA: "edgecase-case-thread-a",
    threadB: "edgecase-case-thread-b",
    threadC: "edgecase-case-thread-c",
    transferFight: "edgecase-case-transfer-fight",
    mention: "edgecase-case-mention",
    gitOpen: "edgecase-case-git-open",
    gitDone: "edgecase-case-git-done",
    fourA: "edgecase-case-four-a",
    fourB: "edgecase-case-four-b",
    fourC: "edgecase-case-four-c",
    fourD: "edgecase-case-four-d",
    sixA: "edgecase-case-six-a",
    sixB: "edgecase-case-six-b",
    sixC: "edgecase-case-six-c",
    sixD: "edgecase-case-six-d",
    sixE: "edgecase-case-six-e",
    sixF: "edgecase-case-six-f",
    eightA: "edgecase-case-eight-a",
    eightB: "edgecase-case-eight-b",
    eightC: "edgecase-case-eight-c",
    eightD: "edgecase-case-eight-d",
    eightE: "edgecase-case-eight-e",
    eightF: "edgecase-case-eight-f",
    eightG: "edgecase-case-eight-g",
    eightH: "edgecase-case-eight-h",
} as const;

const PRIMARY_CTA_MENTION = {
    id: "m_edge_primary_cta",
    label: "Primary CTA",
    targetSelector: null,
    reportId: "edge-primary-cta",
    suggestedReportId: null,
};

const FLEX_CHIP_MENTION = {
    id: "m_edge_flex_chip",
    label: "Nested chip",
    targetSelector: null,
    reportId: "edge-flex-nested-chip",
    suggestedReportId: null,
};

function seed(id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) {
    return buildSeedFeedback(id, EDGECASE_PATHNAME, overrides);
}

function untagged(id: string, selector: string, overrides: Parameters<typeof untaggedSeedFeedback>[3]) {
    return untaggedSeedFeedback(id, EDGECASE_PATHNAME, selector, overrides);
}

export function createEdgecaseFeedbackSeed(): ReportFeedback[] {
    const secondaryLinkSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(3)";
    const flexSecondarySelector = ".pulse-edgecase-flex-toolbar > button.pulse-edgecase-flex-chip--untagged";
    const gridCellBSelector = ".pulse-edgecase-grid-board .pulse-edgecase-grid-cell--untagged:nth-child(2)";
    const missingSelector = ".edgecase-seed-missing-target";
    const stagedMetricSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(5)";
    const warningBannerSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(6)";
    const submitActionSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(8)";
    const footerHintSelector = ".pulse-edgecase-grid > article.pulse-edgecase-card--untagged:nth-child(10)";

    return [
        seed("edgecase-seed-open-currently-wait", {
            report_id: "edge-hero-banner",
            report_type: "group",
            cases: [
                createReportCase(
                    "On viewports below 768px the hero headline and supporting copy no longer share the same left edge.",
                    { id: CASE.wait },
                ),
            ],
            field_values: seedFields("[currently_wait] 답글 없음 · 초기 접수 상태"),
            position: anchorPosition("edge-hero-banner", "group", 0, 0.22),
            created_at: todayIso(),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seed("edgecase-seed-story-happy-path-resolved", {
            report_id: "edge-primary-cta",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("Primary CTA label wraps to two lines on Korean locale builds.", {
                    id: CASE.happy,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                    previous_assignee_name: TEAM.qa,
                }),
            ],
            field_values: seedFields("[happy-path] 담당→질문→제안→승인 완주", { isImportant: true }),
            replies: [
                seedReply("edgecase-reply-happy-assigned", "An assignee has been assigned.", daysAgo(6, 9), "assignee_assigned", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply("edgecase-reply-happy-transferred", "The assignee has been changed.", daysAgo(6, 11), "assignee_transferred", {
                    case_ids: [CASE.happy],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply(
                    "edgecase-reply-happy-q1",
                    "Korean/Japanese만 wrap인지, German도 wrap인지 확인 부탁드립니다.",
                    daysAgo(5, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "edgecase-reply-happy-a1",
                    "KO/JA만 wrap. min-width 확장으로 해결 희망.",
                    daysAgo(5, 14),
                    "additional_question",
                    {
                        case_ids: [CASE.happy],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                seedReply(
                    "edgecase-reply-happy-suggested",
                    "CTA min-width 168px 적용. iPhone SE + Pixel 7 확인 부탁.",
                    daysAgo(4, 12),
                    "suggested",
                    {
                        case_ids: [CASE.happy],
                        author_type: "manager",
                        author_name: TEAM.frontend,
                    },
                ),
                seedReply(
                    "edgecase-reply-happy-resolved",
                    "320–414px 확인 완료. resolved 처리.",
                    daysAgo(2, 16),
                    "resolved",
                    {
                        case_ids: [CASE.happy],
                        author_type: "manager",
                        author_name: TEAM.qa,
                    },
                ),
            ],
            position: anchorPosition("edge-primary-cta", "item", 40, 0.28),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seed("edgecase-seed-story-deny-then-approve", {
            report_id: "edge-metric-open",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("Open-issues metric card still uses neutral gray accent.", {
                    id: CASE.denyApprove,
                    status: "resolved",
                    assignee_name: TEAM.backend,
                }),
            ],
            field_values: seedFields("[deny→approve] suggested → found_error → suggested → resolved"),
            replies: [
                seedReply(
                    "edgecase-reply-deny-s1",
                    "metric accent를 semantic.warning으로 교체.",
                    daysAgo(5, 10),
                    "suggested",
                    { case_ids: [CASE.denyApprove], author_type: "manager", author_name: TEAM.backend },
                ),
                seedReply(
                    "edgecase-reply-deny-fe",
                    "dark mode에서 warning token 미적용. 거절.",
                    daysAgo(4, 12),
                    "found_error",
                    { case_ids: [CASE.denyApprove], author_type: "user", author_name: TEAM.user },
                ),
                seedReply(
                    "edgecase-reply-deny-s2",
                    "dark theme fill/stroke 토큰 수정.",
                    daysAgo(3, 11),
                    "suggested",
                    { case_ids: [CASE.denyApprove], author_type: "manager", author_name: TEAM.backend },
                ),
                seedReply(
                    "edgecase-reply-deny-resolved",
                    "양 테마 확인. 승인 및 resolved.",
                    daysAgo(2, 14),
                    "resolved",
                    { case_ids: [CASE.denyApprove], author_type: "manager", author_name: TEAM.qa },
                ),
            ],
            position: anchorPosition("edge-metric-open", "item", 80),
        }),

        seed("edgecase-seed-story-deny-of-deny", {
            report_id: "edge-search-field",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("Filter input placeholder truncates on mobile.", {
                    id: CASE.denyOfDeny,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[거절의 거절] deny↔recheck 왕복 후 해결", { isBug: true }),
            replies: [
                seedReply("edgecase-reply-dod-s1", "flex shrink 제거.", daysAgo(7, 9), "suggested", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-dod-f1", "Safari에서 여전히 truncate.", daysAgo(6, 11), "found_error", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("edgecase-reply-dod-r1", "390px에서는 정상 — 오류 아님 주장.", daysAgo(5, 13), "recheck_requested", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-dod-f2", "기본 Safari 설정에서도 재현. 재거절.", daysAgo(4, 10), "found_error", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("edgecase-reply-dod-s2", "min-width:0 override + placeholder 단축.", daysAgo(3, 12), "suggested", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-dod-resolved", "Safari/Android 확인. resolved.", daysAgo(2, 15), "resolved", {
                    case_ids: [CASE.denyOfDeny],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("edge-search-field", "item", 120),
        }),

        seed("edgecase-seed-story-deny-of-deny-open", {
            report_id: "edge-grid-cell-span",
            report_type: "item",
            cases: [
                createReportCase("Span cell label clips descenders on the second line.", {
                    id: CASE.denyOpen,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[거절의 거절 · open] recheck 후 재거절로 멈춤", { isBug: true }),
            replies: [
                seedReply("edgecase-reply-deny-open-s1", "line-height 증가.", daysAgo(4, 9), "suggested", {
                    case_ids: [CASE.denyOpen],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-deny-open-f1", "Firefox 110% zoom에서 clip.", daysAgo(3, 11), "found_error", {
                    case_ids: [CASE.denyOpen],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("edgecase-reply-deny-open-r1", "110% zoom는 known issue — 오류 아님.", daysAgo(2, 13), "recheck_requested", {
                    case_ids: [CASE.denyOpen],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-deny-open-f2", "제품 요구사항상 visible 필요. 재거절.", daysAgo(1, 10), "found_error", {
                    case_ids: [CASE.denyOpen],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
            ],
            position: anchorPosition("edge-grid-cell-span", "item", 380, 0.76),
        }),

        seed("edgecase-seed-story-recheck-first", {
            report_id: "edge-sidebar-note",
            report_type: "item",
            cases: [
                createReportCase("Sidebar note typography hierarchy is flat.", {
                    id: CASE.recheckFirst,
                    assignee_name: TEAM.backend,
                }),
            ],
            field_values: seedFields("[recheck-first] 담당 직후 recheck_requested"),
            replies: [
                seedReply("edgecase-reply-recheck-assigned", "An assignee has been assigned.", daysAgo(2, 9), "assignee_assigned", {
                    case_ids: [CASE.recheckFirst],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply(
                    "edgecase-reply-recheck-root",
                    "의도된 flat hierarchy — 오류 아님.",
                    daysAgo(1, 14),
                    "recheck_requested",
                    { case_ids: [CASE.recheckFirst], author_type: "manager", author_name: TEAM.backend },
                ),
            ],
            position: anchorPosition("edge-sidebar-note", "item", 160),
        }),

        seed("edgecase-seed-story-long-qa-then-resolve", {
            report_id: "edge-flex-toolbar",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("Toolbar chips wrap but ghost link stays alone on row 1.", {
                    id: CASE.longQa,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[long-qa→resolve] 다중 질문 + 브랜치 질문"),
            replies: [
                seedReply(
                    "edgecase-reply-long-q1",
                    "360 docked vs 320 overlay 중 우선순위?",
                    daysAgo(8, 9),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.qa,
                    },
                ),
                seedReply(
                    "edgecase-reply-long-q2",
                    "ghost link도 chip과 같은 min-width?",
                    daysAgo(8, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
                seedReply(
                    "edgecase-reply-long-a",
                    "360 docked 우선. ghost link min-width 공유.",
                    daysAgo(7, 10),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                seedReply(
                    "edgecase-reply-long-suggested",
                    "nowrap + shared min-width 적용.",
                    daysAgo(6, 12),
                    "suggested",
                    { case_ids: [CASE.longQa], author_type: "manager", author_name: TEAM.frontend },
                ),
                seedReply(
                    "edgecase-reply-long-branch-q",
                    "nowrap 시 hover underline 유지?",
                    daysAgo(5, 13),
                    "additional_question",
                    {
                        case_ids: [CASE.longQa],
                        parent_reply_id: "edgecase-reply-long-suggested",
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                seedReply(
                    "edgecase-reply-long-resolved",
                    "320/360/414 확인. resolved.",
                    daysAgo(3, 16),
                    "resolved",
                    { case_ids: [CASE.longQa], author_type: "manager", author_name: TEAM.qa },
                ),
            ],
            position: anchorPosition("edge-flex-toolbar", "group", 200, 0.55),
        }),

        seed("edgecase-seed-story-stuck-found-error", {
            report_id: "edge-flex-btn-primary",
            report_type: "item",
            cases: [
                createReportCase("Primary chip overlaps secondary at 320px.", {
                    id: CASE.stuckError,
                    assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[stuck found_error] 거절로 멈춤", { isBug: true }),
            replies: [
                seedReply(
                    "edgecase-reply-stuck-suggested",
                    "chip padding 2px 축소.",
                    daysAgo(2, 10),
                    "suggested",
                    { case_ids: [CASE.stuckError], author_type: "manager", author_name: TEAM.frontend },
                ),
                seedReply(
                    "edgecase-reply-stuck-found",
                    "SE에서 ~12px overlap. tap target 충돌. 거절.",
                    hoursAgo(6),
                    "found_error",
                    { case_ids: [CASE.stuckError], author_type: "user", author_name: TEAM.user },
                ),
            ],
            position: anchorPosition("edge-flex-btn-primary", "item", 220, 0.58),
        }),

        seed("edgecase-seed-story-stuck-recheck", {
            report_id: "edge-flex-nested-chip",
            report_type: "item",
            cases: [
                createReportCase("Chip border radius 6px vs design token 8px.", {
                    id: CASE.stuckRecheck,
                    assignee_name: TEAM.backend,
                }),
            ],
            field_values: seedFields("[stuck recheck] recheck_requested 대기"),
            replies: [
                seedReply(
                    "edgecase-reply-stuck-recheck",
                    "dense toolbar variant는 6px 의도 — 오류 아님.",
                    daysAgo(1, 11),
                    "recheck_requested",
                    { case_ids: [CASE.stuckRecheck], author_type: "manager", author_name: TEAM.backend },
                ),
            ],
            position: anchorPosition("edge-flex-nested-chip", "item", 280, 0.64),
        }),

        seed("edgecase-seed-open-suggested-pending", {
            report_id: "edge-flex-stack-title",
            report_type: "item",
            cases: [
                createReportCase("Stack title font weight looks heavier than 600 semibold.", { id: CASE.suggestedPending }),
            ],
            field_values: seedFields("[suggested pending] 확인 요청 대기"),
            replies: [
                seedReply(
                    "edgecase-reply-suggested-pending",
                    "font-weight 500으로 조정. 양 테마 확인 부탁.",
                    daysAgo(1, 10),
                    "suggested",
                    {
                        case_ids: [CASE.suggestedPending],
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
            ],
            position: anchorPosition("edge-flex-stack-title", "item", 300, 0.66),
        }),

        seed("edgecase-seed-open-multicase-diverged", {
            report_id: "edge-grid-nested-pill",
            report_type: "item",
            cases: [
                createReportCase("Pill min-width too small — KO labels clip.", {
                    id: CASE.threadA,
                    status: "resolved",
                    assignee_name: TEAM.frontend,
                }),
                createReportCase("Caption should truncate with ellipsis.", {
                    id: CASE.threadB,
                    assignee_name: TEAM.backend,
                }),
                createReportCase("Hover outline disappears on teal background.", {
                    id: CASE.threadC,
                    assignee_name: TEAM.qa,
                }),
            ],
            field_values: seedFields("[multi-case · 3] 케이스별 다른 진행 상태", { isImportant: true }),
            replies: [
                seedReply("edgecase-reply-div-a-resolved", "KO/EN 확인. case A resolved.", daysAgo(3, 12), "resolved", {
                    case_ids: [CASE.threadA],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply("edgecase-reply-div-b-suggested", "ellipsis + nowrap 적용.", daysAgo(2, 11), "suggested", {
                    case_ids: [CASE.threadB],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-div-c-found", "dark mode outline 미표시. 거절.", daysAgo(1, 9), "found_error", {
                    case_ids: [CASE.threadC],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
            ],
            position: anchorPosition("edge-grid-nested-pill", "item", 420, 0.8),
        }),

        seed("edgecase-seed-four-case-progress", {
            report_id: "edge-flex-nested",
            report_type: "group",
            cases: [
                createReportCase("Nested row vertical alignment off by 2px.", { id: CASE.fourA, assignee_name: TEAM.frontend }),
                createReportCase("Chip focus ring contrast below AA.", { id: CASE.fourB, assignee_name: TEAM.backend }),
                createReportCase("Note text wraps before chip on narrow panels.", { id: CASE.fourC }),
                createReportCase("Hover state missing on untagged note.", { id: CASE.fourD, status: "resolved", assignee_name: TEAM.qa }),
            ],
            field_values: seedFields("[four-case · 4] 4개 케이스 혼합 진행"),
            replies: [
                seedReply("edgecase-reply-four-a-q", "baseline vs center?", daysAgo(3, 9), "additional_question", {
                    case_ids: [CASE.fourA],
                    parent_reply_id: ISSUE_ROOT_PARENT_ID,
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-four-b-s", "outline token 교체.", daysAgo(2, 11), "suggested", {
                    case_ids: [CASE.fourB],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-four-d-r", "hover 추가 확인. resolved.", daysAgo(1, 14), "resolved", {
                    case_ids: [CASE.fourD],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("edge-flex-nested", "group", 260, 0.62),
        }),

        seed("edgecase-seed-six-case-review", {
            report_id: "edge-grid-nested-flex",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("Caption spacing drifts below chip center.", {
                    id: CASE.sixA,
                    status: "resolved",
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
                createReportCase("Pill label baseline misaligned.", { id: CASE.sixB, status: "resolved", assignee_name: TEAM.frontend }),
                createReportCase("Grid cell padding inconsistent.", { id: CASE.sixC, assignee_name: TEAM.qa }),
                createReportCase("Nested flex gap too tight at 320px.", { id: CASE.sixD }),
                createReportCase("Caption color token wrong in dark mode.", { id: CASE.sixE, assignee_name: TEAM.backend }),
                createReportCase("Touch target on pill below 44px.", { id: CASE.sixF, status: "resolved", assignee_name: TEAM.frontend }),
            ],
            field_values: seedFields("[six-case · 6] 대규모 멀티케이스 리뷰", { isBug: true }),
            replies: [
                seedReply("edgecase-reply-six-transfer", "The assignee has been changed.", daysAgo(5, 10), "assignee_transferred", {
                    case_ids: [CASE.sixA],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-six-a-resolved", "align-items:center 적용. resolved.", daysAgo(4, 12), "resolved", {
                    case_ids: [CASE.sixA, CASE.sixB, CASE.sixF],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-six-c-s", "padding token 통일.", daysAgo(3, 11), "suggested", {
                    case_ids: [CASE.sixC],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
                seedReply("edgecase-reply-six-e-fe", "dark mode caption color 미반영. 거절.", daysAgo(2, 9), "found_error", {
                    case_ids: [CASE.sixE],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
            ],
            position: anchorPosition("edge-grid-nested-flex", "group", 400, 0.78),
        }),

        seed("edgecase-seed-eight-case-sprint", {
            report_id: "edge-grid-dashboard",
            report_type: "group",
            cases: [
                createReportCase("Grid gap collapses at tablet breakpoint.", { id: CASE.eightA, assignee_name: TEAM.frontend }),
                createReportCase("Cell A focus ring too faint.", { id: CASE.eightB, assignee_name: TEAM.backend }),
                createReportCase("Span cell label overflow hidden.", { id: CASE.eightC }),
                createReportCase("Untagged cell B contrast low.", { id: CASE.eightD, assignee_name: TEAM.qa }),
                createReportCase("Dashboard title not announced to SR.", { id: CASE.eightE }),
                createReportCase("Cell hover state missing.", { id: CASE.eightF, status: "resolved", assignee_name: TEAM.frontend }),
                createReportCase("Grid min-height jumps on load.", { id: CASE.eightG, assignee_name: TEAM.backend }),
                createReportCase("Nested flex caption truncates early.", { id: CASE.eightH }),
            ],
            field_values: seedFields("[eight-case · 8] 최대 8케이스 스프린트 보드", { isImportant: true, isBug: true }),
            replies: [
                seedReply("edgecase-reply-eight-a-s", "md breakpoint gap 12px 유지.", daysAgo(4, 9), "suggested", {
                    case_ids: [CASE.eightA],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-eight-b-q", "teal 배경 대비 outline token?", daysAgo(4, 11), "additional_question", {
                    case_ids: [CASE.eightB],
                    parent_reply_id: ISSUE_ROOT_PARENT_ID,
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-eight-d-fe", "cell B contrast 3.8:1. 거절.", daysAgo(3, 10), "found_error", {
                    case_ids: [CASE.eightD],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("edgecase-reply-eight-f-r", "hover 추가. resolved.", daysAgo(2, 14), "resolved", {
                    case_ids: [CASE.eightF],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-eight-g-r", "min-height skeleton 적용.", daysAgo(1, 12), "recheck_requested", {
                    case_ids: [CASE.eightG],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
            ],
            position: anchorPosition("edge-grid-dashboard", "group", 340, 0.72),
        }),

        seed("edgecase-seed-story-transfer-then-fight", {
            report_id: "edge-grid-cell-a",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("Focus ring on cell A too faint.", {
                    id: CASE.transferFight,
                    status: "resolved",
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            field_values: seedFields("[transfer→fight→approve] 이관 후 deny→approve", { isBug: true }),
            replies: [
                seedReply("edgecase-reply-tf-assigned", "An assignee has been assigned.", daysAgo(6, 9), "assignee_assigned", {
                    case_ids: [CASE.transferFight],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-tf-transferred", "The assignee has been changed.", daysAgo(5, 10), "assignee_transferred", {
                    case_ids: [CASE.transferFight],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-tf-s1", "outline token 교체.", daysAgo(4, 12), "suggested", {
                    case_ids: [CASE.transferFight],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-tf-fe", "teal 배경에서 여전히 faint. 거절.", daysAgo(3, 14), "found_error", {
                    case_ids: [CASE.transferFight],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("edgecase-reply-tf-s2", "high-contrast outline 적용.", daysAgo(2, 11), "suggested", {
                    case_ids: [CASE.transferFight],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
                seedReply("edgecase-reply-tf-resolved", "확인 완료. resolved.", daysAgo(1, 15), "resolved", {
                    case_ids: [CASE.transferFight],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: anchorPosition("edge-grid-cell-a", "item", 360, 0.74),
        }),

        seed("edgecase-seed-open-with-mentions", {
            report_id: "edge-flex-btn-primary",
            report_type: "item",
            cases: [
                createReportCase(
                    `Compare focus ring with @{${PRIMARY_CTA_MENTION.id}} and @{${FLEX_CHIP_MENTION.id}}.`,
                    {
                        id: CASE.mention,
                        assignee_name: TEAM.frontend,
                        mentions: [PRIMARY_CTA_MENTION, FLEX_CHIP_MENTION],
                    },
                ),
            ],
            field_values: seedFields("[mentions] case/reply @mention", { isBug: true, isImportant: true }),
            replies: [
                seedReply(
                    "edgecase-reply-mention-s",
                    `Aligned with @{${PRIMARY_CTA_MENTION.id}} token.`,
                    daysAgo(1, 13),
                    "suggested",
                    {
                        case_ids: [CASE.mention],
                        author_type: "manager",
                        author_name: TEAM.frontend,
                        mentions: [PRIMARY_CTA_MENTION],
                    },
                ),
            ],
            position: anchorPosition("edge-flex-btn-primary", "item", 220, 0.58),
        }),

        untagged("edgecase-seed-git-issued", stagedMetricSelector, {
            status: "git_issued",
            cases: [
                createReportCase("Staged metric missing delta arrow.", { id: CASE.gitOpen, assignee_name: TEAM.frontend }),
                createReportCase("Weekly email shows stale count.", { id: CASE.gitDone, status: "resolved", assignee_name: TEAM.qa }),
            ],
            field_values: seedFields("[git_issued · 2] GitHub 연동 + 부분 해결", { isBug: true, isImportant: true }),
            integrations: {
                github: {
                    issue_number: 4821,
                    issue_url: "https://github.com/kimsangjunv1/fivepixels/issues/4821",
                    issued_at: daysAgo(1, 16),
                },
            },
            replies: [
                seedReply("edgecase-reply-git-system", "GitHub issue #4821 linked.", daysAgo(1, 16), "suggested", {
                    author_type: "system",
                    author_name: null,
                }),
                seedReply("edgecase-reply-git-resolved", "email count fixed. case resolved.", hoursAgo(5), "resolved", {
                    case_ids: [CASE.gitDone],
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: coordinatePosition(0.55, 0.33, 70),
        }),

        untagged("edgecase-seed-feedback-resolved", warningBannerSelector, {
            status: "resolved",
            author_id: "demo-user",
            author_name: TEAM.user,
            cases: [
                createReportCase("Warning banner icon misaligned to cap height.", { status: "resolved" }),
            ],
            field_values: seedFields("[resolved · 1] 피드백 전체 resolved"),
            replies: [
                seedReply("edgecase-reply-resolved", "icon cap height 정렬 확인.", daysAgo(2, 14), "resolved", {
                    author_type: "manager",
                    author_name: TEAM.qa,
                }),
            ],
            position: coordinatePosition(0.72, 0.36, 90),
        }),

        untagged("edgecase-seed-archived", submitActionSelector, {
            status: "archived",
            cases: [createReportCase("Archived submit action note from 1.0 cycle.", { status: "resolved" })],
            field_values: seedFields("[archived · 1] 읽기 전용"),
            replies: [
                seedReply("edgecase-reply-archived", "1.0 sign-off 후 archived.", daysAgo(10, 10), "resolved", {
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
            ],
            position: coordinatePosition(0.28, 0.48, 130),
        }),

        untagged("edgecase-seed-untagged-grid-card", secondaryLinkSelector, {
            cases: [createReportCase("Untagged card — selector-based marker restoration.")],
            field_values: seedFields("[untagged · 1] selector 타겟"),
            position: coordinatePosition(0.35, 0.4, 60),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        untagged("edgecase-seed-untagged-flex-chip", flexSecondarySelector, {
            cases: [createReportCase("Untagged flex chip tap target 36px — below 44px minimum.")],
            field_values: seedFields("[untagged flex · 1]"),
            position: coordinatePosition(0.42, 0.57, 210),
        }),

        untagged("edgecase-seed-untagged-grid-cell", gridCellBSelector, {
            cases: [createReportCase("Untagged cell B contrast 3.8:1 — below AA.")],
            field_values: seedFields("[untagged grid · 1]", { isBug: true }),
            position: coordinatePosition(0.62, 0.73, 350),
        }),

        untagged("edgecase-seed-detached-coordinates", missingSelector, {
            cases: [createReportCase("Detached marker — stale selector, coordinate fallback.")],
            field_values: seedFields("[detached · 1] 좌표 폴백"),
            position: coordinatePosition(0.18, 0.42, 500),
        }),

        seed("edgecase-seed-open-assignee-events", {
            report_id: "edge-sidebar-note",
            report_type: "item",
            cases: [
                createReportCase("Tooltip arrow clipped by overflow container.", {
                    id: "edgecase-case-assigned-only",
                    assignee_name: TEAM.frontend,
                }),
                createReportCase("Focus ring hidden behind sticky header.", {
                    id: "edgecase-case-transferred",
                    assignee_name: TEAM.backend,
                    previous_assignee_name: TEAM.frontend,
                }),
            ],
            replies: [
                seedReply("edgecase-reply-assignee-assigned", "An assignee has been assigned.", daysAgo(2, 10), "assignee_assigned", {
                    case_ids: ["edgecase-case-assigned-only"],
                    author_type: "manager",
                    author_name: TEAM.frontend,
                }),
                seedReply("edgecase-reply-assignee-transfer", "The assignee has been changed.", hoursAgo(8), "assignee_transferred", {
                    case_ids: ["edgecase-case-transferred"],
                    author_type: "manager",
                    author_name: TEAM.backend,
                }),
            ],
            field_values: seedFields("[assignee events · 2] claim + transfer"),
            position: anchorPosition("edge-sidebar-note", "item", 160),
        }),

        untagged("edgecase-seed-open-empty-case-actions", submitActionSelector, {
            cases: [
                createReportCase("Submit disabled state has no accessible label.", { id: "edgecase-case-empty-a" }),
                createReportCase("Cancel affordance unclear.", { id: "edgecase-case-empty-b" }),
            ],
            replies: [],
            field_values: seedFields("[issue_apply · 2] 답글 없음"),
            position: coordinatePosition(0.28, 0.48, 130),
        }),

        untagged("edgecase-seed-multi-question-thread", footerHintSelector, {
            cases: [createReportCase("Footer hint overlaps next section by ~16px.", { id: "edgecase-case-questions" })],
            replies: [
                seedReply(
                    "edgecase-reply-mq-q1",
                    "1280px에서만 재현? viewport/browser?",
                    daysAgo(2, 10),
                    "additional_question",
                    {
                        case_ids: ["edgecase-case-questions"],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.qa,
                    },
                ),
                seedReply(
                    "edgecase-reply-mq-q2",
                    "dark mode에서만?",
                    daysAgo(1, 12),
                    "additional_question",
                    {
                        case_ids: ["edgecase-case-questions"],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.backend,
                    },
                ),
            ],
            field_values: seedFields("[multi-question · 1] 다중 루트 질문"),
            position: coordinatePosition(0.82, 0.52, 150),
        }),
    ];
}

export const EDGECASE_FEEDBACK_SEED_IDS = createEdgecaseFeedbackSeed().map((item) => item.id);

export const EDGECASE_FEEDBACK_SEED_CATALOG: DemoSeedCatalogEntry[] = [
    { id: "edgecase-seed-open-currently-wait", label: "대기 (1)", summary: "답글 없음 · 초기 상태" },
    { id: "edgecase-seed-story-happy-path-resolved", label: "해피패스 (1)", summary: "담당→질문→제안→승인" },
    { id: "edgecase-seed-story-deny-then-approve", label: "거절 후 승인 (1)", summary: "found_error → re-suggest" },
    { id: "edgecase-seed-story-deny-of-deny", label: "거절의 거절 (1)", summary: "deny↔recheck 왕복 후 해결" },
    { id: "edgecase-seed-story-deny-of-deny-open", label: "거절의 거절 진행 (1)", summary: "recheck 후 재거절" },
    { id: "edgecase-seed-story-recheck-first", label: "오류 아님 (1)", summary: "recheck_requested 대기" },
    { id: "edgecase-seed-story-long-qa-then-resolve", label: "장문 Q&A (1)", summary: "다중 질문 후 해결" },
    { id: "edgecase-seed-story-stuck-found-error", label: "거절 멈춤 (1)", summary: "found_error attention" },
    { id: "edgecase-seed-story-stuck-recheck", label: "recheck 멈춤 (1)", summary: "recheck_requested" },
    { id: "edgecase-seed-open-suggested-pending", label: "확인 요청 (1)", summary: "suggested 대기" },
    { id: "edgecase-seed-open-multicase-diverged", label: "멀티케이스 (3)", summary: "케이스별 분기" },
    { id: "edgecase-seed-four-case-progress", label: "4케이스 (4)", summary: "혼합 진행" },
    { id: "edgecase-seed-six-case-review", label: "6케이스 (6)", summary: "대규모 리뷰" },
    { id: "edgecase-seed-eight-case-sprint", label: "8케이스 (8)", summary: "최대 케이스 스프린트" },
    { id: "edgecase-seed-story-transfer-then-fight", label: "이관 후 승인 (1)", summary: "transfer + deny" },
    { id: "edgecase-seed-open-with-mentions", label: "멘션 (1)", summary: "@element mention" },
    { id: "edgecase-seed-git-issued", label: "GitHub (2)", summary: "git_issued + 부분 해결" },
    { id: "edgecase-seed-feedback-resolved", label: "해결됨 (1)", summary: "resolved" },
    { id: "edgecase-seed-archived", label: "아카이브 (1)", summary: "archived" },
    { id: "edgecase-seed-untagged-grid-card", label: "Untagged (1)", summary: "selector" },
    { id: "edgecase-seed-untagged-flex-chip", label: "Untagged flex (1)", summary: "flex chip" },
    { id: "edgecase-seed-untagged-grid-cell", label: "Untagged grid (1)", summary: "grid cell" },
    { id: "edgecase-seed-detached-coordinates", label: "Detached (1)", summary: "좌표 폴백" },
    { id: "edgecase-seed-open-assignee-events", label: "담당 이벤트 (2)", summary: "assign / transfer" },
    { id: "edgecase-seed-open-empty-case-actions", label: "이슈 접수 (2)", summary: "issue_apply · 답글 없음" },
    { id: "edgecase-seed-multi-question-thread", label: "다중 질문 (1)", summary: "루트 질문 2개" },
];
