import { describe, expect, it } from "vitest";
import { getReportMessages } from "@/i18n/index.js";
import { resolveReportUi } from "./reportUi.js";

describe("resolveReportUi", () => {
    it("resolves ui object values", () => {
        expect(
            resolveReportUi({
                ui: {
                    appearance: "dark",
                    showFeedbackList: false,
                    visibleShortcutKeys: true,
                    shortcut: "mod+shift+m",
                    locale: "ko",
                },
            }),
        ).toEqual({
            appearance: "dark",
            showFeedbackList: false,
            visibleShortcutKeys: true,
            shortcut: "mod+shift+m",
            locale: "ko",
            messages: getReportMessages("ko"),
        });
    });

    it("uses defaults when ui is omitted", () => {
        expect(resolveReportUi({})).toEqual({
            appearance: "system",
            showFeedbackList: true,
            visibleShortcutKeys: false,
            shortcut: undefined,
            locale: "en",
            messages: getReportMessages("en"),
        });
    });
});
