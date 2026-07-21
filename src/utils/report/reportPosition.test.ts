import { describe, expect, it } from "vitest";
import { createReportPosition, getDocumentY, normalizeReportPosition } from "./reportPosition.js";
import { normalizeListReport } from "./reportSummary.js";
import { createReportFeedback } from "./reportFixtures.js";

describe("getDocumentY", () => {
    it("derives document Y from scrollY and viewport ratios", () => {
        const position = createReportPosition({
            scrollY: 100,
            viewport: { x: 0.5, y: 0.5, width: 1000, height: 800 },
        });

        expect(getDocumentY(position)).toBe(500);
    });
});

describe("normalizeReportPosition", () => {
    it("returns a safe fallback when position is missing", () => {
        expect(normalizeReportPosition(undefined)).toEqual({
            target: null,
            viewport: {
                x: 0.5,
                y: 0.5,
                width: expect.any(Number),
                height: expect.any(Number),
            },
            scrollY: expect.any(Number),
            anchor: null,
        });
    });

    it("fills incomplete viewport fields while keeping valid ratios", () => {
        expect(
            normalizeReportPosition({
                target: { x: 0.2, y: 0.8 },
                viewport: { x: 0.3, y: 0.4 },
                scrollY: 120,
            }),
        ).toEqual({
            target: { x: 0.2, y: 0.8 },
            viewport: {
                x: 0.3,
                y: 0.4,
                width: expect.any(Number),
                height: expect.any(Number),
            },
            scrollY: 120,
            anchor: null,
        });
    });

    it("drops invalid target/anchor payloads", () => {
        expect(
            normalizeReportPosition({
                target: { x: "bad" },
                viewport: { x: 0.1, y: 0.2, width: 800, height: 600 },
                scrollY: 10,
                anchor: { reportId: "hero", reportType: "unknown", x: 0.5, y: 0.5 },
            }),
        ).toEqual({
            target: null,
            viewport: { x: 0.1, y: 0.2, width: 800, height: 600 },
            scrollY: 10,
            anchor: null,
        });
    });
});

describe("normalizeListReport", () => {
    it("normalizes missing position so marker rendering does not crash", () => {
        const report = createReportFeedback();
        const withoutPosition = { ...report, position: undefined } as typeof report;

        const normalized = normalizeListReport(withoutPosition);

        expect(normalized.position).toEqual({
            target: null,
            viewport: {
                x: 0.5,
                y: 0.5,
                width: expect.any(Number),
                height: expect.any(Number),
            },
            scrollY: expect.any(Number),
            anchor: null,
        });
    });
});
