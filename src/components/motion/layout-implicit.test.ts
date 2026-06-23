import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { motion } from "./index.js";

type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

class MockResizeObserver {
    static instances: MockResizeObserver[] = [];
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        MockResizeObserver.instances.push(this);
    }

    observe() {}

    disconnect() {}

    trigger() {
        this.callback([], this as unknown as ResizeObserver);
    }
}

describe("implicit layout", () => {
    let container: HTMLDivElement;
    let root: Root;
    let layoutAnimateSpy: ReturnType<typeof vi.fn>;
    let currentRect: DOMRect;
    let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;
    let originalResizeObserver: typeof ResizeObserver | undefined;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        currentRect = new DOMRect(16, 16, 240, 120);
        originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        originalResizeObserver = globalThis.ResizeObserver;
        MockResizeObserver.instances = [];
        globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect(this: HTMLElement) {
            if (this.dataset.layoutPanel === "true") {
                return currentRect;
            }

            return originalGetBoundingClientRect.call(this);
        };

        layoutAnimateSpy = vi.fn(() => ({
            cancel: vi.fn(),
            onfinish: null,
            oncancel: null,
            finish: vi.fn(),
            play: vi.fn(),
            pause: vi.fn(),
        }));

        HTMLElement.prototype.animate = layoutAnimateSpy as typeof HTMLElement.prototype.animate;
    });

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container.remove();
        HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
        globalThis.ResizeObserver = originalResizeObserver;
        vi.restoreAllMocks();
    });

    it("plays a layout animation when content size changes without explicit width or height", async () => {
        root = createRoot(container);

        await act(async () => {
            root.render(
                createElement(
                    motion.div,
                    {
                        "data-layout-panel": "true",
                        layout: true,
                        style: { position: "fixed", top: 16, left: 16 },
                    },
                    createElement("p", null, "short"),
                ),
            );
        });

        layoutAnimateSpy.mockClear();
        currentRect = new DOMRect(16, 16, 240, 220);

        await act(async () => {
            root.render(
                createElement(
                    motion.div,
                    {
                        "data-layout-panel": "true",
                        layout: true,
                        style: { position: "fixed", top: 16, left: 16 },
                    },
                    createElement("p", null, "much taller content"),
                    createElement("p", null, "second line"),
                ),
            );
        });

        await act(async () => {
            MockResizeObserver.instances[0]?.trigger();
        });

        const layoutCall = layoutAnimateSpy.mock.calls.find((call) => {
            const keyframes = call[0] as Keyframe[];

            return typeof keyframes?.[0]?.transform === "string" && keyframes[0].transform.includes("scale");
        });

        expect(layoutCall).toBeDefined();
        expect(layoutCall?.[0]?.[0]?.transform).toContain("scale(1,");
    });
});
