import { beforeEach, describe, expect, it, vi } from "vitest";
import { createReportFeedback } from "../report/reportFixtures.js";
import { createReportPosition } from "../report/reportPosition.js";
import { filterFeedbackForActiveViews, getActiveFeedbackViewKeys, getFeedbackViewPath, getFeedbackViewTrigger, restoreFeedbackViews } from "./viewRestore.js";

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

    it("prefers the first visible enabled trigger", () => {
        document.body.innerHTML = `
            <button data-fp-open="settings-modal" disabled>Disabled</button>
            <button data-fp-open="settings-modal" id="hidden">Hidden</button>
            <button data-fp-open="settings-modal" id="visible">Visible</button>
        `;
        const hidden = document.querySelector<HTMLElement>("#hidden")!;
        const visible = document.querySelector<HTMLElement>("#visible")!;

        vi.spyOn(hidden, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 0, 0));
        vi.spyOn(visible, "getBoundingClientRect").mockReturnValue(new DOMRect(20, 30, 120, 40));

        expect(getFeedbackViewTrigger(["settings-modal"], { visibleOnly: true })?.element).toBe(visible);
    });

    it("uses the deepest visible data-fp-view as the active scope", () => {
        document.body.innerHTML = `
            <section data-fp-view="settings-modal">
                <div data-fp-view="account-tab">Content</div>
            </section>
            <section data-fp-view="hidden-modal" style="display: none">Hidden</section>
        `;
        const modal = document.querySelector<HTMLElement>('[data-fp-view="settings-modal"]')!;
        const tab = document.querySelector<HTMLElement>('[data-fp-view="account-tab"]')!;
        vi.spyOn(modal, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 400, 300));
        vi.spyOn(tab, "getBoundingClientRect").mockReturnValue(new DOMRect(20, 30, 300, 200));

        expect(getActiveFeedbackViewKeys()).toEqual(["account-tab"]);
    });

    it("shows only feedback related to active views", () => {
        const pageReport = createReportFeedback({ id: "page" });
        const loginReport = createReportFeedback({
            id: "login",
            position: createReportPosition({ viewPath: ["demo-modal-login"] }),
        });
        const searchReport = createReportFeedback({
            id: "search",
            position: createReportPosition({ viewPath: ["demo-modal-search"] }),
        });

        expect(filterFeedbackForActiveViews([pageReport, loginReport, searchReport], ["demo-modal-login"]).map((report) => report.id)).toEqual([
            "login",
        ]);
        expect(filterFeedbackForActiveViews([pageReport, loginReport], [])).toEqual([pageReport, loginReport]);
    });
});
