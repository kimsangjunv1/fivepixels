import type { PanelRole } from "@/constants/panelRole.js";
import { getAvailableUserTabs, isUserSelectablePanelTab, type PanelTabAvailabilityContext, type UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";
import { getPanelRoleTabPreset } from "@/constants/panelTabPresets.js";

export type PanelTabPreference = {
    visibleTabs: UserSelectablePanelTab[];
    customized: boolean;
};

export function isTabRecommendedForRole(role: PanelRole, tabId: UserSelectablePanelTab): boolean {
    return getPanelRoleTabPreset(role).recommended.includes(tabId);
}

export function getDefaultVisibleTabsForRole(role: PanelRole, context: PanelTabAvailabilityContext): UserSelectablePanelTab[] {
    const availableIds = new Set(getAvailableUserTabs(context).map((tab) => tab.id));
    const preset = getPanelRoleTabPreset(role).defaultVisible.filter((tabId) => availableIds.has(tabId));

    if (preset.length > 0) {
        return preset;
    }

    const fallback = getAvailableUserTabs(context)[0]?.id;

    return fallback ? [fallback] : ["route-details"];
}

export function sanitizeVisibleTabs(value: unknown, context: PanelTabAvailabilityContext): UserSelectablePanelTab[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const availableIds = new Set(getAvailableUserTabs(context).map((tab) => tab.id));
    const seen = new Set<UserSelectablePanelTab>();
    const sanitized: UserSelectablePanelTab[] = [];

    for (const item of value) {
        if (!isUserSelectablePanelTab(item) || !availableIds.has(item) || seen.has(item)) {
            continue;
        }

        seen.add(item);
        sanitized.push(item);
    }

    return sanitized;
}

export function resolveVisibleTabs({
    role,
    preference,
    context,
}: {
    role: PanelRole;
    preference: PanelTabPreference | null;
    context: PanelTabAvailabilityContext;
}): UserSelectablePanelTab[] {
    const defaults = getDefaultVisibleTabsForRole(role, context);

    if (!preference) {
        return defaults;
    }

    const sanitized = sanitizeVisibleTabs(preference.visibleTabs, context);

    if (sanitized.length === 0) {
        return defaults;
    }

    return sanitized;
}

export function resolveDefaultPanelTab(role: PanelRole, visibleTabs: UserSelectablePanelTab[]): UserSelectablePanelTab {
    const presetDefault = getPanelRoleTabPreset(role).defaultTab;

    if (visibleTabs.includes(presetDefault)) {
        return presetDefault;
    }

    return visibleTabs[0] ?? "route-details";
}

export function createRoleDefaultPreference(role: PanelRole, context: PanelTabAvailabilityContext): PanelTabPreference {
    return {
        visibleTabs: getDefaultVisibleTabsForRole(role, context),
        customized: false,
    };
}

export function formatVisibleTabSummary(visibleTabs: UserSelectablePanelTab[], labels: Record<UserSelectablePanelTab, string>): string {
    if (visibleTabs.length === 0) {
        return "";
    }

    return visibleTabs.map((tabId) => labels[tabId]).join(" · ");
}

export function moveVisibleTab(
    tabs: UserSelectablePanelTab[],
    tabId: UserSelectablePanelTab,
    direction: "up" | "down",
): UserSelectablePanelTab[] {
    const index = tabs.indexOf(tabId);

    if (index === -1) {
        return tabs;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= tabs.length) {
        return tabs;
    }

    const next = [...tabs];
    const current = next[index]!;
    next[index] = next[targetIndex]!;
    next[targetIndex] = current;

    return next;
}
