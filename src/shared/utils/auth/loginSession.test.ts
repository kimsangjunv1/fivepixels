import { beforeEach, describe, expect, it } from "vitest";
import { getLoginMethodStorageKey, getRemoteAuthSessionStorageKey } from "@/shared/constants/storageKeys.js";
import { clearRemoteAuthSession, readLoginMethod, readRemoteAuthSession, saveLoginMethod, saveRemoteAuthSession } from "./loginSession.js";

const PROJECT_ID = "demo";
const ENV = "STAGED";

describe("loginSession", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("persists the selected login method", () => {
        saveLoginMethod(PROJECT_ID, ENV, "api");

        expect(readLoginMethod(PROJECT_ID, ENV)).toBe("api");
        expect(localStorage.getItem(getLoginMethodStorageKey(PROJECT_ID, ENV))).toContain("api");
    });

    it("persists and clears a remote auth session", () => {
        saveRemoteAuthSession(PROJECT_ID, ENV, {
            method: "artemis",
            user: { id: "user-1", name: "Ada", email: "ada@example.com" },
        });

        expect(readRemoteAuthSession(PROJECT_ID, ENV)).toEqual({
            method: "artemis",
            user: { id: "user-1", name: "Ada", email: "ada@example.com" },
        });
        expect(localStorage.getItem(getRemoteAuthSessionStorageKey(PROJECT_ID, ENV))).toContain("user-1");

        clearRemoteAuthSession(PROJECT_ID, ENV);
        expect(readRemoteAuthSession(PROJECT_ID, ENV)).toBeNull();
    });
});
