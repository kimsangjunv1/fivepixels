import { describe, expect, it } from "vitest";
import { getDevicePreviewPreset } from "@/constants/devicePreview.js";
import { resolveMobilePreviewScreenSize } from "./mobilePreviewLayout.js";

describe("resolveMobilePreviewScreenSize", () => {
    const preset = getDevicePreviewPreset("iphone-14");

    it("returns preset dimensions in portrait", () => {
        expect(resolveMobilePreviewScreenSize(preset, "portrait")).toEqual({
            width: 390,
            height: 844,
        });
    });

    it("swaps dimensions in landscape", () => {
        expect(resolveMobilePreviewScreenSize(preset, "landscape")).toEqual({
            width: 844,
            height: 390,
        });
    });
});
