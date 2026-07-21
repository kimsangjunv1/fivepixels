import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReportPosition } from "../report/reportPosition.js";
import {
    formatModalReportLabel,
    getDetachedMarkerHint,
    getModalGhostFrame,
    isModalReportId,
    resolveDetachedKind,
} from "./markerContext.js";

const defaultPosition = createReportPosition({
    viewport: { x: 0.5, y: 0.5, width: 1000, height: 800 },
});

describe("isModalReportId", () => {
    it("detects modal-related report ids", () => {
        expect(isModalReportId("modal-zustand-overlay")).toBe(true);
        expect(isModalReportId("example-modal-lab-dialog-issues-scroll-x")).toBe(true);
        expect(isModalReportId("hero-cta")).toBe(false);
    });
});

describe("resolveDetachedKind", () => {
    it("returns null for attached markers", () => {
        expect(resolveDetachedKind({ report_id: "hero", position: defaultPosition }, null, false)).toBeNull();
    });

    it("classifies modal report ids as modal", () => {
        expect(resolveDetachedKind({ report_id: "modal-zustand-overlay", position: defaultPosition }, null, true)).toBe("modal");
    });

    it("classifies viewport-detached feedback without anchor as modal", () => {
        expect(resolveDetachedKind({ report_id: "hero-cta", position: defaultPosition }, null, true)).toBe("modal");
    });

    it("classifies fixed targets as modal", () => {
        document.body.innerHTML = `
            <div style="position: fixed">
                <div data-report-id="modal-target">target</div>
            </div>
        `;

        const target = document.querySelector<HTMLElement>('[data-report-id="modal-target"]')!;

        expect(
            resolveDetachedKind(
                {
                    report_id: "page-section",
                    position: createReportPosition({
                        viewport: { x: 0.5, y: 0.5, width: 1000, height: 800 },
                        anchor: {
                            reportId: "page",
                            reportType: "group",
                            x: 0.5,
                            y: 0.5,
                        },
                    }),
                },
                target,
                true,
            ),
        ).toBe("modal");
    });

    it("falls back to hidden for document-flow detached targets", () => {
        const target = document.createElement("section");
        target.dataset.reportId = "hero";

        expect(
            resolveDetachedKind(
                {
                    report_id: "pulse-list-scroll",
                    position: createReportPosition({
                        viewport: { x: 0.5, y: 0.5, width: 1000, height: 800 },
                        anchor: {
                            reportId: "pulse-issues-page",
                            reportType: "group",
                            x: 0.5,
                            y: 0.5,
                        },
                    }),
                },
                target,
                true,
            ),
        ).toBe("hidden");
    });
});

describe("formatModalReportLabel", () => {
    it("formats modal report ids into readable labels", () => {
        expect(formatModalReportLabel("modal-zustand-overlay")).toBe("Zustand modal");
        expect(formatModalReportLabel("modal-opacity-target")).toBe("Opacity modal");
    });
});

describe("getDetachedMarkerHint", () => {
    const messages = {
        detachedHint: "hidden hint",
        detachedModalHint: "modal hint",
    };

    it("returns modal-specific hint", () => {
        expect(getDetachedMarkerHint("modal", messages)).toBe("modal hint");
        expect(getDetachedMarkerHint("hidden", messages)).toBe("hidden hint");
        expect(getDetachedMarkerHint(null, messages)).toBeNull();
    });
});

describe("getModalGhostFrame", () => {
    beforeEach(() => {
        vi.stubGlobal("innerWidth", 1000);
        vi.stubGlobal("innerHeight", 800);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("centers the ghost dialog around the saved viewport ratios", () => {
        const frame = getModalGhostFrame({
            position: createReportPosition({
                viewport: { x: 0.5, y: 0.5, width: 1000, height: 800 },
            }),
        });

        expect(frame.backdrop.width).toBe(1000);
        expect(frame.dialog.left + frame.dialog.width / 2).toBeCloseTo(500, 0);
        expect(frame.dialog.top + frame.dialog.height / 2).toBeCloseTo(400, 0);
    });
});
