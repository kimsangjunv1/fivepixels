import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en.js";
import { getProposedChanges, formatProposedChanges, formatSavedProbeEditsSummary } from "./pickProbe.js";

describe("pickProbe", () => {
    it("formats proposed changes into a summary block", () => {
        const baseline = {
            textContent: "Hello",
            fontSize: "40px",
            padding: "16px",
            margin: "8px",
            lineHeight: "48px",
            textColor: "#111111",
            backgroundColor: "#ffffff",
            borderColor: "#cccccc",
        };
        const current = {
            ...baseline,
            fontSize: "32px",
            padding: "12px",
        };

        const changes = getProposedChanges(baseline, current);
        const summary = formatProposedChanges(changes, en);

        expect(changes).toHaveLength(2);
        expect(summary).toContain("[Design probe suggestion]");
        expect(summary).toContain("fontSize: 40px → 32px");
        expect(summary).toContain("padding: 16px → 12px");
    });

    it("ignores text fields for non-text elements", () => {
        const baseline = {
            textContent: "",
            fontSize: "",
            padding: "16px",
            margin: "8px",
            lineHeight: "",
            textColor: "#111111",
            backgroundColor: "#ffffff",
            borderColor: "#cccccc",
        };
        const current = {
            ...baseline,
            textContent: "Edited",
            fontSize: "32px",
            lineHeight: "40px",
            backgroundColor: "#000000",
        };

        const changes = getProposedChanges(baseline, current, false);

        expect(changes).toEqual([
            {
                key: "backgroundColor",
                before: "#ffffff",
                after: "#000000",
            },
        ]);
    });

    it("formats saved probe edits across multiple elements", () => {
        const summary = formatSavedProbeEditsSummary(
            {
                "id:hero:item": {
                    elementKey: "id:hero:item",
                    baseline: {
                        textContent: "Hello",
                        fontSize: "16px",
                        padding: "8px",
                        margin: "0px",
                        lineHeight: "20px",
                        textColor: "#111111",
                        backgroundColor: "#ffffff",
                        borderColor: "#cccccc",
                    },
                    applied: {
                        textContent: "Hello",
                        fontSize: "14px",
                        padding: "8px",
                        margin: "0px",
                        lineHeight: "20px",
                        textColor: "#111111",
                        backgroundColor: "#ffffff",
                        borderColor: "#cccccc",
                    },
                    originalStyle: null,
                    originalTextContent: "Hello",
                    originalInnerHTML: null,
                    originalInputValue: null,
                },
                "selector:.card": {
                    elementKey: "selector:.card",
                    baseline: {
                        textContent: "",
                        fontSize: "",
                        padding: "16px",
                        margin: "0px",
                        lineHeight: "",
                        textColor: "#111111",
                        backgroundColor: "#ffffff",
                        borderColor: "#cccccc",
                    },
                    applied: {
                        textContent: "",
                        fontSize: "",
                        padding: "12px",
                        margin: "0px",
                        lineHeight: "",
                        textColor: "#111111",
                        backgroundColor: "#ff0000",
                        borderColor: "#cccccc",
                    },
                    originalStyle: null,
                    originalTextContent: null,
                    originalInnerHTML: null,
                    originalInputValue: null,
                },
            },
            en,
        );

        expect(summary).toContain("[Design probe suggestion]");
        expect(summary).toContain("Element: hero");
        expect(summary).toContain("fontSize: 16px → 14px");
        expect(summary).toContain("Element: .card");
        expect(summary).toContain("padding: 16px → 12px");
        expect(summary).toContain("backgroundColor: #ffffff → #ff0000");
    });
});
