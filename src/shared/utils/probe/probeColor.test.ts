import { describe, expect, it } from "vitest";
import { cssColorToProbeHex, isValidProbeHexColor, probeHexToColorInputValue, sanitizeProbeHexInput } from "./probeColor.js";

describe("probeColor", () => {
    it("validates 6 and 8 digit hex colors", () => {
        expect(isValidProbeHexColor("#ededed")).toBe(true);
        expect(isValidProbeHexColor("#EDEDED")).toBe(true);
        expect(isValidProbeHexColor("#ededed80")).toBe(true);
        expect(isValidProbeHexColor("#ede")).toBe(false);
        expect(isValidProbeHexColor("ededed")).toBe(false);
    });

    it("sanitizes hex input", () => {
        expect(sanitizeProbeHexInput("ededed")).toBe("#ededed");
        expect(sanitizeProbeHexInput("#ff00zz12")).toBe("#ff0012");
        expect(sanitizeProbeHexInput("#1234567890")).toBe("#12345678");
    });

    it("converts rgb colors to hex", () => {
        expect(cssColorToProbeHex("rgb(237, 237, 237)")).toBe("#ededed");
        expect(cssColorToProbeHex("rgba(0, 0, 0, 0.5)")).toBe("#00000080");
    });

    it("maps probe hex to native color input values", () => {
        expect(probeHexToColorInputValue("#ffffff10")).toBe("#ffffff");
        expect(probeHexToColorInputValue("#abc")).toBe("#000000");
    });
});
