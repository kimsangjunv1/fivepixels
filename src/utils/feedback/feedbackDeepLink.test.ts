import { afterEach, describe, expect, it } from "vitest";
import { buildFeedbackShareUrl, clearFeedbackDeepLinkFromUrl, parseFeedbackDeepLink } from "./feedbackDeepLink.js";

describe("parseFeedbackDeepLink", () => {
    it("returns feedback id when deep link params are present", () => {
        expect(parseFeedbackDeepLink("?fivepixels=true&target=feedback&idx=fb-123")).toEqual({
            feedbackId: "fb-123",
        });
    });

    it("returns null when required params are missing", () => {
        expect(parseFeedbackDeepLink("?fivepixels=true&target=feedback")).toBeNull();
        expect(parseFeedbackDeepLink("?fivepixels=true&idx=fb-123")).toBeNull();
        expect(parseFeedbackDeepLink("?target=feedback&idx=fb-123")).toBeNull();
    });
});

describe("buildFeedbackShareUrl", () => {
    it("builds a share url with feedback id and pathname", () => {
        expect(
            buildFeedbackShareUrl(
                {
                    id: "fb-123",
                    pathname: "/edge",
                },
                "https://example.com",
            ),
        ).toBe("https://example.com/edge?fivepixels=true&target=feedback&idx=fb-123");
    });
});

describe("clearFeedbackDeepLinkFromUrl", () => {
    afterEach(() => {
        window.history.replaceState(null, "", "/");
    });

    it("removes only target and idx query params", () => {
        window.history.replaceState(null, "", "/edge?fivepixels=true&target=feedback&idx=fb-123&tab=demo");

        clearFeedbackDeepLinkFromUrl();

        expect(window.location.pathname).toBe("/edge");
        expect(window.location.search).toBe("?fivepixels=true&tab=demo");
    });
});
