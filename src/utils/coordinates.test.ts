import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DOT_SIZE } from "@/constants/report.js";
import type { ReportFeedback } from "@/types/report.js";
import {
    clampRatio,
    DRAFT_POPOVER_HEIGHT,
    DRAFT_POPOVER_MARGIN,
    DRAFT_POPOVER_VERTICAL_NUDGE,
    DRAFT_POPOVER_WIDTH,
    getDraftMarkerPosition,
    getDraftPopoverPosition,
    getMarkerFromReport,
    getTooltipPosition,
    resolveMarkerOverflowHints,
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
        expect(marker.detached).toBe(false);
        expect(marker.clampedEdge).toBeNull();
        expect(marker.clampBounds).toBeNull();
        expect(marker.clampContainerId).toBeNull();
        expect(marker.left).toBe(100 + 200 * 0.25 - DOT_SIZE / 2);
        expect(marker.top).toBe(80 + 100 * 0.75 - DOT_SIZE / 2);
    });

    it("anchors to id-only item targets", () => {
        const target = document.createElement("button");
        target.dataset.reportId = "hero-cta";
        document.body.append(target);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 40,
            top: 60,
            width: 120,
            height: 40,
            right: 160,
            bottom: 100,
            x: 40,
            y: 60,
            toJSON: () => ({}),
        } as DOMRect);

        const marker = getMarkerFromReport(
            createStoredReport({
                report_id: "hero-cta",
                report_type: "item",
                element_x_ratio: 0.5,
                element_y_ratio: 0.5,
            }),
            0,
        );

        expect(marker.rect).not.toBeNull();
        expect(marker.detached).toBe(false);
        expect(marker.clampBounds).toBeNull();
        expect(marker.left).toBe(40 + 120 * 0.5 - DOT_SIZE / 2);
        expect(marker.top).toBe(60 + 40 * 0.5 - DOT_SIZE / 2);
    });

    it("falls back to document coordinates when the target element is missing", () => {
        const marker = getMarkerFromReport(createStoredReport({ document_y: 220 }), 20);

        expect(marker.rect).toBeNull();
        expect(marker.detached).toBe(true);
        expect(marker.clampBounds).toBeNull();
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

    it("falls back to document coordinates when the target element is hidden", () => {
        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "group";
        target.style.display = "none";
        document.body.append(target);

        const marker = getMarkerFromReport(createStoredReport({ document_y: 220 }), 20);

        expect(marker.rect).toBeNull();
        expect(marker.detached).toBe(true);
        expect(marker.clampBounds).toBeNull();
        expect(marker.top).toBe(220 - 20 - DOT_SIZE / 2);
    });

    it("scrolls detached markers with the document when a hidden target has no layout box", () => {
        vi.stubGlobal("innerWidth", 1000);
        vi.stubGlobal("innerHeight", 800);

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.display = "none";

        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "group";
        overlay.append(target);
        document.body.append(overlay);

        const markerAtRest = getMarkerFromReport(
            createStoredReport({
                document_y: 900,
            }),
            100,
        );
        const markerAfterScroll = getMarkerFromReport(
            createStoredReport({
                document_y: 900,
            }),
            400,
        );

        expect(markerAtRest.detached).toBe(true);
        expect(markerAtRest.clampBounds).toBeNull();
        expect(markerAtRest.top).toBe(900 - 100 - DOT_SIZE / 2);
        expect(markerAfterScroll.top).toBe(900 - 400 - DOT_SIZE / 2);
        expect(markerAfterScroll.top).not.toBe(markerAtRest.top);
    });

    it("uses document coordinates for opacity-hidden fixed targets instead of live rect", () => {
        vi.stubGlobal("innerWidth", 1000);
        vi.stubGlobal("innerHeight", 800);

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";

        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "group";
        target.style.opacity = "0";
        overlay.append(target);
        document.body.append(overlay);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 120,
            top: 180,
            width: 240,
            height: 120,
            right: 360,
            bottom: 300,
            x: 120,
            y: 180,
            toJSON: () => ({}),
        } as DOMRect);

        const marker = getMarkerFromReport(
            createStoredReport({
                document_y: 620,
                viewport_width: 1000,
                x_ratio: 0.5,
            }),
            200,
        );

        expect(marker.detached).toBe(true);
        expect(marker.clampBounds).toBeNull();
        expect(marker.top).toBe(620 - 200 - DOT_SIZE / 2);
        expect(marker.top).not.toBe(180 + 120 * 0.75 - DOT_SIZE / 2);
    });

    it("scales detached horizontal position when the viewport width changes", () => {
        const report = createStoredReport({
            x_ratio: 0.5,
            viewport_width: 1000,
            document_y: 300,
        });

        vi.stubGlobal("innerWidth", 1000);
        const markerAtFullWidth = getMarkerFromReport(report, 0);

        vi.stubGlobal("innerWidth", 500);
        const markerAtHalfWidth = getMarkerFromReport(report, 0);

        expect(markerAtFullWidth.left).toBe(1000 * 0.5 - DOT_SIZE / 2);
        expect(markerAtHalfWidth.left).toBe(500 * 0.5 - DOT_SIZE / 2);
    });

    it("anchors detached markers to a document-flow parent section", () => {
        document.body.innerHTML = `
            <section data-report-id="modal-demo" data-report-type="group">
                <div style="position: fixed; display: none">
                    <div data-report-id="modal-target" data-report-type="item">target</div>
                </div>
            </section>
        `;

        const section = document.querySelector<HTMLElement>('[data-report-id="modal-demo"]')!;

        vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
            left: 80,
            top: 320,
            width: 640,
            height: 220,
            right: 720,
            bottom: 540,
            x: 80,
            y: 320,
            toJSON: () => ({}),
        } as DOMRect);

        const marker = getMarkerFromReport(
            createStoredReport({
                report_id: "modal-target",
                report_type: "item",
                anchor_report_id: "modal-demo",
                anchor_report_type: "group",
                anchor_x_ratio: 0.5,
                anchor_y_ratio: 0.5,
                document_y: 9999,
            }),
            0,
        );

        expect(marker.detached).toBe(true);
        expect(marker.clampBounds).toBeNull();
        expect(marker.left).toBe(80 + 640 * 0.5 - DOT_SIZE / 2);
        expect(marker.top).toBe(320 + 220 * 0.5 - DOT_SIZE / 2);
    });

    it("clamps marker to the top edge of a scroll container when the target scrolls above it", () => {
        const scrollContainer = document.createElement("div");
        scrollContainer.style.overflowY = "auto";
        Object.defineProperty(scrollContainer, "scrollHeight", { configurable: true, value: 1000 });
        Object.defineProperty(scrollContainer, "clientHeight", { configurable: true, value: 300 });

        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "group";
        scrollContainer.append(target);
        document.body.append(scrollContainer);

        vi.spyOn(scrollContainer, "getBoundingClientRect").mockReturnValue({
            left: 50,
            top: 100,
            width: 300,
            height: 300,
            right: 350,
            bottom: 400,
            x: 50,
            y: 100,
            toJSON: () => ({}),
        } as DOMRect);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 60,
            top: 40,
            width: 200,
            height: 80,
            right: 260,
            bottom: 120,
            x: 60,
            y: 40,
            toJSON: () => ({}),
        } as DOMRect);

        const marker = getMarkerFromReport(createStoredReport({ element_y_ratio: 0.5 }), 0);

        expect(marker.clampedEdge).toBe("top");
        expect(marker.clampBounds).toEqual({ left: 50, top: 100, right: 350, bottom: 400 });
        expect(marker.clampContainerId).toBeTruthy();
        expect(marker.top).toBe(100 - DOT_SIZE / 2);
    });

    it("clamps marker to the bottom edge of a scroll container when the target scrolls below it", () => {
        const scrollContainer = document.createElement("div");
        scrollContainer.style.overflowY = "auto";
        Object.defineProperty(scrollContainer, "scrollHeight", { configurable: true, value: 1000 });
        Object.defineProperty(scrollContainer, "clientHeight", { configurable: true, value: 300 });

        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "group";
        scrollContainer.append(target);
        document.body.append(scrollContainer);

        vi.spyOn(scrollContainer, "getBoundingClientRect").mockReturnValue({
            left: 50,
            top: 100,
            width: 300,
            height: 300,
            right: 350,
            bottom: 400,
            x: 50,
            y: 100,
            toJSON: () => ({}),
        } as DOMRect);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 60,
            top: 430,
            width: 200,
            height: 80,
            right: 260,
            bottom: 510,
            x: 60,
            y: 430,
            toJSON: () => ({}),
        } as DOMRect);

        const marker = getMarkerFromReport(createStoredReport({ element_y_ratio: 0.5 }), 0);

        expect(marker.clampedEdge).toBe("bottom");
        expect(marker.clampBounds).toEqual({ left: 50, top: 100, right: 350, bottom: 400 });
        expect(marker.clampContainerId).toBeTruthy();
        expect(marker.top).toBe(400 - DOT_SIZE / 2);
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
        expect(position.clampedEdge).toBeNull();
        expect(position.clampBounds).toBeNull();
    });

    it("falls back to viewport click coordinates when no target is selected", () => {
        const position = getDraftMarkerPosition({ clientX: 240, clientY: 180, elementXRatio: 0, elementYRatio: 0 }, null);

        expect(position.left).toBe(240 - DOT_SIZE / 2);
        expect(position.top).toBe(180 - DOT_SIZE / 2);
        expect(position.clampedEdge).toBeNull();
        expect(position.clampBounds).toBeNull();
    });

    it("clamps draft marker to the scroll container edge when the selected target is outside it", () => {
        const scrollContainer = document.createElement("div");
        scrollContainer.style.overflowY = "auto";
        Object.defineProperty(scrollContainer, "scrollHeight", { configurable: true, value: 1000 });
        Object.defineProperty(scrollContainer, "clientHeight", { configurable: true, value: 300 });

        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "item";
        scrollContainer.append(target);
        document.body.append(scrollContainer);

        vi.spyOn(scrollContainer, "getBoundingClientRect").mockReturnValue({
            left: 50,
            top: 100,
            width: 300,
            height: 300,
            right: 350,
            bottom: 400,
            x: 50,
            y: 100,
            toJSON: () => ({}),
        } as DOMRect);

        const position = getDraftMarkerPosition(
            { clientX: 0, clientY: 0, elementXRatio: 0.5, elementYRatio: 0.5 },
            {
                id: "hero",
                type: "item",
                rect: {
                    left: 60,
                    top: 40,
                    width: 200,
                    height: 80,
                    right: 260,
                    bottom: 120,
                    x: 60,
                    y: 40,
                    toJSON: () => ({}),
                } as DOMRect,
            },
        );

        expect(position.clampedEdge).toBe("top");
        expect(position.clampBounds).toEqual({ left: 50, top: 100, right: 350, bottom: 400 });
        expect(position.clampContainerId).toBeTruthy();
        expect(position.top).toBe(100 - DOT_SIZE / 2);
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
        expect(position.centerVertically).toBe(true);
        expect(position.tailCorner).toBe("bottom-left");
        expect(position.left).toBe(200 + DOT_SIZE / 2 + DOT_SIZE / 2 + 10);
        expect(position.anchorCenterY).toBe(300 + DOT_SIZE / 2 - DRAFT_POPOVER_VERTICAL_NUDGE);
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
        vi.stubGlobal("innerHeight", 320);

        const position = getDraftPopoverPosition(
            { left: 150, top: 110 },
            {
                viewportWidth: 320,
                viewportHeight: 320,
            },
        );

        expect(position.left).toBeGreaterThanOrEqual(DRAFT_POPOVER_MARGIN);
        expect(position.left + position.width).toBeLessThanOrEqual(320 - DRAFT_POPOVER_MARGIN);

        if (position.centerVertically && position.anchorCenterY !== undefined) {
            expect(position.anchorCenterY - DRAFT_POPOVER_HEIGHT / 2).toBeGreaterThanOrEqual(DRAFT_POPOVER_MARGIN);
            expect(position.anchorCenterY + DRAFT_POPOVER_HEIGHT / 2).toBeLessThanOrEqual(320 - DRAFT_POPOVER_MARGIN);
        } else {
            expect(position.top).toBeGreaterThanOrEqual(DRAFT_POPOVER_MARGIN);
            expect(position.top! + DRAFT_POPOVER_HEIGHT).toBeLessThanOrEqual(320 - DRAFT_POPOVER_MARGIN);
        }
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
        vi.stubGlobal("innerHeight", 800);

        const position = getTooltipPosition({ left: 380, top: 200 }, false);

        expect(position.left).toBe(400 - 260 - 16);
        expect(position.top).toBe(200 - DOT_SIZE / 2 - 16);
        expect(position.width).toBe(260);
        expect(position.placement).toBe("above");
    });

    it("anchors expanded tooltip bottom above marker top", () => {
        vi.stubGlobal("innerHeight", 800);

        const position = getTooltipPosition({ left: 100, top: 200 }, true);

        expect(position.top).toBe(200 - DOT_SIZE / 2 - 16);
        expect(position.width).toBe(320);
        expect(position.placement).toBe("above");
    });

    it("flips tooltip below marker when there is not enough space above", () => {
        vi.stubGlobal("innerHeight", 800);

        const position = getTooltipPosition({ left: 100, top: 10 }, false, { height: 140 });

        expect(position.placement).toBe("below");
        expect(position.top).toBe(10 + DOT_SIZE / 2 + 16);
    });

    it("keeps unmeasured tooltips above unless the marker hugs the top edge", () => {
        vi.stubGlobal("innerHeight", 800);

        expect(getTooltipPosition({ left: 100, top: 200 }, true).placement).toBe("above");
        expect(getTooltipPosition({ left: 100, top: 10 }, true).placement).toBe("below");
    });

    it("clamps above tooltip when it still overflows the top edge", () => {
        vi.stubGlobal("innerHeight", 800);

        const position = getTooltipPosition({ left: 100, top: 40 }, false, { height: 200, placement: "above" });

        expect(position.placement).toBe("above");
        expect(position.top).toBe(16 + 200);
    });
});

describe("resolveMarkerOverflowHints", () => {
    it("groups clamped markers by container and edge with counts", () => {
        const bounds = { left: 50, top: 100, right: 350, bottom: 400 };
        const markers = [
            {
                id: "a",
                left: 0,
                top: 0,
                rect: null,
                detached: false,
                clampedEdge: "top" as const,
                clampBounds: bounds,
                clampContainerId: "container-1",
                report: createStoredReport({ id: "a" }),
            },
            {
                id: "b",
                left: 0,
                top: 0,
                rect: null,
                detached: false,
                clampedEdge: "top" as const,
                clampBounds: bounds,
                clampContainerId: "container-1",
                report: createStoredReport({ id: "b" }),
            },
            {
                id: "c",
                left: 0,
                top: 0,
                rect: null,
                detached: false,
                clampedEdge: "bottom" as const,
                clampBounds: bounds,
                clampContainerId: "container-1",
                report: createStoredReport({ id: "c" }),
            },
            {
                id: "d",
                left: 10,
                top: 10,
                rect: null,
                detached: false,
                clampedEdge: null,
                clampBounds: null,
                clampContainerId: null,
                report: createStoredReport({ id: "d" }),
            },
        ];

        const hints = resolveMarkerOverflowHints(markers);

        expect(hints).toHaveLength(2);
        expect(hints.find((hint) => hint.edge === "top")?.count).toBe(2);
        expect(hints.find((hint) => hint.edge === "bottom")?.count).toBe(1);
        expect(hints.find((hint) => hint.edge === "top")?.left).toBe(200);
        expect(hints.find((hint) => hint.edge === "bottom")?.top).toBe(390);
    });
});

describe("resolveTooltipAnchor", () => {
    it("returns the marker that matches the selected report id", () => {
        const report = createStoredReport({ id: "selected" });
        const markers = [
            { id: "other", left: 0, top: 0, rect: null, detached: true, clampedEdge: null, clampBounds: null, clampContainerId: null, report: createStoredReport({ id: "other" }) },
            { id: "selected", left: 1, top: 2, rect: null, detached: false, clampedEdge: null, clampBounds: null, clampContainerId: null, report },
        ];

        expect(resolveTooltipAnchor(markers, "selected")?.report.id).toBe("selected");
        expect(resolveTooltipAnchor(markers, null)).toBeNull();
    });
});
