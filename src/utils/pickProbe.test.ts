import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en.js";
import { formatProposedChanges, getProposedChanges } from "./pickProbe.js";

describe("pickProbe", () => {
    it("formats proposed changes into a summary block", () => {
        const baseline = {
            textContent: "Hello",
            fontSize: "40px",
            padding: "16px",
            margin: "8px",
            lineHeight: "48px",
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
});
