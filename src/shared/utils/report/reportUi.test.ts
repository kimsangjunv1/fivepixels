import { describe, expect, it } from "vitest";
import { getReportMessages } from "@/shared/i18n/index.js";
import { resolveReportUi } from "./reportUi.js";

describe("resolveReportUi", () => {
    it("resolves ui object values", () => {
        expect(
            resolveReportUi({
                ui: {
                    panelAppearance: "dark",
                    tooltipAppearance: "dark",
                    showFeedbackList: false,
                    locale: "ko",
                },
            }),
        ).toEqual({
            panelAppearance: "dark",
            tooltipAppearance: "dark",
            showFeedbackList: false,
            questionThreadDefault: "expanded",
            threadLayoutDefault: "classic",
            replyHistory: {
                mode: "button-and-scroll",
                pageSize: 10,
            },
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
            questionThreadDefault: "expanded",
            threadLayoutDefault: "classic",
            replyHistory: {
                mode: "button-and-scroll",
                pageSize: 10,
            },
            locale: "en",
            messages: getReportMessages("en"),
        });
    });

    it("uses defaults when ui is omitted", () => {
        expect(resolveReportUi({})).toEqual({
            panelAppearance: "light",
            tooltipAppearance: "light",
            showFeedbackList: true,
            questionThreadDefault: "expanded",
            threadLayoutDefault: "classic",
            replyHistory: {
                mode: "button-and-scroll",
                pageSize: 10,
            },
            locale: "en",
            messages: getReportMessages("en"),
        });
    });
});
