import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeToPathnameChanges } from "./pathnameNavigation.js";

async function flushMicrotasks() {
    await Promise.resolve();
}

describe("subscribeToPathnameChanges", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("notifies when history.pushState changes the URL", async () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToPathnameChanges(listener);

        history.pushState({}, "", "/pricing");
        await flushMicrotasks();

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    it("notifies when history.replaceState changes the URL", async () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToPathnameChanges(listener);

        history.replaceState({}, "", "/settings");
        await flushMicrotasks();

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    it("notifies on popstate", async () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToPathnameChanges(listener);

        window.dispatchEvent(new PopStateEvent("popstate"));
        await flushMicrotasks();

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });
});
