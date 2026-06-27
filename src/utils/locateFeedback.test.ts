import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReportPosition } from "./reportPosition.js";
import { getFeedbackTargetElement, isFeedbackTargetDetached, scrollToFeedbackTarget } from "./locateFeedback.js";

describe("getFeedbackTargetElement", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("returns the element that matches report_id and report_type", () => {
        const target = document.createElement("button");
        target.dataset.reportId = "hero-cta";
        target.dataset.reportType = "item";
        document.body.append(target);

        const result = getFeedbackTargetElement({ report_id: "hero-cta", report_type: "item" });

        expect(result).toBe(target);
    });

    it("finds id-only targets as item", () => {
        const target = document.createElement("button");
        target.dataset.reportId = "hero-cta";
        document.body.append(target);

        const result = getFeedbackTargetElement({ report_id: "hero-cta", report_type: "item" });

        expect(result).toBe(target);
    });

    it("returns null when no matching element exists", () => {
        expect(getFeedbackTargetElement({ report_id: "missing", report_type: "group" })).toBeNull();
    });
});

describe("isFeedbackTargetDetached", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("returns true when the target element is missing", () => {
        expect(isFeedbackTargetDetached({ report_id: "missing", report_type: "group" })).toBe(true);
    });

    it("returns true when the target element is hidden", () => {
        const target = document.createElement("button");
        target.dataset.reportId = "hero-cta";
        target.style.display = "none";
        document.body.append(target);

        expect(isFeedbackTargetDetached({ report_id: "hero-cta", report_type: "item" })).toBe(true);
    });

    it("returns false when the target element is visible", () => {
        const target = document.createElement("button");
        target.dataset.reportId = "hero-cta";
        document.body.append(target);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 120,
            height: 40,
            right: 120,
            bottom: 40,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect);

        expect(isFeedbackTargetDetached({ report_id: "hero-cta", report_type: "item" })).toBe(false);
    });
});

describe("scrollToFeedbackTarget", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("scrolls the matched element into view", () => {
        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        target.dataset.reportType = "group";
        document.body.append(target);

        const scrollIntoView = vi.fn();
        target.scrollIntoView = scrollIntoView;

        const result = scrollToFeedbackTarget({
            report_id: "hero",
            report_type: "group",
            position: createReportPosition({ scrollY: 120 }),
        });

        expect(scrollIntoView).toHaveBeenCalledWith({ block: "center", inline: "nearest", behavior: "smooth" });
        expect(window.scrollTo).not.toHaveBeenCalled();
        expect(result.foundElement).toBe(true);
        expect(result.targetElement).toBe(target);
    });

    it("falls back to scroll_y when the target element is missing", () => {
        const result = scrollToFeedbackTarget({
            report_id: "hero",
            report_type: "group",
            position: createReportPosition({ scrollY: 240 }),
        });

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 240, behavior: "smooth" });
        expect(result.foundElement).toBe(false);
        expect(result.targetElement).toBeNull();
    });
});
