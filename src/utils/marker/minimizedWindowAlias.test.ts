import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { getMinimizedWindowAliasStorageKey } from "@/constants/storageKeys.js";
import { readMinimizedWindowAlias, writeMinimizedWindowAlias } from "./minimizedWindowAlias.js";

describe("minimizedWindowAlias", () => {
    const projectId = "demo-project";
    const storageKey = getMinimizedWindowAliasStorageKey(projectId);

    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    it("stores and reads a trimmed alias for a report", () => {
        expect(writeMinimizedWindowAlias(projectId, "report-1", "  홈 버그  ")).toBe("홈 버그");
        expect(readMinimizedWindowAlias(projectId, "report-1")).toBe("홈 버그");
        expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toEqual({ "report-1": "홈 버그" });
    });

    it("clears an alias when empty text is saved", () => {
        writeMinimizedWindowAlias(projectId, "report-1", "임시");
        expect(writeMinimizedWindowAlias(projectId, "report-1", "   ")).toBe("");
        expect(readMinimizedWindowAlias(projectId, "report-1")).toBe("");
        expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toEqual({});
    });

    it("ignores invalid stored payloads", () => {
        window.localStorage.setItem(storageKey, "not-json");
        expect(readMinimizedWindowAlias(projectId, "report-1")).toBe("");

        window.localStorage.setItem(storageKey, JSON.stringify(["bad"]));
        expect(readMinimizedWindowAlias(projectId, "report-1")).toBe("");
    });

    it("swallows storage write failures", () => {
        const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("quota");
        });

        expect(() => writeMinimizedWindowAlias(projectId, "report-1", "alias")).not.toThrow();
        setItem.mockRestore();
    });
});
