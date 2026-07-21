import { describe, expect, it } from "vitest";
import {
    buildPageBriefSummary,
    buildProjectHealthSummary,
    filterMyTasks,
    filterNeedsAttention,
    filterTodayDigest,
} from "@/utils/panel/experimentalPanelTabs.js";
import type { ReportFeedback } from "@/types/report.js";

function createReport(overrides: Partial<ReportFeedback> & Pick<ReportFeedback, "id" | "status">): ReportFeedback {
    return {
        pathname: "/edgecase",
        report_id: overrides.id,
        report_type: "item",
        cases: [
            {
                id: `${overrides.id}-case`,
                text: "sample",
                status: "open",
                created_at: "2026-07-11T01:00:00.000Z",
                updated_at: "2026-07-11T01:00:00.000Z",
                assignee_name: overrides.cases?.[0]?.assignee_name ?? null,
            },
        ],
        field_values: {},
        position: { x_ratio: 0.1, y_ratio: 0.1, element_x_ratio: 0.1, element_y_ratio: 0.1 },
        created_at: "2026-07-11T01:00:00.000Z",
        ...overrides,
    };
}

describe("experimentalPanelTabs", () => {
    it("filters my tasks by assignee and reply needs", () => {
        const reports = [
            createReport({ id: "1", status: "open", cases: [{ id: "c1", text: "a", status: "open", assignee_name: "Kim", created_at: "2026-07-11T01:00:00.000Z", updated_at: "2026-07-11T01:00:00.000Z" }] }),
            createReport({
                id: "2",
                status: "open",
                latest_reply: { id: "r1", message: "q", created_at: "2026-07-11T02:00:00.000Z", status: "additional_question", case_ids: [] },
            }),
            createReport({ id: "3", status: "resolved" }),
        ];

        expect(filterMyTasks(reports, "Kim").map((item) => item.id)).toEqual(["1", "2"]);
    });

    it("filters needs-attention statuses", () => {
        const reports = [
            createReport({
                id: "1",
                status: "open",
                latest_reply: { id: "r1", message: "err", created_at: "2026-07-11T02:00:00.000Z", status: "found_error", case_ids: [] },
            }),
            createReport({ id: "2", status: "resolved" }),
        ];

        expect(filterNeedsAttention(reports).map((item) => item.id)).toEqual(["1"]);
    });

    it("builds page brief and project health summaries", () => {
        const reports = [
            createReport({ id: "1", status: "open" }),
            createReport({ id: "2", status: "resolved" }),
            createReport({ id: "3", status: "git_issued" }),
        ];

        expect(buildPageBriefSummary(reports).total).toBe(3);
        expect(buildProjectHealthSummary(reports).gitIssued).toBe(1);
        expect(buildProjectHealthSummary(reports).completionRate).toBe(33);
    });

    it("filters today digest by created_at", () => {
        const now = new Date("2026-07-11T12:00:00.000Z");
        const reports = [
            createReport({ id: "1", status: "open", created_at: "2026-07-11T01:00:00.000Z" }),
            createReport({ id: "2", status: "open", created_at: "2026-07-10T01:00:00.000Z" }),
        ];

        expect(filterTodayDigest(reports, now).map((item) => item.id)).toEqual(["1"]);
    });
});
