import { describe, expect, it, beforeEach } from "vitest";
import { deleteElementMemo, readElementMemos, saveElementMemo } from "./elementMemos.js";

describe("elementMemos", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("saves and reads memos for a pathname", () => {
        saveElementMemo("demo", "/home", "btn-submit", "Check VAT");
        expect(readElementMemos("demo", "/home")).toEqual({
            "btn-submit": {
                text: "Check VAT",
                updatedAt: expect.any(String),
                elementXRatio: 0.5,
                elementYRatio: 0.5,
            },
        });
    });

    it("preserves position ratios when updating text", () => {
        saveElementMemo("demo", "/home", "btn-submit", "Check VAT", { elementXRatio: 0.2, elementYRatio: 0.8 });
        saveElementMemo("demo", "/home", "btn-submit", "Updated memo");

        expect(readElementMemos("demo", "/home")["btn-submit"]).toEqual({
            text: "Updated memo",
            updatedAt: expect.any(String),
            elementXRatio: 0.2,
            elementYRatio: 0.8,
        });
    });

    it("deletes empty memo text and removes the entry", () => {
        saveElementMemo("demo", "/home", "btn-submit", "Check VAT");
        saveElementMemo("demo", "/home", "btn-submit", "   ");
        expect(readElementMemos("demo", "/home")).toEqual({});
    });

    it("scopes memos by pathname", () => {
        saveElementMemo("demo", "/home", "btn-submit", "Home memo");
        saveElementMemo("demo", "/settings", "btn-submit", "Settings memo");

        expect(readElementMemos("demo", "/home")["btn-submit"]?.text).toBe("Home memo");
        expect(readElementMemos("demo", "/settings")["btn-submit"]?.text).toBe("Settings memo");
    });

    it("deletes a memo entry", () => {
        saveElementMemo("demo", "/home", "btn-submit", "Check VAT");
        deleteElementMemo("demo", "/home", "btn-submit");
        expect(readElementMemos("demo", "/home")).toEqual({});
    });
});
