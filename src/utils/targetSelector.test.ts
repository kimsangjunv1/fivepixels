import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    buildReportIdAttributeSnippet,
    createAutoPickReportId,
    findElementByTargetSelector,
    generateCssSelector,
    generateSuggestedReportId,
    isAutoPickReportId,
    isPickableElement,
    resolveTargetBinding,
} from "./targetSelector.js";

describe("targetSelector", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("generates a stable selector from id and data-testid", () => {
        document.body.innerHTML = `
            <section id="pricing">
                <button data-testid="checkout-button">Checkout</button>
            </section>
        `;

        const button = document.querySelector<HTMLElement>("[data-testid='checkout-button']")!;

        expect(generateCssSelector(button)).toBe('button[data-testid="checkout-button"]');
        expect(generateSuggestedReportId(button)).toBe("checkout-button");
    });

    it("creates auto pick ids from selector hash", () => {
        const selector = "section > button:nth-of-type(1)";
        const reportId = createAutoPickReportId(selector);

        expect(isAutoPickReportId(reportId)).toBe(true);
        expect(createAutoPickReportId(selector)).toBe(reportId);
    });

    it("builds report id snippet for developers", () => {
        expect(buildReportIdAttributeSnippet("hero-cta", "item")).toBe('data-report-id="hero-cta" data-report-type="item"');
    });

    it("resolves feedback targets via selector before report id", () => {
        document.body.innerHTML = `
            <button data-testid="hero-cta">CTA</button>
        `;

        const button = document.querySelector<HTMLElement>("button")!;
        vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
            left: 10,
            top: 20,
            width: 100,
            height: 40,
            right: 110,
            bottom: 60,
            x: 10,
            y: 20,
            toJSON: () => ({}),
        } as DOMRect);
        const selector = generateCssSelector(button);

        expect(resolveTargetBinding({
            report_id: "missing-id",
            report_type: "item",
            target_selector: selector,
        }).kind).toBe("selector");

        document.body.innerHTML = `
            <button data-report-id="hero-cta" data-report-type="item">CTA</button>
        `;

        const taggedButton = document.querySelector<HTMLElement>("button")!;
        vi.spyOn(taggedButton, "getBoundingClientRect").mockReturnValue({
            left: 10,
            top: 20,
            width: 100,
            height: 40,
            right: 110,
            bottom: 60,
            x: 10,
            y: 20,
            toJSON: () => ({}),
        } as DOMRect);

        expect(resolveTargetBinding({
            report_id: "hero-cta",
            report_type: "item",
        }).kind).toBe("report-id");
    });

    it("falls back to coordinates when no element is found", () => {
        expect(resolveTargetBinding({
            report_id: "missing-id",
            report_type: "item",
            target_selector: "button.missing",
        }).kind).toBe("coordinates");
    });

    it("skips fivepixels host elements when picking", () => {
        const host = document.createElement("div");
        host.id = "fivepixels-root";
        document.body.append(host);

        expect(isPickableElement(host)).toBe(false);
    });

    it("finds elements by generated selector", () => {
        document.body.innerHTML = `<main><p class="copy">hello</p></main>`;
        const paragraph = document.querySelector<HTMLElement>("p")!;
        const selector = generateCssSelector(paragraph);

        expect(findElementByTargetSelector(selector)?.textContent).toBe("hello");
    });
});
