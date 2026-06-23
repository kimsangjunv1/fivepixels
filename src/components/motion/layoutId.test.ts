import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnimatedPresence, motion } from "./index.js";

describe("layoutId shared layout", () => {
    let container: HTMLDivElement;
    let root: Root;
    let layoutAnimateSpy: ReturnType<typeof vi.fn>;
    let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect(this: HTMLElement) {
            const left = Number.parseFloat(this.style.left || "0");
            const top = Number.parseFloat(this.style.top || "0");
            const width = Number.parseFloat(this.style.width || "0");
            const height = Number.parseFloat(this.style.height || "0");

            return new DOMRect(left, top, width, height);
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
        vi.restoreAllMocks();
    });

    it("plays a layout animation from the previous layoutId snapshot when the present child swaps", async () => {
        root = createRoot(container);

        await act(async () => {
            root.render(
                createElement(
                    AnimatedPresence,
                    null,
                    createElement(motion.div, {
                        key: "hover-a",
                        layout: true,
                        layoutId: "hover-shared",
                        style: { position: "fixed", left: 0, top: 0, width: 100, height: 40 },
                    }),
                ),
            );
        });

        layoutAnimateSpy.mockClear();

        await act(async () => {
            root.render(
                createElement(
                    AnimatedPresence,
                    null,
                    createElement(motion.div, {
                        key: "hover-b",
                        layout: true,
                        layoutId: "hover-shared",
                        style: { position: "fixed", left: 0, top: 120, width: 100, height: 40 },
                    }),
                ),
            );
        });

        await act(async () => {});

        const layoutCall = layoutAnimateSpy.mock.calls.find((call) => {
            const keyframes = call[0] as Keyframe[];

            return typeof keyframes?.[0]?.transform === "string" && keyframes[0].transform.includes("translate");
        });

        expect(layoutCall).toBeDefined();
        expect(layoutCall?.[0]?.[0]?.transform).toContain("translate(0px, -120px)");
    });
});
