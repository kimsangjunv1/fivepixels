import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFeedbackViewPath, restoreFeedbackViews } from "./viewRestore.js";

describe("viewRestore", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("collects nested data-fp-view keys from outermost to innermost", () => {
        document.body.innerHTML = `
            <section data-fp-view="settings-modal">
                <div data-fp-view="account-tab">
                    <button id="target">Target</button>
                </div>
            </section>
        `;

        expect(getFeedbackViewPath(document.querySelector("#target"))).toEqual(["settings-modal", "account-tab"]);
    });

    it("clicks matching data-fp-open triggers in path order", async () => {
        const animationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
            callback(0);
            return 1;
        });
        vi.useFakeTimers();
        document.body.innerHTML = `
            <button data-fp-open="settings-modal">Open modal</button>
            <button data-fp-open="account-tab">Open tab</button>
        `;
        const clicks: string[] = [];

        document.querySelectorAll<HTMLElement>("[data-fp-open]").forEach((element) => {
            element.addEventListener("click", () => clicks.push(element.dataset.fpOpen ?? ""));
        });

        const restorePromise = restoreFeedbackViews(["settings-modal", "account-tab"]);
        await vi.runAllTimersAsync();

        await expect(restorePromise).resolves.toBe(true);
        expect(clicks).toEqual(["settings-modal", "account-tab"]);
        animationFrame.mockRestore();
        vi.useRealTimers();
    });
});
