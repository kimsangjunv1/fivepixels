import { describe, expect, it } from "vitest";
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
        });
    });
});
