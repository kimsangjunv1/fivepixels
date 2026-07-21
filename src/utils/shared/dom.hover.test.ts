import { describe, expect, it } from "vitest";
import { isSameHoverTarget } from "./dom.js";

describe("isSameHoverTarget", () => {
    it("treats snapshots with the same identity and geometry as equal", () => {
        const rect = new DOMRect(0, 0, 10, 10);
        const previous = { id: "cta", type: "item" as const, rect, isTagged: true, tagName: "button" };
        const next = { id: "cta", type: "item" as const, rect: new DOMRect(0, 0, 10, 10), isTagged: true, tagName: "button" };

        expect(isSameHoverTarget(previous, next)).toBe(true);
    });

    it("treats snapshots with the same identity but different geometry as unequal", () => {
        const rect = new DOMRect(0, 0, 10, 10);
        const previous = { id: "cta", type: "item" as const, rect, isTagged: true };
        const next = { id: "cta", type: "item" as const, rect: new DOMRect(4, 6, 10, 10), isTagged: true };

        expect(isSameHoverTarget(previous, next)).toBe(false);
    });

    it("treats different ids or types as unequal", () => {
        const rect = new DOMRect(0, 0, 10, 10);

        expect(isSameHoverTarget({ id: "hero", type: "group", rect, isTagged: true }, { id: "cta", type: "item", rect, isTagged: true })).toBe(
            false,
        );
        expect(isSameHoverTarget({ id: "cta-a", type: "item", rect, isTagged: true }, { id: "cta-b", type: "item", rect, isTagged: true })).toBe(
            false,
        );
    });
});
