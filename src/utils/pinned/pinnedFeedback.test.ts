import { describe, expect, it } from "vitest";
import { createReportFeedback } from "@/utils/report/reportFixtures.js";
import {
    createPinnedFeedbackItem,
    getPinnedFeedbackCaseProgress,
    isFeedbackPinned,
    sanitizePinnedFeedbackPreference,
    togglePinnedFeedbackItem,
} from "./pinnedFeedback.js";

function makeReport(overrides?: Parameters<typeof createReportFeedback>[0]) {
    return createReportFeedback({
        cases: [
            {
                id: "case-1",
                text: "Button contrast is too low",
                status: "open",
                created_at: "2026-01-01T00:00:00.000Z",
                updated_at: "2026-01-01T00:00:00.000Z",
            },
        ],
        ...overrides,
    });
}

describe("pinnedFeedback", () => {
    it("sanitizes invalid preference payloads", () => {
        expect(sanitizePinnedFeedbackPreference(null)).toEqual({ items: [], railCollapsed: false });
        expect(
            sanitizePinnedFeedbackPreference({
                railCollapsed: true,
                items: [{ reportId: "a", pathname: "/x", summary: "hello", pinnedAt: "2026-01-01T00:00:00.000Z" }, { reportId: 1 }],
            }),
        ).toEqual({
            railCollapsed: true,
            items: [
                {
                    reportId: "a",
                    caseId: null,
                    fcNumber: null,
                    pathname: "/x",
                    summary: "hello",
                    cases: [],
                    pinnedAt: "2026-01-01T00:00:00.000Z",
                },
            ],
        });
    });

    it("toggles and caps pinned items", () => {
        const first = createPinnedFeedbackItem(makeReport());
        const second = createPinnedFeedbackItem(makeReport({ id: "report-2", pathname: "/other" }));

        expect(isFeedbackPinned([], first.reportId)).toBe(false);

        const pinned = togglePinnedFeedbackItem([], first);
        expect(pinned).toHaveLength(1);
        expect(isFeedbackPinned(pinned, first.reportId)).toBe(true);

        const withSecond = togglePinnedFeedbackItem(pinned, second);
        expect(withSecond).toHaveLength(2);

        const unpinned = togglePinnedFeedbackItem(withSecond, first);
        expect(unpinned).toEqual([second]);
    });

    it("prefers focused case text for summary", () => {
        const item = createPinnedFeedbackItem(makeReport({ fc_number: 101 }), { caseId: "case-1" });
        expect(item.summary).toBe("Button contrast is too low");
        expect(item.caseId).toBe("case-1");
        expect(item.fcNumber).toBe(101);
        expect(item.cases).toEqual([{ id: "case-1", status: "open" }]);
    });

    it("calculates completion by individual cases", () => {
        const first = createPinnedFeedbackItem(
            makeReport({
                cases: [
                    {
                        id: "case-1",
                        text: "First",
                        status: "resolved",
                        created_at: "2026-01-01T00:00:00.000Z",
                        updated_at: "2026-01-01T00:00:00.000Z",
                    },
                    {
                        id: "case-2",
                        text: "Second",
                        status: "open",
                        created_at: "2026-01-01T00:00:00.000Z",
                        updated_at: "2026-01-01T00:00:00.000Z",
                    },
                ],
            }),
        );
        const second = createPinnedFeedbackItem(
            makeReport({
                id: "report-2",
                cases: [
                    {
                        id: "case-3",
                        text: "Third",
                        status: "resolved",
                        created_at: "2026-01-01T00:00:00.000Z",
                        updated_at: "2026-01-01T00:00:00.000Z",
                    },
                ],
            }),
        );

        expect(getPinnedFeedbackCaseProgress([first, second])).toEqual({
            resolved: 2,
            total: 3,
            percentage: 67,
        });
    });
});
