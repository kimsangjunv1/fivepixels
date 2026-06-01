import { describe, expect, it } from "vitest";
import { isSameHoverTarget } from "./dom.js";

describe("isSameHoverTarget", () => {
    it("treats snapshots with the same id and type as equal", () => {
        const rect = new DOMRect(0, 0, 10, 10);
        const previous = { id: "cta", type: "item" as const, rect };
        const next = { id: "cta", type: "item" as const, rect: new DOMRect(4, 6, 10, 10) };

        expect(isSameHoverTarget(previous, next)).toBe(true);
    });

    it("treats different ids or types as unequal", () => {
        const rect = new DOMRect(0, 0, 10, 10);

        expect(isSameHoverTarget({ id: "hero", type: "group", rect }, { id: "cta", type: "item", rect })).toBe(false);
        expect(isSameHoverTarget({ id: "cta-a", type: "item", rect }, { id: "cta-b", type: "item", rect })).toBe(false);
    });
});
