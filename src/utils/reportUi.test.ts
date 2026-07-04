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
            panelAppearance: "dark",
            tooltipAppearance: "dark",
            showFeedbackList: false,
            visibleShortcutKeys: true,
            questionThreadDefault: "expanded",
            shortcut: "mod+shift+m",
            locale: "ko",
            messages: getReportMessages("ko"),
        });
    });

    it("resolves scoped appearance values independently", () => {
        expect(
            resolveReportUi({
                ui: {
                    panelAppearance: "light",
                    tooltipAppearance: "dark",
                },
            }),
        ).toEqual({
            panelAppearance: "light",
            tooltipAppearance: "dark",
            showFeedbackList: true,
            visibleShortcutKeys: false,
            questionThreadDefault: "expanded",
            shortcut: undefined,
            locale: "en",
            messages: getReportMessages("en"),
        });
    });

    it("uses defaults when ui is omitted", () => {
        expect(resolveReportUi({})).toEqual({
            panelAppearance: "system",
            tooltipAppearance: "system",
            showFeedbackList: true,
            visibleShortcutKeys: false,
            questionThreadDefault: "expanded",
            shortcut: undefined,
            locale: "en",
            messages: getReportMessages("en"),
        });
    });
});
