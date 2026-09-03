import { describe, expect, it } from "vitest";
import { resolveMarkerGlyphPaint } from "@/shared/utils/marker/markerShape.js";

describe("resolveMarkerGlyphPaint", () => {
    it("renders fill only for filled style", () => {
        const paint = resolveMarkerGlyphPaint({
            color: "#ff0000",
            fillStyle: "filled",
            strokeColor: "#ffffff",
            strokeWidthPx: 2,
        });

        expect(paint.fill).toBe("#ff0000");
        expect(paint.stroke).toBe("transparent");
        expect(paint.strokeWidthPx).toBe(0);
        expect(paint.labelColor).toBe("#ffffff");
    });

    it("renders outline only for outlined style", () => {
        const paint = resolveMarkerGlyphPaint({
            color: "#00ff00",
            fillStyle: "outlined",
            strokeColor: "#ffffff",
            strokeWidthPx: 2,
        });

        expect(paint.fill).toBe("transparent");
        expect(paint.stroke).toBe("#00ff00");
        expect(paint.strokeWidthPx).toBeGreaterThanOrEqual(2.5);
        expect(paint.labelColor).toBe("#00ff00");
    });

    it("renders fill and separate stroke for both style", () => {
        const paint = resolveMarkerGlyphPaint({
            color: "#0000ff",
            fillStyle: "both",
            strokeColor: "#111111",
            strokeWidthPx: 2,
        });

        expect(paint.fill).toBe("#0000ff");
        expect(paint.stroke).toBe("#111111");
        expect(paint.strokeWidthPx).toBe(2);
        expect(paint.labelColor).toBe("#ffffff");
    });
});
