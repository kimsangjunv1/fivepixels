import { describe, expect, it, vi } from "vitest";
import { escapeAttribute, findTargetElement, getFeedbackTargetSelector, getNearestScrollContainer, hasFixedPositionAncestor, isFeedbackTargetVisible, resolveFeedbackDocumentAnchor, resolveReportType, toSnapshot } from "./dom.js";

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

describe("isFeedbackTargetVisible", () => {
    it("returns false for display:none elements", () => {
        const target = document.createElement("div");
        target.dataset.reportId = "hero";
        target.style.display = "none";
        document.body.append(target);

        expect(isFeedbackTargetVisible(target)).toBe(false);
    });

    it("returns true for visible elements with size", () => {
        const target = document.createElement("div");
        target.dataset.reportId = "hero";
        document.body.append(target);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 100,
            height: 40,
            right: 100,
            bottom: 40,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect);

        expect(isFeedbackTargetVisible(target)).toBe(true);
    });

    it("returns false when a parent hides the target with opacity", () => {
        const overlay = document.createElement("div");
        overlay.style.opacity = "0";

        const target = document.createElement("div");
        target.dataset.reportId = "hero";
        overlay.append(target);
        document.body.append(overlay);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: 100,
            top: 120,
            width: 200,
            height: 80,
            right: 300,
            bottom: 200,
            x: 100,
            y: 120,
            toJSON: () => ({}),
        } as DOMRect);

        expect(isFeedbackTargetVisible(target)).toBe(false);
    });

    it("returns false when the target is translated off-screen", () => {
        const overlay = document.createElement("div");
        overlay.style.transform = "translateX(-200vw)";

        const target = document.createElement("div");
        target.dataset.reportId = "hero";
        overlay.append(target);
        document.body.append(overlay);

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
            left: -2400,
            top: 120,
            width: 200,
            height: 80,
            right: -2200,
            bottom: 200,
            x: -2400,
            y: 120,
            toJSON: () => ({}),
        } as DOMRect);

        expect(isFeedbackTargetVisible(target)).toBe(false);
    });
});

describe("hasFixedPositionAncestor", () => {
    it("detects fixed ancestors", () => {
        document.body.innerHTML = `
            <div style="position: fixed">
                <div data-report-id="hero">target</div>
            </div>
        `;

        const target = document.querySelector<HTMLElement>("[data-report-id='hero']")!;
        expect(hasFixedPositionAncestor(target)).toBe(true);
    });
});

describe("resolveFeedbackDocumentAnchor", () => {
    it("returns the nearest non-fixed report ancestor", () => {
        document.body.innerHTML = `
            <section data-report-id="modal-demo" data-report-type="group">
                <div class="overlay" style="position: fixed">
                    <div data-report-id="modal-target" data-report-type="item">target</div>
                </div>
            </section>
        `;

        const target = document.querySelector<HTMLElement>('[data-report-id="modal-target"]')!;
        const anchor = resolveFeedbackDocumentAnchor(target);

        expect(anchor?.id).toBe("modal-demo");
        expect(anchor?.type).toBe("group");
    });
});

describe("getNearestScrollContainer", () => {
    it("returns the nearest ancestor with scrollable overflow", () => {
        document.body.innerHTML = `
            <div id="outer" style="overflow-y: auto; height: 200px">
                <div id="inner" style="overflow-y: auto; height: 120px">
                    <section data-report-id="hero">target</section>
                </div>
            </div>
        `;

        const outer = document.getElementById("outer")!;
        const inner = document.getElementById("inner")!;
        const target = document.querySelector<HTMLElement>("[data-report-id='hero']")!;

        Object.defineProperty(outer, "scrollHeight", { configurable: true, value: 400 });
        Object.defineProperty(outer, "clientHeight", { configurable: true, value: 200 });
        Object.defineProperty(inner, "scrollHeight", { configurable: true, value: 300 });
        Object.defineProperty(inner, "clientHeight", { configurable: true, value: 120 });

        expect(getNearestScrollContainer(target)?.id).toBe("inner");
    });

    it("returns null when no scrollable ancestor exists", () => {
        const target = document.createElement("section");
        target.dataset.reportId = "hero";
        document.body.append(target);

        expect(getNearestScrollContainer(target)).toBeNull();
    });
});
