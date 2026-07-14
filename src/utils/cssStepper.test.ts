import { describe, expect, it } from "vitest";
import { stepCssBoxSides, stepCssPixel } from "./cssStepper.js";

describe("cssStepper", () => {
    it("steps single pixel values", () => {
        expect(stepCssPixel("16px", 1)).toBe("17px");
        expect(stepCssPixel("16px", -4)).toBe("12px");
        expect(stepCssPixel("0px", -1)).toBe("0px");
    });

    it("steps shorthand box values together", () => {
        expect(stepCssBoxSides("12px 8px", 2)).toBe("14px 10px");
        expect(stepCssBoxSides("16px", -1)).toBe("15px");
    });
});
