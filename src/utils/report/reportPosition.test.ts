import { describe, expect, it } from "vitest";
import { createReportPosition, getDocumentY } from "./reportPosition.js";

describe("getDocumentY", () => {
    it("derives document Y from scrollY and viewport ratios", () => {
        const position = createReportPosition({
            scrollY: 100,
            viewport: { x: 0.5, y: 0.5, width: 1000, height: 800 },
        });

        expect(getDocumentY(position)).toBe(500);
    });
});
