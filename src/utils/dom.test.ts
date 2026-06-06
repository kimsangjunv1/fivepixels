import { describe, expect, it } from "vitest";
import { escapeAttribute, findTargetElement, getFeedbackTargetSelector, resolveReportType, toSnapshot } from "./dom.js";

describe("escapeAttribute", () => {
    it("escapes backslashes and double quotes for selector safety", () => {
        expect(escapeAttribute('hero"cta')).toBe('hero\\"cta');
        expect(escapeAttribute("path\\to")).toBe("path\\\\to");
    });
});

describe("resolveReportType", () => {
    it("returns group only when data-report-type is group", () => {
        const group = document.createElement("section");
        group.dataset.reportId = "hero";
        group.dataset.reportType = "group";
        expect(resolveReportType(group)).toBe("group");

        const item = document.createElement("button");
        item.dataset.reportId = "hero-cta";
        expect(resolveReportType(item)).toBe("item");

        const explicitItem = document.createElement("button");
        explicitItem.dataset.reportId = "hero-cta";
        explicitItem.dataset.reportType = "item";
        expect(resolveReportType(explicitItem)).toBe("item");

        const invalid = document.createElement("div");
        invalid.dataset.reportId = "hero";
        invalid.dataset.reportType = "invalid";
        expect(resolveReportType(invalid)).toBe("item");
    });
});

describe("getFeedbackTargetSelector", () => {
    it("builds selectors for group and default item targets", () => {
        expect(getFeedbackTargetSelector("hero", "group")).toBe('[data-report-id="hero"][data-report-type="group"]');
        expect(getFeedbackTargetSelector("hero-cta", "item")).toBe(
            '[data-report-id="hero-cta"]:not([data-report-type="group"])',
        );
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

    it("treats id-only targets as item and prefers the nearest nested id", () => {
        document.body.innerHTML = `
            <div data-report-id="test">
                <div data-report-id="test2">
                    <div data-report-id="test3">nested</div>
                </div>
            </div>
        `;

        const inner = document.querySelector<HTMLElement>('[data-report-id="test3"]')!;
        const middle = document.querySelector<HTMLElement>('[data-report-id="test2"]')!;
        const outer = document.querySelector<HTMLElement>('[data-report-id="test"]')!;

        expect(findTargetElement(inner)?.dataset.reportId).toBe("test3");
        expect(findTargetElement(middle)?.dataset.reportId).toBe("test2");
        expect(findTargetElement(outer)?.dataset.reportId).toBe("test");
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
    it("returns null when report_id is missing", () => {
        expect(toSnapshot(document.createElement("div"))).toBeNull();
    });

    it("defaults to item when report_type is missing or invalid", () => {
        const withoutType = document.createElement("div");
        withoutType.dataset.reportId = "hero";
        expect(toSnapshot(withoutType)?.type).toBe("item");

        const invalid = document.createElement("div");
        invalid.dataset.reportId = "hero";
        invalid.dataset.reportType = "invalid";
        expect(toSnapshot(invalid)?.type).toBe("item");
    });
});
