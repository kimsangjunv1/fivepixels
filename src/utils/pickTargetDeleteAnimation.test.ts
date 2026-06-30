import { afterEach, describe, expect, it, vi } from "vitest";
import { PICK_TARGET_DELETE_ANIMATION_MS, playPickTargetDeleteAnimation } from "./pickTargetDeleteAnimation.js";

describe("pickTargetDeleteAnimation", () => {
    afterEach(() => {
        document.querySelectorAll(".fivepixels-pick-target-delete-overlay").forEach((node) => node.remove());
        vi.useRealTimers();
    });

    it("creates and removes a delete overlay", async () => {
        vi.useFakeTimers();

        const rect = new DOMRect(10, 20, 120, 40);
        const promise = playPickTargetDeleteAnimation(rect);

        const overlay = document.querySelector(".fivepixels-pick-target-delete-overlay");

        expect(overlay).not.toBeNull();
        expect(overlay?.querySelector(".fivepixels-pick-target-delete-wave")).not.toBeNull();

        await vi.advanceTimersByTimeAsync(PICK_TARGET_DELETE_ANIMATION_MS + 100);
        await promise;

        expect(document.querySelector(".fivepixels-pick-target-delete-overlay")).toBeNull();
    });
});
