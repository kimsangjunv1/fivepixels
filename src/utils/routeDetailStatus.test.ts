import { describe, expect, it } from "vitest";
import type { ReportFeedback } from "@/types/report.js";
import { createReportPayload } from "./reportFixtures.js";
import { getRouteDetailStatus } from "./routeDetailStatus.js";

function createReportFixture(overrides: Partial<ReportFeedback> = {}): ReportFeedback {
    return {
        id: "report-1",
        created_at: "2026-01-01T00:00:00.000Z",
        replies: [],
        ...createReportPayload(),
        ...overrides,
    };
}

describe("getRouteDetailStatus", () => {
    it("maps open feedback without replies to wait", () => {
        const report = createReportFixture({ status: "open", replies: [] });
        expect(getRouteDetailStatus(report)).toBe("wait");
    });

    it("maps suggested reply to suggested", () => {
        const report = createReportFixture({
            status: "open",
            replies: [{ id: "r1", message: "ok", created_at: "2026-01-01T00:00:00.000Z", status: "suggested" }],
        });
        expect(getRouteDetailStatus(report)).toBe("suggested");
    });

    it("maps resolved feedback to resolved", () => {
        const report = createReportFixture({ status: "resolved" });
        expect(getRouteDetailStatus(report)).toBe("resolved");
    });

    it("maps additional question reply to wait", () => {
        const report = createReportFixture({
            status: "open",
            replies: [{ id: "r1", message: "question?", created_at: "2026-01-01T00:00:00.000Z", status: "additional_question" }],
        });
        expect(getRouteDetailStatus(report)).toBe("wait");
    });

    it("maps git_issued feedback to git_issued", () => {
        const report = createReportFixture({ status: "git_issued" });
        expect(getRouteDetailStatus(report)).toBe("git_issued");
    });
});
