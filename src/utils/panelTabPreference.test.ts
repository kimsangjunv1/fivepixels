import { describe, expect, it } from "vitest";
import { getPanelRoleTabPreset, PANEL_ROLE_TAB_PRESETS } from "@/constants/panelTabPresets.js";
import { PANEL_USER_TAB_IDS } from "@/constants/panelTabRegistry.js";
import {
    createRoleDefaultPreference,
    getDefaultVisibleTabsForRole,
    moveVisibleTab,
    resolveDefaultPanelTab,
    resolveVisibleTabs,
    sanitizeVisibleTabs,
} from "@/utils/panelTabPreference.js";

const defaultContext = {
    showFeedbackList: true,
    canListAllFeedback: true,
};

describe("panelTabPreference", () => {
    it("sanitizes unknown and unavailable tab ids", () => {
        expect(
            sanitizeVisibleTabs(["route-details", "settings", "unknown", "feedback-list"], {
                showFeedbackList: false,
                canListAllFeedback: true,
            }),
        ).toEqual(["route-details"]);
    });

    it("resolves role defaults when preference is missing", () => {
        expect(resolveVisibleTabs({ role: "designer", preference: null, context: defaultContext })).toEqual(["route-details", "feedback-list"]);
    });

    it("falls back to role defaults when stored tabs are empty after sanitization", () => {
        expect(
            resolveVisibleTabs({
                role: "qa",
                preference: { visibleTabs: ["settings" as never], customized: true },
                context: defaultContext,
            }),
        ).toEqual(getDefaultVisibleTabsForRole("qa", defaultContext));
    });

    it("keeps customized visible tabs when valid", () => {
        expect(
            resolveVisibleTabs({
                role: "planner",
                preference: { visibleTabs: ["diagnostics"], customized: true },
                context: defaultContext,
            }),
        ).toEqual(["diagnostics"]);
    });

    it("resolves default panel tab from visible tabs", () => {
        expect(resolveDefaultPanelTab("planner", ["feedback-list", "overview"])).toBe("overview");
        expect(resolveDefaultPanelTab("planner", ["diagnostics"])).toBe("diagnostics");
    });

    it("creates role default preference", () => {
        expect(createRoleDefaultPreference("developer", defaultContext)).toEqual({
            visibleTabs: ["feedback-list", "route-details", "diagnostics"],
            customized: false,
        });
    });

    it("moves visible tabs up and down", () => {
        const tabs = ["route-details", "feedback-list", "overview"] as const;

        expect(moveVisibleTab([...tabs], "feedback-list", "up")).toEqual(["feedback-list", "route-details", "overview"]);
        expect(moveVisibleTab([...tabs], "feedback-list", "down")).toEqual(["route-details", "overview", "feedback-list"]);
        expect(moveVisibleTab([...tabs], "route-details", "up")).toEqual([...tabs]);
        expect(moveVisibleTab([...tabs], "overview", "down")).toEqual([...tabs]);
    });
});

describe("panelTabPresets", () => {
    it("references only registered user tab ids", () => {
        for (const role of Object.keys(PANEL_ROLE_TAB_PRESETS) as Array<keyof typeof PANEL_ROLE_TAB_PRESETS>) {
            const preset = getPanelRoleTabPreset(role);

            for (const tabId of [...preset.recommended, ...preset.defaultVisible, preset.defaultTab]) {
                expect(PANEL_USER_TAB_IDS).toContain(tabId);
            }
        }
    });
});
