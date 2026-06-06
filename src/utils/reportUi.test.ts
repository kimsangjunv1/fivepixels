import { describe, expect, it } from "vitest";
import { getReportMessages } from "../i18n/index.js";
import { resolveReportUi } from "./reportUi.js";

describe("resolveReportUi", () => {
    it("prefers ui object values over legacy flat props", () => {
        expect(
            resolveReportUi({
                ui: {
                    appearance: "dark",
                    showFeedbackList: false,
                    visibleShortcutKeys: true,
                    shortcut: "mod+shift+m",
                    locale: "ko",
                },
                appearance: "light",
                showFeedbackList: true,
                visibleShortcutKeys: false,
                shortcut: "legacy",
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
});
