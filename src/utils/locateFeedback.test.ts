import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFeedbackTargetElement, scrollToFeedbackTarget } from "./locateFeedback.js";

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

        const result = scrollToFeedbackTarget({ report_id: "hero", report_type: "group", scroll_y: 120 });

        expect(scrollIntoView).toHaveBeenCalledWith({ block: "center", inline: "nearest", behavior: "smooth" });
        expect(window.scrollTo).not.toHaveBeenCalled();
        expect(result.foundElement).toBe(true);
        expect(result.targetElement).toBe(target);
    });

    it("falls back to scroll_y when the target element is missing", () => {
        const result = scrollToFeedbackTarget({ report_id: "hero", report_type: "group", scroll_y: 240 });

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 240, behavior: "smooth" });
        expect(result.foundElement).toBe(false);
        expect(result.targetElement).toBeNull();
    });
});
