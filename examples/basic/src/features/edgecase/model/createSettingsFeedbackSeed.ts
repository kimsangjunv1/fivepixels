import type { ReportFeedback } from "@/types/report.js";
import { SETTINGS_PATHNAME } from "./reportProjectScope.js";
import {
    anchorPosition,
    buildSeedFeedback,
    createReportCase,
    daysAgo,
    hoursAgo,
    ISSUE_ROOT_PARENT_ID,
    seedFields,
    seedReply,
    SEED_TEAM,
    todayIso,
    type DemoSeedCatalogEntry,
} from "./seedShared.js";

const TEAM = SEED_TEAM;

const CASE = {
    opacityOverlayA: "settings-case-opacity-a",
    opacityOverlayB: "settings-case-opacity-b",
    opacityTarget: "settings-case-opacity-target",
    displayOverlay: "settings-case-display-overlay",
    conditionalA: "settings-case-conditional-a",
    conditionalB: "settings-case-conditional-b",
    conditionalC: "settings-case-conditional-c",
    visibilityTarget: "settings-case-visibility-target",
    offscreenA: "settings-case-offscreen-a",
    offscreenB: "settings-case-offscreen-b",
    zustandA: "settings-case-zustand-a",
    zustandB: "settings-case-zustand-b",
    zustandC: "settings-case-zustand-c",
    zustandD: "settings-case-zustand-d",
    conditionalTarget1: "settings-case-ct-1",
    conditionalTarget2: "settings-case-ct-2",
    conditionalTarget3: "settings-case-ct-3",
    conditionalTarget4: "settings-case-ct-4",
    conditionalTarget5: "settings-case-ct-5",
    conditionalTarget6: "settings-case-ct-6",
    conditionalTarget7: "settings-case-ct-7",
    conditionalTarget8: "settings-case-ct-8",
    displayDemoWait: "settings-case-display-wait",
    conditionalPageA: "settings-case-conditional-page-a",
    conditionalPageB: "settings-case-conditional-page-b",
    visibilityPage: "settings-case-visibility-page",
    offscreenPageA: "settings-case-offscreen-page-a",
    offscreenPageB: "settings-case-offscreen-page-b",
    zustandGitOpen: "settings-case-zustand-git-open",
    zustandGitDone: "settings-case-zustand-git-done",
    opacityPage: "settings-case-opacity-page",
} as const;

function seed(id: string, overrides: Parameters<typeof buildSeedFeedback>[2]) {
    return buildSeedFeedback(id, SETTINGS_PATHNAME, overrides);
}

export function createSettingsFeedbackSeed(): ReportFeedback[] {
    return [
        seed("settings-seed-modal-opacity-overlay-resolved", {
            report_id: "modal-opacity-overlay",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("Opacity modal overlay backdrop blur too strong on retina.", {
                    id: CASE.opacityOverlayA,
                    status: "resolved",
                    assignee_name: TEAM.emma,
                }),
                createReportCase("Dialog shadow clipped by parent overflow:hidden.", {
                    id: CASE.opacityOverlayB,
                    status: "resolved",
                    assignee_name: TEAM.william,
                }),
            ],
            field_values: seedFields("[modal · opacity overlay · 2] 모달 내부 group — 해피패스 해결", { isImportant: true }),
            replies: [
                seedReply("settings-reply-opacity-assigned", "An assignee has been assigned.", daysAgo(5, 9), "assignee_assigned", {
                    case_ids: [CASE.opacityOverlayA],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply(
                    "settings-reply-opacity-q",
                    "blur 강도는 design token 그대로인지, overlay 전용 override인지?",
                    daysAgo(4, 11),
                    "additional_question",
                    {
                        case_ids: [CASE.opacityOverlayA],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
                seedReply(
                    "settings-reply-opacity-s",
                    "overlay 전용 blur 12px→8px. shadow clip은 overflow visible로 수정.",
                    daysAgo(3, 12),
                    "suggested",
                    {
                        case_ids: [CASE.opacityOverlayA, CASE.opacityOverlayB],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                seedReply("settings-reply-opacity-resolved", "모달 닫힘/열림 + locate 복구 확인. resolved.", daysAgo(2, 15), "resolved", {
                    case_ids: [CASE.opacityOverlayA, CASE.opacityOverlayB],
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
            ],
            position: anchorPosition("modal-opacity-overlay", "group", 120, 0.45),
        }),

        seed("settings-seed-modal-opacity-target-pending", {
            report_id: "modal-opacity-target",
            report_type: "item",
            cases: [
                createReportCase("Modal dialog title line-height too tight — descenders clip.", { id: CASE.opacityTarget }),
            ],
            field_values: seedFields("[modal · opacity target · 1] 모달 dialog item — suggested 대기"),
            replies: [
                seedReply(
                    "settings-reply-opacity-target-s",
                    "title line-height 1.25→1.35. opacity 모달 열린 상태에서 확인 부탁.",
                    daysAgo(1, 10),
                    "suggested",
                    {
                        case_ids: [CASE.opacityTarget],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
            ],
            position: anchorPosition("modal-opacity-target", "item", 140, 0.48),
        }),

        seed("settings-seed-modal-display-overlay-stuck", {
            report_id: "modal-display-overlay",
            report_type: "group",
            cases: [
                createReportCase("display:none 모달 닫힌 뒤 detached 마커가 viewport 밖으로 표시됨.", {
                    id: CASE.displayOverlay,
                    assignee_name: TEAM.william,
                }),
            ],
            field_values: seedFields("[modal · display overlay · 1] display:none detached — found_error 멈춤", { isBug: true }),
            replies: [
                seedReply(
                    "settings-reply-display-s",
                    "locate 시 onRevealTarget로 display:flex 복구 후 마커 재계산.",
                    daysAgo(2, 10),
                    "suggested",
                    {
                        case_ids: [CASE.displayOverlay],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                seedReply(
                    "settings-reply-display-fe",
                    "모달 닫힌 상태에서 locate하면 여전히 0×0 rect. 거절.",
                    hoursAgo(4),
                    "found_error",
                    {
                        case_ids: [CASE.displayOverlay],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("modal-display-overlay", "group", 160, 0.5),
        }),

        seed("settings-seed-modal-conditional-overlay-transfer", {
            report_id: "modal-conditional-overlay",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("Conditional modal unmounts before marker animation completes.", {
                    id: CASE.conditionalA,
                    status: "resolved",
                    assignee_name: TEAM.emma,
                    previous_assignee_name: TEAM.william,
                }),
                createReportCase("Overlay click-outside closes without focus return.", {
                    id: CASE.conditionalB,
                    status: "resolved",
                    assignee_name: TEAM.emma,
                }),
                createReportCase("Escape key does not trap focus inside dialog.", {
                    id: CASE.conditionalC,
                    assignee_name: TEAM.sophia,
                }),
            ],
            field_values: seedFields("[modal · conditional overlay · 3] 이관 + deny→approve", { isBug: true }),
            replies: [
                seedReply("settings-reply-cond-assigned", "An assignee has been assigned.", daysAgo(6, 9), "assignee_assigned", {
                    case_ids: [CASE.conditionalA],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                seedReply("settings-reply-cond-transferred", "The assignee has been changed.", daysAgo(5, 10), "assignee_transferred", {
                    case_ids: [CASE.conditionalA],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply("settings-reply-cond-s1", "close delay 150ms 추가.", daysAgo(4, 12), "suggested", {
                    case_ids: [CASE.conditionalA],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply("settings-reply-cond-fe", "delay 후에도 flicker. 거절.", daysAgo(3, 14), "found_error", {
                    case_ids: [CASE.conditionalA],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("settings-reply-cond-s2", "exit animation + focus restore.", daysAgo(2, 11), "suggested", {
                    case_ids: [CASE.conditionalA, CASE.conditionalB],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply("settings-reply-cond-resolved", "conditional remount + locate OK. resolved.", daysAgo(1, 15), "resolved", {
                    case_ids: [CASE.conditionalA, CASE.conditionalB],
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
                seedReply("settings-reply-cond-c-q", "focus trap lib 적용 예정?", daysAgo(1, 9), "additional_question", {
                    case_ids: [CASE.conditionalC],
                    parent_reply_id: ISSUE_ROOT_PARENT_ID,
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
            ],
            position: anchorPosition("modal-conditional-overlay", "group", 180, 0.52),
        }),

        seed("settings-seed-modal-visibility-target-recheck", {
            report_id: "modal-visibility-target",
            report_type: "item",
            cases: [
                createReportCase("visibility:hidden 모달 dialog padding asymmetric left/right.", {
                    id: CASE.visibilityTarget,
                    assignee_name: TEAM.emma,
                }),
            ],
            field_values: seedFields("[modal · visibility target · 1] recheck_requested"),
            replies: [
                seedReply("settings-reply-vis-assigned", "An assignee has been assigned.", daysAgo(2, 9), "assignee_assigned", {
                    case_ids: [CASE.visibilityTarget],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply(
                    "settings-reply-vis-recheck",
                    "padding asymmetry는 scrollbar gutter 보정 — 의도된 동작.",
                    daysAgo(1, 14),
                    "recheck_requested",
                    {
                        case_ids: [CASE.visibilityTarget],
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("modal-visibility-target", "item", 200, 0.54),
        }),

        seed("settings-seed-modal-offscreen-overlay-deny", {
            report_id: "modal-offscreen-overlay",
            report_type: "group",
            status: "resolved",
            cases: [
                createReportCase("Off-screen transform leaves dialog partially visible at 1280px.", {
                    id: CASE.offscreenA,
                    status: "resolved",
                    assignee_name: TEAM.william,
                }),
                createReportCase("Locate does not scroll page to reveal off-screen modal.", {
                    id: CASE.offscreenB,
                    status: "resolved",
                    assignee_name: TEAM.william,
                }),
            ],
            field_values: seedFields("[modal · offscreen overlay · 2] 거절의 거절 후 해결"),
            replies: [
                seedReply("settings-reply-off-s1", "translateX(-120vw) 적용.", daysAgo(5, 9), "suggested", {
                    case_ids: [CASE.offscreenA],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                seedReply("settings-reply-off-f1", "1280px에서 8px peek. 거절.", daysAgo(4, 11), "found_error", {
                    case_ids: [CASE.offscreenA],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("settings-reply-off-r1", "peek은 shadow bleed — 오류 아님.", daysAgo(3, 13), "recheck_requested", {
                    case_ids: [CASE.offscreenA],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                seedReply("settings-reply-off-f2", "제품 스펙상 fully hidden 필요. 재거절.", daysAgo(2, 10), "found_error", {
                    case_ids: [CASE.offscreenA],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("settings-reply-off-s2", "translateX + opacity 0 병행.", daysAgo(1, 12), "suggested", {
                    case_ids: [CASE.offscreenA, CASE.offscreenB],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                seedReply("settings-reply-off-resolved", "locate scroll + hidden 확인. resolved.", daysAgo(1, 16), "resolved", {
                    case_ids: [CASE.offscreenA, CASE.offscreenB],
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
            ],
            position: anchorPosition("modal-offscreen-overlay", "group", 220, 0.56),
        }),

        seed("settings-seed-modal-zustand-overlay-multicase", {
            report_id: "modal-zustand-overlay",
            report_type: "group",
            cases: [
                createReportCase("Zustand modal store open state not synced on hot reload.", {
                    id: CASE.zustandA,
                    assignee_name: TEAM.william,
                }),
                createReportCase("Overlay blocks pointer events when store isOpen false.", {
                    id: CASE.zustandB,
                    assignee_name: TEAM.emma,
                }),
                createReportCase("revealZustandModal misses overlay group target.", {
                    id: CASE.zustandC,
                    status: "resolved",
                    assignee_name: TEAM.william,
                }),
                createReportCase("Close button focus ring clipped.", { id: CASE.zustandD }),
            ],
            field_values: seedFields("[modal · zustand overlay · 4] 멀티케이스 분기", { isImportant: true }),
            replies: [
                seedReply("settings-reply-z-s-a", "HMR guard 추가.", daysAgo(3, 10), "suggested", {
                    case_ids: [CASE.zustandA],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                seedReply("settings-reply-z-fe-b", "isOpen false인데 overlay 클릭 가능. 거절.", daysAgo(2, 12), "found_error", {
                    case_ids: [CASE.zustandB],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("settings-reply-z-resolved-c", "reveal handler overlay 포함. resolved.", daysAgo(2, 14), "resolved", {
                    case_ids: [CASE.zustandC],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
            ],
            position: anchorPosition("modal-zustand-overlay", "group", 240, 0.58),
        }),

        seed("settings-seed-modal-conditional-target-eight", {
            report_id: "modal-conditional-target",
            report_type: "item",
            cases: [
                createReportCase("Dialog primary button contrast below AA.", { id: CASE.conditionalTarget1, assignee_name: TEAM.emma }),
                createReportCase("Ghost button indistinguishable from body text.", { id: CASE.conditionalTarget2 }),
                createReportCase("Header eyebrow label not localized.", { id: CASE.conditionalTarget3, assignee_name: TEAM.sophia }),
                createReportCase("Description text overflows at 320px.", { id: CASE.conditionalTarget4, assignee_name: TEAM.william }),
                createReportCase("Close button missing aria-label.", { id: CASE.conditionalTarget5 }),
                createReportCase("Confirm button disabled state unclear.", { id: CASE.conditionalTarget6, status: "resolved", assignee_name: TEAM.emma }),
                createReportCase("Dialog max-height clips footer on mobile.", { id: CASE.conditionalTarget7, assignee_name: TEAM.william }),
                createReportCase("Focus trap skips first interactive element.", { id: CASE.conditionalTarget8 }),
            ],
            field_values: seedFields("[modal · conditional target · 8] 모달 dialog 최대 8케이스", { isBug: true, isImportant: true }),
            replies: [
                seedReply("settings-reply-ct-assigned", "An assignee has been assigned.", daysAgo(4, 9), "assignee_assigned", {
                    case_ids: [CASE.conditionalTarget1],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply("settings-reply-ct-q", "primary/ghost 둘 다 수정?", daysAgo(3, 11), "additional_question", {
                    case_ids: [CASE.conditionalTarget1, CASE.conditionalTarget2],
                    parent_reply_id: ISSUE_ROOT_PARENT_ID,
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
                seedReply("settings-reply-ct-s", "primary contrast + ghost underline.", daysAgo(2, 12), "suggested", {
                    case_ids: [CASE.conditionalTarget1, CASE.conditionalTarget2],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply("settings-reply-ct-fe", "dark mode primary still 3.9:1. 거절.", daysAgo(1, 10), "found_error", {
                    case_ids: [CASE.conditionalTarget1],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
                seedReply("settings-reply-ct-r-6", "disabled opacity 추가. resolved.", daysAgo(1, 14), "resolved", {
                    case_ids: [CASE.conditionalTarget6],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
            ],
            position: anchorPosition("modal-conditional-target", "item", 260, 0.6),
        }),

        seed("settings-seed-modal-visibility-overlay-open", {
            report_id: "modal-visibility-overlay",
            report_type: "group",
            cases: [
                createReportCase("visibility:hidden overlay still captures pointer events when hidden.", {
                    id: "settings-case-visibility-overlay",
                    assignee_name: TEAM.william,
                }),
            ],
            field_values: seedFields("[modal · visibility overlay · 1] group overlay — suggested 대기"),
            replies: [
                seedReply(
                    "settings-reply-vis-overlay-s",
                    "pointer-events:none when hidden. visibility 모달 열어서 확인.",
                    daysAgo(1, 11),
                    "suggested",
                    {
                        case_ids: ["settings-case-visibility-overlay"],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
            ],
            position: anchorPosition("modal-visibility-overlay", "group", 190, 0.53),
        }),

        seed("settings-seed-modal-offscreen-target-recheck", {
            report_id: "modal-offscreen-target",
            report_type: "item",
            cases: [
                createReportCase("Off-screen dialog confirm button misaligned.", { id: "settings-case-offscreen-target" }),
            ],
            field_values: seedFields("[modal · offscreen target · 1] dialog item"),
            replies: [
                seedReply(
                    "settings-reply-offscreen-target-q",
                    "transform off-screen 상태에서도 button layout 측정 가능?",
                    daysAgo(1, 10),
                    "additional_question",
                    {
                        case_ids: ["settings-case-offscreen-target"],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
            ],
            position: anchorPosition("modal-offscreen-target", "item", 210, 0.55),
        }),

        seed("settings-seed-modal-zustand-target-stuck", {
            report_id: "modal-zustand-target",
            report_type: "item",
            cases: [
                createReportCase("Zustand dialog header eyebrow uses wrong font size.", {
                    id: "settings-case-zustand-target",
                    assignee_name: TEAM.william,
                }),
            ],
            field_values: seedFields("[modal · zustand target · 1] store modal dialog — found_error"),
            replies: [
                seedReply("settings-reply-zt-s", "eyebrow 11px→12px.", daysAgo(2, 10), "suggested", {
                    case_ids: ["settings-case-zustand-target"],
                    author_type: "manager",
                    author_name: TEAM.william,
                }),
                seedReply("settings-reply-zt-fe", "store remount 후 eyebrow revert. 거절.", hoursAgo(5), "found_error", {
                    case_ids: ["settings-case-zustand-target"],
                    author_type: "user",
                    author_name: TEAM.user,
                }),
            ],
            position: anchorPosition("modal-zustand-target", "item", 230, 0.57),
        }),

        seed("settings-seed-page-display-demo-wait", {
            report_id: "modal-display-demo",
            report_type: "group",
            cases: [
                createReportCase("Display modal card description truncates on narrow sidebar.", { id: CASE.displayDemoWait }),
            ],
            field_values: seedFields("[page · display demo · 1] currently_wait — 모달 열기 전 페이지"),
            position: anchorPosition("modal-display-demo", "group", 80, 0.35),
            created_at: todayIso(),
            author_id: "demo-user",
            author_name: TEAM.user,
        }),

        seed("settings-seed-page-conditional-demo-two", {
            report_id: "modal-conditional-demo",
            report_type: "group",
            cases: [
                createReportCase("Conditional render card badge uses outdated accent color.", {
                    id: CASE.conditionalPageA,
                    assignee_name: TEAM.emma,
                }),
                createReportCase("Open button does not show aria-expanded when modal is mounted.", {
                    id: CASE.conditionalPageB,
                }),
            ],
            field_values: seedFields("[page · conditional demo · 2] 페이지 group — 담당 + 질문"),
            replies: [
                seedReply("settings-reply-cond-page-assigned", "An assignee has been assigned.", daysAgo(1, 10), "assignee_assigned", {
                    case_ids: [CASE.conditionalPageA],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply(
                    "settings-reply-cond-page-q",
                    "aria-expanded는 모달 열릴 때만 true면 되나요?",
                    hoursAgo(6),
                    "additional_question",
                    {
                        case_ids: [CASE.conditionalPageB],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("modal-conditional-demo", "group", 90, 0.36),
        }),

        seed("settings-seed-page-visibility-demo-pending", {
            report_id: "modal-visibility-demo",
            report_type: "group",
            cases: [
                createReportCase("Visibility card description line breaks too early at 1280px.", { id: CASE.visibilityPage }),
            ],
            field_values: seedFields("[page · visibility demo · 1] 페이지 group — suggested 대기"),
            replies: [
                seedReply(
                    "settings-reply-vis-page-s",
                    "description max-width 48ch로 조정. visibility 모달 열기 전 카드에서 확인.",
                    daysAgo(1, 9),
                    "suggested",
                    {
                        case_ids: [CASE.visibilityPage],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
            ],
            position: anchorPosition("modal-visibility-demo", "group", 95, 0.37),
        }),

        seed("settings-seed-page-offscreen-demo-stuck", {
            report_id: "modal-offscreen-demo",
            report_type: "group",
            cases: [
                createReportCase("Off-screen card title overlaps badge on narrow widths.", {
                    id: CASE.offscreenPageA,
                    assignee_name: TEAM.william,
                }),
                createReportCase("Card grid row height jumps when off-screen demo is focused.", {
                    id: CASE.offscreenPageB,
                }),
            ],
            field_values: seedFields("[page · offscreen demo · 2] 페이지 group — found_error 멈춤", { isBug: true }),
            replies: [
                seedReply(
                    "settings-reply-offscreen-page-s",
                    "title flex-wrap + badge shrink-0 적용.",
                    daysAgo(2, 10),
                    "suggested",
                    {
                        case_ids: [CASE.offscreenPageA],
                        author_type: "manager",
                        author_name: TEAM.william,
                    },
                ),
                seedReply(
                    "settings-reply-offscreen-page-fe",
                    "320px에서 title 여전히 overlap. 거절.",
                    hoursAgo(3),
                    "found_error",
                    {
                        case_ids: [CASE.offscreenPageA],
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
            ],
            position: anchorPosition("modal-offscreen-demo", "group", 98, 0.375),
        }),

        seed("settings-seed-page-opacity-demo-two", {
            report_id: "modal-opacity-demo",
            report_type: "group",
            cases: [
                createReportCase("Opacity modal card badge color mismatches design system.", { id: CASE.opacityPage, assignee_name: TEAM.emma }),
                createReportCase("Open button missing loading state during modal mount.", { id: "settings-case-opacity-page-b" }),
            ],
            field_values: seedFields("[page · opacity demo · 2] 페이지 group — assignee + question"),
            replies: [
                seedReply("settings-reply-page-opacity-assigned", "An assignee has been assigned.", daysAgo(1, 10), "assignee_assigned", {
                    case_ids: [CASE.opacityPage],
                    author_type: "manager",
                    author_name: TEAM.emma,
                }),
                seedReply(
                    "settings-reply-page-opacity-q",
                    "badge는 warning vs accent 중 어느 token?",
                    hoursAgo(8),
                    "additional_question",
                    {
                        case_ids: [CASE.opacityPage],
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
            ],
            position: anchorPosition("modal-opacity-demo", "group", 60, 0.32),
        }),

        seed("settings-seed-page-zustand-git", {
            report_id: "modal-zustand-demo",
            report_type: "group",
            status: "git_issued",
            cases: [
                createReportCase("Zustand modal card missing store badge in header.", { id: CASE.zustandGitOpen, assignee_name: TEAM.william }),
                createReportCase("Quick action link to zustand demo 404 on staging.", { id: CASE.zustandGitDone, status: "resolved", assignee_name: TEAM.sophia }),
            ],
            field_values: seedFields("[page · zustand demo · 2] git_issued + 부분 해결", { isBug: true }),
            integrations: {
                github: {
                    issue_number: 5102,
                    issue_url: "https://github.com/kimsangjunv1/fivepixels/issues/5102",
                    issued_at: daysAgo(1, 16),
                },
            },
            replies: [
                seedReply("settings-reply-zustand-git-system", "GitHub issue #5102 linked.", daysAgo(1, 16), "suggested", {
                    author_type: "system",
                    author_name: null,
                }),
                seedReply("settings-reply-zustand-git-resolved", "staging link fixed. case resolved.", hoursAgo(3), "resolved", {
                    case_ids: [CASE.zustandGitDone],
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
            ],
            position: anchorPosition("modal-zustand-demo", "group", 100, 0.38),
        }),

        seed("settings-seed-modal-display-target-long-qa", {
            report_id: "modal-display-target",
            report_type: "item",
            status: "resolved",
            cases: [
                createReportCase("Display modal dialog note text wraps awkwardly at 768px."),
            ],
            field_values: seedFields("[modal · display target · 1] 장문 Q&A 후 resolved"),
            replies: [
                seedReply(
                    "settings-reply-dt-q1",
                    "768px에서만? tablet landscape도?",
                    daysAgo(5, 9),
                    "additional_question",
                    {
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.sophia,
                    },
                ),
                seedReply(
                    "settings-reply-dt-q2",
                    "display:none 닫힌 뒤에도 note DOM에 남나요?",
                    daysAgo(5, 11),
                    "additional_question",
                    {
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "manager",
                        author_name: TEAM.emma,
                    },
                ),
                seedReply(
                    "settings-reply-dt-a",
                    "768–834 landscape 포함. DOM은 display:none으로 유지.",
                    daysAgo(4, 10),
                    "additional_question",
                    {
                        parent_reply_id: ISSUE_ROOT_PARENT_ID,
                        author_type: "user",
                        author_name: TEAM.user,
                    },
                ),
                seedReply(
                    "settings-reply-dt-s",
                    "note max-width + hyphenation 적용.",
                    daysAgo(3, 12),
                    "suggested",
                    { author_type: "manager", author_name: TEAM.william },
                ),
                seedReply("settings-reply-dt-resolved", "display 모달 locate 후 확인. resolved.", daysAgo(2, 15), "resolved", {
                    author_type: "manager",
                    author_name: TEAM.sophia,
                }),
            ],
            position: anchorPosition("modal-display-target", "item", 170, 0.51),
        }),
    ];
}

export const SETTINGS_FEEDBACK_SEED_IDS = createSettingsFeedbackSeed().map((item) => item.id);

export const SETTINGS_FEEDBACK_SEED_CATALOG: DemoSeedCatalogEntry[] = [
    { id: "settings-seed-page-opacity-demo-two", label: "Opacity · page (2)", summary: "페이지 카드 마커" },
    { id: "settings-seed-modal-opacity-overlay-resolved", label: "Opacity · overlay (2)", summary: "모달 group overlay" },
    { id: "settings-seed-modal-opacity-target-pending", label: "Opacity · target (1)", summary: "모달 dialog item" },
    { id: "settings-seed-page-display-demo-wait", label: "Display · page (1)", summary: "페이지 카드 마커" },
    { id: "settings-seed-modal-display-overlay-stuck", label: "Display · overlay (1)", summary: "display:none detached" },
    { id: "settings-seed-modal-display-target-long-qa", label: "Display · target (1)", summary: "모달 dialog · Q&A" },
    { id: "settings-seed-page-conditional-demo-two", label: "Conditional · page (2)", summary: "페이지 카드 마커" },
    { id: "settings-seed-modal-conditional-overlay-transfer", label: "Conditional · overlay (3)", summary: "이관 + deny→approve" },
    { id: "settings-seed-modal-conditional-target-eight", label: "Conditional · target (8)", summary: "모달 dialog 8케이스" },
    { id: "settings-seed-page-visibility-demo-pending", label: "Visibility · page (1)", summary: "페이지 카드 마커" },
    { id: "settings-seed-modal-visibility-overlay-open", label: "Visibility · overlay (1)", summary: "모달 group overlay" },
    { id: "settings-seed-modal-visibility-target-recheck", label: "Visibility · target (1)", summary: "recheck_requested" },
    { id: "settings-seed-page-offscreen-demo-stuck", label: "Offscreen · page (2)", summary: "페이지 카드 마커" },
    { id: "settings-seed-modal-offscreen-overlay-deny", label: "Offscreen · overlay (2)", summary: "거절의 거절 후 해결" },
    { id: "settings-seed-modal-offscreen-target-recheck", label: "Offscreen · target (1)", summary: "모달 dialog item" },
    { id: "settings-seed-page-zustand-git", label: "Zustand · page (2)", summary: "페이지 카드 · git_issued" },
    { id: "settings-seed-modal-zustand-overlay-multicase", label: "Zustand · overlay (4)", summary: "멀티케이스 분기" },
    { id: "settings-seed-modal-zustand-target-stuck", label: "Zustand · target (1)", summary: "store dialog · found_error" },
];
