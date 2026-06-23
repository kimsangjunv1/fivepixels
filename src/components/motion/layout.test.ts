import { describe, expect, it } from "vitest";

function rectsDiffer(a: DOMRect, b: DOMRect, threshold = 0.5) {
    return (
        Math.abs(a.left - b.left) >= threshold ||
        Math.abs(a.top - b.top) >= threshold ||
        Math.abs(a.width - b.width) >= threshold ||
        Math.abs(a.height - b.height) >= threshold
    );
}

describe("layout rect comparison", () => {
    it("detects position and size changes above the threshold", () => {
        const previous = new DOMRect(0, 0, 100, 40);
        const moved = new DOMRect(12, 0, 100, 40);
        const resized = new DOMRect(0, 0, 120, 40);
        const unchanged = new DOMRect(0.2, 0.2, 100, 40);

        expect(rectsDiffer(previous, moved)).toBe(true);
        expect(rectsDiffer(previous, resized)).toBe(true);
        expect(rectsDiffer(previous, unchanged)).toBe(false);
    });
});
