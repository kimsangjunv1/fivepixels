import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    formatModalReportLabel,
    getDetachedMarkerHint,
    getModalGhostFrame,
    isModalReportId,
    resolveDetachedKind,
} from "./markerContext.js";

describe("isModalReportId", () => {
    it("detects modal-related report ids", () => {
        expect(isModalReportId("modal-zustand-overlay")).toBe(true);
        expect(isModalReportId("example-modal-lab-dialog-issues-scroll-x")).toBe(true);
        expect(isModalReportId("hero-cta")).toBe(false);
    });
});

describe("resolveDetachedKind", () => {
    it("returns null for attached markers", () => {
        expect(resolveDetachedKind({ report_id: "hero", anchor_report_id: null, viewport_width: 1000 }, null, false)).toBeNull();
    });

    it("classifies modal report ids as modal", () => {
        expect(resolveDetachedKind({ report_id: "modal-zustand-overlay", anchor_report_id: null, viewport_width: 1000 }, null, true)).toBe("modal");
    });

    it("classifies viewport-detached feedback without anchor as modal", () => {
        expect(resolveDetachedKind({ report_id: "hero-cta", anchor_report_id: null, viewport_width: 1000 }, null, true)).toBe("modal");
    });

    it("classifies fixed targets as modal", () => {
        document.body.innerHTML = `
            <div style="position: fixed">
                <div data-report-id="modal-target">target</div>
            </div>
        `;

        const target = document.querySelector<HTMLElement>('[data-report-id="modal-target"]')!;

        expect(resolveDetachedKind({ report_id: "page-section", anchor_report_id: "page", viewport_width: 1000 }, target, true)).toBe("modal");
    });

    it("falls back to hidden for document-flow detached targets", () => {
        const target = document.createElement("section");
        target.dataset.reportId = "hero";

        expect(
            resolveDetachedKind(
                {
                    report_id: "pulse-list-scroll",
                    anchor_report_id: "pulse-issues-page",
                    viewport_width: 1000,
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
            x_ratio: 0.5,
            y_ratio: 0.5,
            viewport_width: 1000,
            viewport_height: 800,
        });

        expect(frame.backdrop.width).toBe(1000);
        expect(frame.dialog.left + frame.dialog.width / 2).toBeCloseTo(500, 0);
        expect(frame.dialog.top + frame.dialog.height / 2).toBeCloseTo(400, 0);
    });
});
