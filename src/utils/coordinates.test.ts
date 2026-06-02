import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DOT_SIZE } from "../constants/report.js";
import type { ReportFeedback } from "../types/report.js";
import {
    clampRatio,
    DRAFT_POPOVER_HEIGHT,
    DRAFT_POPOVER_MARGIN,
    DRAFT_POPOVER_TAIL_OFFSET,
    DRAFT_POPOVER_WIDTH,
    getDraftMarkerPosition,
    getDraftPopoverPosition,
    getMarkerFromReport,
    getTooltipPosition,
    resolveTooltipAnchor,
} from "./coordinates.js";

function createStoredReport(overrides: Partial<ReportFeedback> = {}): ReportFeedback {
    return {
        id: "report-1",
        pathname: "/demo",
        report_id: "hero",
        report_type: "group",
        message: "테스트",
        status: "open",
        field_values: {},
        replies: [],
        x_ratio: 0.5,
        y_ratio: 0.5,
        element_x_ratio: 0.25,
        element_y_ratio: 0.75,
        scroll_y: 0,
        document_y: 200,
        viewport_width: 1000,
        viewport_height: 800,
        design_width: 1000,
        design_height: 800,
        created_at: "2026-05-31T00:00:00.000Z",
        ...overrides,
    };
}

describe("clampRatio", () => {
    it("clamps values into the 0..1 range", () => {
        expect(clampRatio(-0.2)).toBe(0);
        expect(clampRatio(1.4)).toBe(1);
        expect(clampRatio(Number.NaN)).toBe(0);
    });
});

describe("getMarkerFromReport", () => {
    beforeEach(() => {
        vi.stubGlobal("innerWidth", 1000);
        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("anchors to the matched element when data-report attributes exist", () => {
        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "group";
        document.body.append(target);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 80,
            width: 200,
            height: 100,
            right: 300,
            bottom: 180,
            x: 100,
            y: 80,
            toJSON: () => ({}),
        } as DOMRect);

        const marker = getMarkerFromReport(createStoredReport(), 0);

        expect(marker.rect).not.toBeNull();
        expect(marker.left).toBe(100 + 200 * 0.25 - DOT_SIZE / 2);
        expect(marker.top).toBe(80 + 100 * 0.75 - DOT_SIZE / 2);
    });

    it("falls back to document coordinates when the target element is missing", () => {
        const marker = getMarkerFromReport(createStoredReport({ document_y: 220 }), 20);

        expect(marker.rect).toBeNull();
        expect(marker.left).toBe(1000 * 0.5 - DOT_SIZE / 2);
        expect(marker.top).toBe(220 - 20 - DOT_SIZE / 2);
    });

    it("uses the first matching element when duplicate ids exist", () => {
        const first = document.createElement("section");
        first.dataset.reportId = "hero";
        first.dataset.reportType = "group";

        const second = document.createElement("section");
        second.dataset.reportId = "hero";
        second.dataset.reportType = "group";

        document.body.append(first, second);

        vi.spyOn(first, "getBoundingClientRect").mockReturnValue({
            left: 10,
            top: 20,
            width: 100,
            height: 50,
            right: 110,
            bottom: 70,
            x: 10,
            y: 20,
            toJSON: () => ({}),
        } as DOMRect);

        vi.spyOn(second, "getBoundingClientRect").mockReturnValue({
            left: 400,
            top: 500,
            width: 100,
            height: 50,
            right: 500,
            bottom: 550,
            x: 400,
            y: 500,
            toJSON: () => ({}),
        } as DOMRect);

        const marker = getMarkerFromReport(createStoredReport(), 0);

        expect(marker.left).toBe(10 + 100 * 0.25 - DOT_SIZE / 2);
    });
});

describe("getDraftMarkerPosition", () => {
    it("anchors to the selected target rect when available", () => {
        const position = getDraftMarkerPosition(
            { clientX: 0, clientY: 0, elementXRatio: 0.25, elementYRatio: 0.75 },
            {
                id: "hero",
                type: "item",
                rect: {
                    left: 100,
                    top: 80,
                    width: 200,
                    height: 100,
                    right: 300,
                    bottom: 180,
                    x: 100,
                    y: 80,
                    toJSON: () => ({}),
                } as DOMRect,
            },
        );

        expect(position.left).toBe(100 + 200 * 0.25 - DOT_SIZE / 2);
        expect(position.top).toBe(80 + 100 * 0.75 - DOT_SIZE / 2);
    });

    it("falls back to viewport click coordinates when no target is selected", () => {
        const position = getDraftMarkerPosition({ clientX: 240, clientY: 180, elementXRatio: 0, elementYRatio: 0 }, null);

        expect(position.left).toBe(240 - DOT_SIZE / 2);
        expect(position.top).toBe(180 - DOT_SIZE / 2);
    });
});

describe("getDraftPopoverPosition", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("prefers placing the bubble to the right of the marker", () => {
        vi.stubGlobal("innerWidth", 1200);
        vi.stubGlobal("innerHeight", 800);

        const position = getDraftPopoverPosition({ left: 200, top: 300 });

        expect(position.placement).toBe("right");
        expect(position.tailCorner).toBe("bottom-left");
        expect(position.left).toBe(200 + DOT_SIZE / 2 + DOT_SIZE / 2 + 10);
        expect(position.top).toBe(300 + DOT_SIZE / 2 - DRAFT_POPOVER_HEIGHT + DRAFT_POPOVER_TAIL_OFFSET);
        expect(position.width).toBe(DRAFT_POPOVER_WIDTH);
    });

    it("flips to the left when there is not enough space on the right", () => {
        vi.stubGlobal("innerWidth", 360);
        vi.stubGlobal("innerHeight", 800);

        const anchor = { left: 310, top: 400 };
        const position = getDraftPopoverPosition(anchor, {
            viewportWidth: 360,
            viewportHeight: 800,
        });

        expect(position.placement).toBe("left");
        expect(position.tailCorner).toBe("bottom-right");
        expect(position.left).toBe(310 + DOT_SIZE / 2 - DOT_SIZE / 2 - 10 - position.width);
    });

    it("clamps the bubble inside the viewport when no side fully fits", () => {
        vi.stubGlobal("innerWidth", 320);
        vi.stubGlobal("innerHeight", 260);

        const position = getDraftPopoverPosition(
            { left: 150, top: 110 },
            {
                viewportWidth: 320,
                viewportHeight: 260,
            },
        );

        expect(position.left).toBeGreaterThanOrEqual(DRAFT_POPOVER_MARGIN);
        expect(position.top).toBeGreaterThanOrEqual(DRAFT_POPOVER_MARGIN);
        expect(position.left + position.width).toBeLessThanOrEqual(320 - DRAFT_POPOVER_MARGIN);
        expect(position.top + DRAFT_POPOVER_HEIGHT).toBeLessThanOrEqual(260 - DRAFT_POPOVER_MARGIN);
    });

    it("uses a narrower width on small viewports", () => {
        const position = getDraftPopoverPosition(
            { left: 40, top: 80 },
            {
                viewportWidth: 260,
                viewportHeight: 640,
            },
        );

        expect(position.width).toBe(260 - DRAFT_POPOVER_MARGIN * 2);
    });
});

describe("getTooltipPosition", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("clamps tooltip within the viewport", () => {
        vi.stubGlobal("innerWidth", 400);

        const position = getTooltipPosition({ left: 380, top: 200 }, false);

        expect(position.left).toBe(400 - 260 - 16);
        expect(position.top).toBe(200 - 104);
        expect(position.width).toBe(260);
    });
});

describe("resolveTooltipAnchor", () => {
    it("returns the marker that matches the selected report id", () => {
        const report = createStoredReport({ id: "selected" });
        const markers = [
            { id: "other", left: 0, top: 0, rect: null, report: createStoredReport({ id: "other" }) },
            { id: "selected", left: 1, top: 2, rect: null, report },
        ];

        expect(resolveTooltipAnchor(markers, "selected")?.report.id).toBe("selected");
        expect(resolveTooltipAnchor(markers, null)).toBeNull();
    });
});
