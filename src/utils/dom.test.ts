import { describe, expect, it } from "vitest";
import { escapeAttribute, findTargetElement, toSnapshot } from "./dom.js";

describe("escapeAttribute", () => {
    it("escapes backslashes and double quotes for selector safety", () => {
        expect(escapeAttribute('hero"cta')).toBe('hero\\"cta');
        expect(escapeAttribute("path\\to")).toBe("path\\\\to");
    });
});

describe("findTargetElement", () => {
    it("prefers the nearest item target over a parent group", () => {
        document.body.innerHTML = `
            <section data-report-id="hero" data-report-type="group">
                <button data-report-id="hero-cta" data-report-type="item">CTA</button>
            </section>
        `;

        const button = document.querySelector("button")!;
        expect(findTargetElement(button)?.dataset.reportId).toBe("hero-cta");
        expect(findTargetElement(button)?.dataset.reportType).toBe("item");
    });

    it("falls back to a group when no item ancestor exists", () => {
        document.body.innerHTML = `
            <section data-report-id="hero" data-report-type="group">
                <p>copy</p>
            </section>
        `;

        const paragraph = document.querySelector("p")!;
        expect(findTargetElement(paragraph)?.dataset.reportId).toBe("hero");
    });
});

describe("toSnapshot", () => {
    it("returns null when dataset attributes are missing or invalid", () => {
        const invalid = document.createElement("div");
        invalid.dataset.reportId = "hero";
        invalid.dataset.reportType = "invalid";

        expect(toSnapshot(invalid)).toBeNull();
    });
});
