import { describe, expect, it } from "vitest";
import { createReportFeedback } from "./reportFixtures.js";
import { formatFeedbackAsGitHubIssueBody } from "./formatGitHubIssue.js";

const baseFeedback = createReportFeedback({
    id: "fb-1",
    pathname: "/pricing",
    report_id: "price-card",
    report_type: "item",
    message: "가격 카드가 모바일에서 잘림",
    field_values: { message: "가격 카드가 모바일에서 잘림", isBug: true },
    replies: [
        {
            id: "r1",
            message: "재현 확인 | 테스트",
            created_at: "2026-06-07T10:00:00.000Z",
            status: "suggested",
            author_name: "PM",
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

describe("formatFeedbackAsGitHubIssueBody", () => {
    it("includes summary, context table, thread table, and feedback id", () => {
        const body = formatFeedbackAsGitHubIssueBody(baseFeedback, [
            { key: "message", type: "textarea", label: "Message" },
            { key: "isBug", type: "checkbox", label: "bug" },
        ]);

        expect(body).toContain("## Summary");
        expect(body).toContain("가격 카드가 모바일에서 잘림");
        expect(body).toContain("| Path | /pricing |");
        expect(body).toContain("| Author | 디자이너 |");
        expect(body).toContain("| Tags | bug |");
        expect(body).toContain("## Thread");
        expect(body).toContain("재현 확인 \\| 테스트");
        expect(body).toContain("> fivepixels feedback id: `fb-1`");
    });

    it("renders placeholder row when there are no replies", () => {
        const body = formatFeedbackAsGitHubIssueBody({
            ...baseFeedback,
            replies: [],
        });

        expect(body).toContain("| - | - | - | (no replies yet) |");
    });
});
