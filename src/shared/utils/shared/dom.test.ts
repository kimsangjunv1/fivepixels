import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { escapeAttribute, findPickTargetByPoint, findTargetByPoint, findTargetElement, getFeedbackTargetSelector, getNearestScrollContainer, hasFixedPositionAncestor, hasDirectReportId, isFeedbackTargetVisible, resolveFeedbackDocumentAnchor, resolveReportType, toFeedbackHoverSnapshot, toSnapshot } from "./dom.js";

describe("escapeAttribute", () => {
    it("escapes backslashes and double quotes for selector safety", () => {
        expect(escapeAttribute('hero"cta')).toBe('hero\\"cta');
        expect(escapeAttribute("path\\to")).toBe("path\\\\to");
    });
});

describe("resolveReportType", () => {
    it("returns group only when data-fp-type is group", () => {
        const group = document.createElement("section");
        group.dataset.fpId = "hero";
        group.dataset.fpType = "group";
        expect(resolveReportType(group)).toBe("group");

        const item = document.createElement("button");
        item.dataset.fpId = "hero-cta";
        expect(resolveReportType(item)).toBe("item");

        const explicitItem = document.createElement("button");
        explicitItem.dataset.fpId = "hero-cta";
        explicitItem.dataset.fpType = "item";
        expect(resolveReportType(explicitItem)).toBe("item");

        const invalid = document.createElement("div");
        invalid.dataset.fpId = "hero";
        invalid.dataset.fpType = "invalid";
        expect(resolveReportType(invalid)).toBe("item");
    });
});

describe("getFeedbackTargetSelector", () => {
    it("builds selectors for group and default item targets", () => {
        expect(getFeedbackTargetSelector("hero", "group")).toBe('[data-fp-id="hero"][data-fp-type="group"]');
        expect(getFeedbackTargetSelector("hero-cta", "item")).toBe(
            '[data-fp-id="hero-cta"]:not([data-fp-type="group"])',
        );
    });
});

describe("findTargetElement", () => {
    it("prefers the nearest item target over a parent group", () => {
        document.body.innerHTML = `
            <section data-fp-id="hero" data-fp-type="group">
                <button data-fp-id="hero-cta" data-fp-type="item">CTA</button>
            </section>
        `;

        const button = document.querySelector("button")!;
        expect(findTargetElement(button)?.dataset.fpId).toBe("hero-cta");
        expect(findTargetElement(button)?.dataset.fpType).toBe("item");
    });

    it("treats id-only targets as item and prefers the nearest nested id", () => {
        document.body.innerHTML = `
            <div data-fp-id="test">
                <div data-fp-id="test2">
                    <div data-fp-id="test3">nested</div>
                </div>
            </div>
        `;

        const inner = document.querySelector<HTMLElement>('[data-fp-id="test3"]')!;
        const middle = document.querySelector<HTMLElement>('[data-fp-id="test2"]')!;
        const outer = document.querySelector<HTMLElement>('[data-fp-id="test"]')!;

        expect(findTargetElement(inner)?.dataset.fpId).toBe("test3");
        expect(findTargetElement(middle)?.dataset.fpId).toBe("test2");
        expect(findTargetElement(outer)?.dataset.fpId).toBe("test");
    });

    it("falls back to a group when no item ancestor exists", () => {
        document.body.innerHTML = `
            <section data-fp-id="hero" data-fp-type="group">
                <p>copy</p>
            </section>
        `;

        const paragraph = document.querySelector("p")!;
        expect(findTargetElement(paragraph)?.dataset.fpId).toBe("hero");
    });
});

describe("toSnapshot", () => {
    it("returns null when report_id is missing", () => {
        expect(toSnapshot(document.createElement("div"))).toBeNull();
    });

    it("defaults to item when report_type is missing or invalid", () => {
        const withoutType = document.createElement("div");
        withoutType.dataset.fpId = "hero";
        expect(toSnapshot(withoutType)?.type).toBe("item");
        expect(toSnapshot(withoutType)?.isTagged).toBe(true);

        const invalid = document.createElement("div");
        invalid.dataset.fpId = "hero";
        invalid.dataset.fpType = "invalid";
        expect(toSnapshot(invalid)?.type).toBe("item");
    });
});

describe("toFeedbackHoverSnapshot", () => {
    it("marks tagged and untagged targets", () => {
        const view = document.createElement("div");
        view.dataset.fpView = "checkout-modal";
        const tagged = document.createElement("button");
        tagged.dataset.fpId = "hero-cta";
        tagged.dataset.fpType = "item";
        tagged.dataset.fpOpen = "checkout-modal";
        view.append(tagged);
        document.body.append(view);

        const untagged = document.createElement("button");
        untagged.textContent = "Checkout";
        document.body.append(untagged);

        expect(toFeedbackHoverSnapshot(tagged)?.isTagged).toBe(true);
        expect(toFeedbackHoverSnapshot(tagged)?.fpOpenAttribute).toBe("checkout-modal");
        expect(toFeedbackHoverSnapshot(tagged)?.fpViewAttribute).toBe("checkout-modal");
        expect(toFeedbackHoverSnapshot(untagged)?.isTagged).toBe(false);
        expect(hasDirectReportId(tagged)).toBe(true);
        expect(hasDirectReportId(untagged)).toBe(false);
    });
});

describe("isFeedbackTargetVisible", () => {
    it("returns false for display:none elements", () => {
        const target = document.createElement("div");
        target.dataset.fpId = "hero";
        target.style.display = "none";
        document.body.append(target);

        expect(isFeedbackTargetVisible(target)).toBe(false);
    });

    it("returns true for visible elements with size", () => {
        const target = document.createElement("div");
        target.dataset.fpId = "hero";
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
        target.dataset.fpId = "hero";
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
        target.dataset.fpId = "hero";
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
                <div data-fp-id="hero">target</div>
            </div>
        `;

        const target = document.querySelector<HTMLElement>("[data-fp-id='hero']")!;
        expect(hasFixedPositionAncestor(target)).toBe(true);
    });
});

describe("resolveFeedbackDocumentAnchor", () => {
    it("returns the nearest non-fixed report ancestor", () => {
        document.body.innerHTML = `
            <section data-fp-id="modal-demo" data-fp-type="group">
                <div class="overlay" style="position: fixed">
                    <div data-fp-id="modal-target" data-fp-type="item">target</div>
                </div>
            </section>
        `;

        const target = document.querySelector<HTMLElement>('[data-fp-id="modal-target"]')!;
        const anchor = resolveFeedbackDocumentAnchor(target);

        expect(anchor?.id).toBe("modal-demo");
        expect(anchor?.type).toBe("group");
    });
});

describe("findPickTargetByPoint", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        {
            name: "selects an id-only button from its text",
            markup: '<button data-fp-id="signup"><span>Sign up</span></button>',
            hit: "span",
            target: "button",
        },
        {
            name: "selects an explicit item from its text",
            markup: '<button data-fp-id="signup" data-fp-type="item"><span>Sign up</span></button>',
            hit: "span",
            target: "button",
        },
        {
            name: "selects the group from an untagged heading",
            markup: '<section data-fp-id="card" data-fp-type="group"><h2>Product</h2></section>',
            hit: "h2",
            target: "section",
        },
        {
            name: "selects the group from an untagged button",
            markup: '<section data-fp-id="card" data-fp-type="group"><button>Buy</button></section>',
            hit: "button",
            target: "section",
        },
        {
            name: "selects a tagged item inside a group from its text",
            markup: '<section data-fp-id="card" data-fp-type="group"><button data-fp-id="buy" data-fp-type="item"><span>Buy</span></button></section>',
            hit: "span",
            target: "button",
        },
        {
            name: "selects an id-only item inside a group",
            markup: '<section data-fp-id="card" data-fp-type="group"><button data-fp-id="buy">Buy</button></section>',
            hit: "button",
            target: "button",
        },
        {
            name: "keeps untagged elements individually selectable",
            markup: '<section><p>Product description</p></section>',
            hit: "p",
            target: "p",
        },
    ])("$name", ({ markup, hit, target }) => {
        document.body.innerHTML = markup;
        const hitElement = document.querySelector<HTMLElement>(hit)!;
        const targetElement = document.querySelector<HTMLElement>(target)!;
        const overlay = document.createElement("div");
        overlay.style.pointerEvents = "auto";

        for (const element of document.querySelectorAll<HTMLElement>("body *")) {
            vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
                left: 0, top: 0, width: 100, height: 40,
                right: 100, bottom: 40, x: 0, y: 0,
                toJSON: () => ({}),
            } as DOMRect);
        }

        document.elementsFromPoint = vi.fn(() => [hitElement, targetElement, document.body]);

        expect(findPickTargetByPoint(overlay, 10, 10)).toBe(targetElement);
        expect(overlay.style.pointerEvents).toBe("auto");
    });
});

describe("findTargetByPoint", () => {
    function mockFullViewportRect(element: HTMLElement) {
        vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            right: window.innerWidth,
            bottom: window.innerHeight,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect);
    }

    function mockElementsFromPoint(elements: HTMLElement[]) {
        document.elementsFromPoint = vi.fn(() => elements) as typeof document.elementsFromPoint;
    }

    beforeEach(() => {
        document.elementsFromPoint = vi.fn(() => []) as typeof document.elementsFromPoint;
    });

    it("skips hidden overlays and selects the visible modal target below", () => {
        document.body.innerHTML = `
            <div
                data-fp-id="modal-overlay-hidden"
                style="position: fixed; inset: 0; opacity: 0;"
                aria-hidden="true"
            >
                <div data-fp-id="modal-hidden-target">hidden</div>
            </div>
            <div data-fp-id="modal-overlay-visible" style="position: fixed; inset: 0;">
                <div data-fp-id="modal-visible-target">visible</div>
            </div>
        `;

        const hiddenOverlay = document.querySelector<HTMLElement>('[data-fp-id="modal-overlay-hidden"]')!;
        const hiddenTarget = document.querySelector<HTMLElement>('[data-fp-id="modal-hidden-target"]')!;
        const visibleOverlay = document.querySelector<HTMLElement>('[data-fp-id="modal-overlay-visible"]')!;
        const visibleTarget = document.querySelector<HTMLElement>('[data-fp-id="modal-visible-target"]')!;
        const overlay = document.createElement("div");

        mockFullViewportRect(hiddenOverlay);
        mockFullViewportRect(visibleOverlay);
        mockFullViewportRect(visibleTarget);

        mockElementsFromPoint([hiddenTarget, hiddenOverlay, visibleTarget, visibleOverlay, document.body]);

        const result = findTargetByPoint(overlay, window.innerWidth / 2, window.innerHeight / 2);

        expect(result?.dataset.fpId).toBe("modal-visible-target");
    });

    it("skips aria-hidden overlays that still participate in hit testing", () => {
        document.body.innerHTML = `
            <div
                data-fp-id="modal-overlay-closed"
                style="position: fixed; inset: 0;"
                aria-hidden="true"
            >
                <div data-fp-id="modal-closed-target">closed</div>
            </div>
            <div data-fp-id="modal-overlay-open" style="position: fixed; inset: 0;" aria-hidden="false">
                <div data-fp-id="modal-open-target">open</div>
            </div>
        `;

        const closedOverlay = document.querySelector<HTMLElement>('[data-fp-id="modal-overlay-closed"]')!;
        const closedTarget = document.querySelector<HTMLElement>('[data-fp-id="modal-closed-target"]')!;
        const openOverlay = document.querySelector<HTMLElement>('[data-fp-id="modal-overlay-open"]')!;
        const openTarget = document.querySelector<HTMLElement>('[data-fp-id="modal-open-target"]')!;
        const overlay = document.createElement("div");

        mockFullViewportRect(closedOverlay);
        mockFullViewportRect(openOverlay);
        mockFullViewportRect(openTarget);

        mockElementsFromPoint([closedTarget, closedOverlay, openTarget, openOverlay, document.body]);

        const result = findTargetByPoint(overlay, window.innerWidth / 2, window.innerHeight / 2);

        expect(result?.dataset.fpId).toBe("modal-open-target");
    });

    it("returns null when every stacked report target is hidden", () => {
        document.body.innerHTML = `
            <div data-fp-id="modal-overlay-hidden" style="position: fixed; inset: 0; display: none;">
                <div data-fp-id="modal-hidden-target">hidden</div>
            </div>
        `;

        const hiddenTarget = document.querySelector<HTMLElement>('[data-fp-id="modal-hidden-target"]')!;
        const hiddenOverlay = document.querySelector<HTMLElement>('[data-fp-id="modal-overlay-hidden"]')!;
        const overlay = document.createElement("div");

        mockFullViewportRect(hiddenOverlay);
        mockElementsFromPoint([hiddenTarget, hiddenOverlay, document.body]);

        const result = findTargetByPoint(overlay, window.innerWidth / 2, window.innerHeight / 2);

        expect(result).toBeNull();
    });

    it("does not select page targets below a fixed modal backdrop without report-id", () => {
        document.body.innerHTML = `
            <button data-fp-id="page-target" data-fp-type="item">page</button>
            <div class="modal-backdrop" style="position: fixed; inset: 0;"></div>
        `;

        const pageTarget = document.querySelector<HTMLElement>('[data-fp-id="page-target"]')!;
        const modalBackdrop = document.querySelector<HTMLElement>(".modal-backdrop")!;
        const overlay = document.createElement("div");

        mockFullViewportRect(pageTarget);
        mockFullViewportRect(modalBackdrop);
        mockElementsFromPoint([modalBackdrop, pageTarget, document.body]);

        const result = findTargetByPoint(overlay, window.innerWidth / 2, window.innerHeight / 2);

        expect(result).toBeNull();
    });

    it("selects a modal overlay group instead of page targets below the backdrop", () => {
        document.body.innerHTML = `
            <button data-fp-id="page-target" data-fp-type="item">page</button>
            <div
                data-fp-id="modal-overlay-open"
                data-fp-type="group"
                style="position: fixed; inset: 0;"
                aria-hidden="false"
            >
                <div data-fp-id="modal-open-target" data-fp-type="item">open</div>
            </div>
        `;

        const pageTarget = document.querySelector<HTMLElement>('[data-fp-id="page-target"]')!;
        const openOverlay = document.querySelector<HTMLElement>('[data-fp-id="modal-overlay-open"]')!;
        const overlay = document.createElement("div");

        mockFullViewportRect(pageTarget);
        mockFullViewportRect(openOverlay);
        mockElementsFromPoint([openOverlay, pageTarget, document.body]);

        const result = findTargetByPoint(overlay, window.innerWidth / 2, window.innerHeight / 2);

        expect(result?.dataset.fpId).toBe("modal-overlay-open");
        expect(result?.dataset.fpType).toBe("group");
    });
});

describe("getNearestScrollContainer", () => {
    it("returns the nearest ancestor with scrollable overflow", () => {
        document.body.innerHTML = `
            <div id="outer" style="overflow-y: auto; height: 200px">
                <div id="inner" style="overflow-y: auto; height: 120px">
                    <section data-fp-id="hero">target</section>
                </div>
            </div>
        `;

        const outer = document.getElementById("outer")!;
        const inner = document.getElementById("inner")!;
        const target = document.querySelector<HTMLElement>("[data-fp-id='hero']")!;

        Object.defineProperty(outer, "scrollHeight", { configurable: true, value: 400 });
        Object.defineProperty(outer, "clientHeight", { configurable: true, value: 200 });
        Object.defineProperty(inner, "scrollHeight", { configurable: true, value: 300 });
        Object.defineProperty(inner, "clientHeight", { configurable: true, value: 120 });

        expect(getNearestScrollContainer(target)?.id).toBe("inner");
    });

    it("returns null when no scrollable ancestor exists", () => {
        const target = document.createElement("section");
        target.dataset.fpId = "hero";
        document.body.append(target);

        expect(getNearestScrollContainer(target)).toBeNull();
    });
});
