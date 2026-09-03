import { describe, expect, it } from "vitest";
import { createReportCase, createReportFeedback } from "../report/reportFixtures.js";
import { formatFeedbackForAiPrompt, type AiPromptLabels } from "./formatFeedbackForAiPrompt.js";

const baseCaseOpen = createReportCase("버튼 색상이 브랜드 가이드와 다름");
const baseCaseResolved = createReportCase("모바일 텍스트 잘림", { status: "resolved" });

const labels: AiPromptLabels = {
    modificationTitle: "# UI 수정 요청 (전체)",
    modificationInstruction: "수정 방향을 제안해 주세요.",
    reviewTitle: "# UI 점검 요청 (전체)",
    reviewInstruction: "반영 여부를 점검해 주세요.",
    selectedCaseReviewTitle: "# UI 점검 요청 (선택 케이스)",
    selectedCaseReviewInstruction: "선택 케이스를 점검해 주세요.",
    threadModificationTitle: "# UI 수정 요청 (현재 스레드)",
    threadModificationInstruction: "현재 스레드 수정 방향을 제안해 주세요.",
    threadReviewTitle: "# UI 점검 요청 (현재 스레드)",
    threadReviewInstruction: "현재 스레드를 점검해 주세요.",
    openCases: "## 미해결 케이스",
    allCases: "## 점검 대상 케이스",
    selectedCaseHeading: "## 선택한 케이스",
    threadCaseHeading: "## 현재 케이스",
    modificationReplies: "## 대화에서 나온 수정 제안",
    reviewChecklist: "## 확인해야 할 사항",
    reviewChecklistItem1: "resolved 케이스 확인",
    reviewChecklistItem2: "엣지 케이스",
    reviewChecklistItem3: "재확인 요청",
    context: "## 컨텍스트",
    thread: "## 대화 기록",
    progress: (resolved, total) => `진행: ${resolved}/${total}`,
    noCases: "(케이스 없음)",
    noReplies: "(답변 없음)",
    noOpenCases: "(미해결 케이스 없음)",
    path: "Path",
    reportId: "Report ID",
    element: "Element",
    author: "Author",
    tags: "Tags",
    env: "Env",
    version: "Version",
    position: "Position",
    feedbackId: "Feedback ID",
    caseLabel: "케이스",
    needsVerification: "확인 필요",
    replyStatus: (status) => status,
};

const baseFeedback = createReportFeedback({
    id: "fb-1",
    pathname: "/pricing",
    report_id: "price-card",
    report_type: "item",
    cases: [baseCaseOpen, baseCaseResolved],
    field_values: { isBug: true },
    replies: [
        {
            id: "r1",
            message: "primary 색상을 #0066FF로",
            created_at: "2026-06-07T10:00:00.000Z",
            status: "suggested",
            case_ids: [baseCaseOpen.id],
            author_name: "PM",
        },
        {
            id: "r2",
            message: "다크모드도 확인 필요",
            created_at: "2026-06-07T11:00:00.000Z",
            status: "recheck_requested",
            case_ids: [baseCaseResolved.id],
            author_name: "QA",
        },
    ],
    position: {
        target: { x: 0.5, y: 0.5 },
        viewport: { x: 0.42, y: 0.18, width: 1280, height: 720 },
        scrollY: 0,
        anchor: null,
    },
    created_at: "2026-06-07T09:00:00.000Z",
    environment: "staging",
    app_version: "1.0.0",
    author_name: "디자이너",
});

describe("formatFeedbackForAiPrompt", () => {
    it("formats full modification prompts with open cases and suggested replies", () => {
        const body = formatFeedbackForAiPrompt(
            baseFeedback,
            [{ key: "isBug", type: "checkbox", label: "bug" }],
            { intent: "modification", scope: "full" },
            labels,
        );

        expect(body).toContain("# UI 수정 요청 (전체)");
        expect(body).toContain("## 미해결 케이스");
        expect(body).toContain("버튼 색상이 브랜드 가이드와 다름");
        expect(body).not.toContain("모바일 텍스트 잘림");
        expect(body).toContain("primary 색상을 #0066FF로");
        expect(body).not.toContain("다크모드도 확인 필요");
        expect(body).toContain("- Tags: bug");
    });

    it("formats full review prompts with all cases and checklist", () => {
        const body = formatFeedbackForAiPrompt(baseFeedback, [], { intent: "review", scope: "full" }, labels);

        expect(body).toContain("# UI 점검 요청 (전체)");
        expect(body).toContain("## 점검 대상 케이스");
        expect(body).toContain("버튼 색상이 브랜드 가이드와 다름");
        expect(body).toContain("모바일 텍스트 잘림");
        expect(body).toContain("(확인 필요)");
        expect(body).toContain("다크모드도 확인 필요");
    });

    it("formats selected case review prompts for one case and its replies", () => {
        const body = formatFeedbackForAiPrompt(
            baseFeedback,
            [],
            { intent: "review", scope: "selectedCase", caseId: baseCaseResolved.id },
            labels,
        );

        expect(body).toContain("# UI 점검 요청 (선택 케이스)");
        expect(body).toContain("## 선택한 케이스");
        expect(body).toContain("모바일 텍스트 잘림");
        expect(body).not.toContain("버튼 색상이 브랜드 가이드와 다름");
        expect(body).toContain("다크모드도 확인 필요");
        expect(body).not.toContain("primary 색상을 #0066FF로");
    });

    it("formats thread prompts for the focused case thread", () => {
        const body = formatFeedbackForAiPrompt(
            baseFeedback,
            [],
            { intent: "modification", scope: "thread", caseId: baseCaseOpen.id },
            labels,
        );

        expect(body).toContain("# UI 수정 요청 (현재 스레드)");
        expect(body).toContain("## 현재 케이스");
        expect(body).toContain("버튼 색상이 브랜드 가이드와 다름");
        expect(body).toContain("primary 색상을 #0066FF로");
        expect(body).not.toContain("모바일 텍스트 잘림");
    });

    it("shows placeholder when there are no open cases in full modification mode", () => {
        const body = formatFeedbackForAiPrompt(
            createReportFeedback({
                ...baseFeedback,
                cases: [baseCaseResolved],
                replies: [],
            }),
            [],
            { intent: "modification", scope: "full" },
            labels,
        );

        expect(body).toContain("(미해결 케이스 없음)");
    });
});
