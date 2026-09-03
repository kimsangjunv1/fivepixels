import { describe, expect, it } from "vitest";
import { normalizeMobilePreviewUrl } from "./mobilePreviewUrl.js";

const BASE = "https://example.com/app/page";

describe("normalizeMobilePreviewUrl", () => {
    it("accepts absolute https URLs", () => {
        expect(normalizeMobilePreviewUrl("https://demo.test/home", BASE)).toBe("https://demo.test/home");
    });

    it("resolves root-relative paths against the base URL", () => {
        expect(normalizeMobilePreviewUrl("/responsive-check", BASE)).toBe("https://example.com/responsive-check");
    });

    it("prefixes bare domains with https", () => {
        expect(normalizeMobilePreviewUrl("toss.im", BASE)).toBe("https://toss.im/");
    });

    it("returns null for empty input", () => {
        expect(normalizeMobilePreviewUrl("   ", BASE)).toBeNull();
    });

    it("rejects malformed absolute URLs", () => {
        expect(normalizeMobilePreviewUrl("http://", BASE)).toBeNull();
    });
});
