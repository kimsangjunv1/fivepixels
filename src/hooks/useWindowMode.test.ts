import { describe, expect, it } from "vitest";
import { getMaximizedWindowFrame } from "@/hooks/useWindowMode.js";

describe("useWindowMode helpers", () => {
    it("builds a maximized frame with margins", () => {
        const frame = getMaximizedWindowFrame(240, 160);

        expect(frame.left).toBe(12);
        expect(frame.top).toBe(12);
        expect(frame.width).toBeGreaterThanOrEqual(240);
        expect(frame.height).toBeGreaterThanOrEqual(160);
    });
});
