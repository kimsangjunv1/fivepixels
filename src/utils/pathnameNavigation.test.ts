import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeToPathnameChanges } from "./pathnameNavigation.js";

describe("subscribeToPathnameChanges", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("notifies when history.pushState changes the URL", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToPathnameChanges(listener);

        history.pushState({}, "", "/pricing");

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    it("notifies when history.replaceState changes the URL", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToPathnameChanges(listener);

        history.replaceState({}, "", "/settings");

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    it("notifies on popstate", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToPathnameChanges(listener);

        window.dispatchEvent(new PopStateEvent("popstate"));

        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });
});
