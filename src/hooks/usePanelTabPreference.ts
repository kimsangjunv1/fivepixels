import { useCallback, useState } from "react";
import type { PanelRole } from "@/constants/panelRole.js";
import type { PanelTabAvailabilityContext } from "@/constants/panelTabRegistry.js";
import {
    createRoleDefaultPreference,
    resolveVisibleTabs,
    sanitizeVisibleTabs,
    type PanelTabPreference,
} from "@/utils/panel/panelTabPreference.js";
import type { UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";

const STORAGE_KEY = "fivepixels:panel-tab-preference";

function readStoredPanelTabPreference(): PanelTabPreference | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<PanelTabPreference>;

        if (!Array.isArray(parsed.visibleTabs)) {
            return null;
        }

        return {
            visibleTabs: parsed.visibleTabs as UserSelectablePanelTab[],
            customized: Boolean(parsed.customized),
        };
    } catch {
        return null;
    }
}

function persistPanelTabPreference(preference: PanelTabPreference) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function usePanelTabPreference() {
    const [storedPreference, setStoredPreferenceState] = useState<PanelTabPreference | null>(() => readStoredPanelTabPreference());

    const setPanelTabPreference = useCallback((nextPreference: PanelTabPreference) => {
        setStoredPreferenceState(nextPreference);
        persistPanelTabPreference(nextPreference);
    }, []);

    const setVisibleTabs = useCallback(
        (visibleTabs: UserSelectablePanelTab[], context: PanelTabAvailabilityContext, customized = true) => {
            const sanitized = sanitizeVisibleTabs(visibleTabs, context);

            if (sanitized.length === 0) {
                return;
            }

            setPanelTabPreference({
                visibleTabs: sanitized,
                customized,
            });
        },
        [setPanelTabPreference],
    );

    const resetTabsToRoleDefault = useCallback(
        (role: PanelRole, context: PanelTabAvailabilityContext) => {
            setPanelTabPreference(createRoleDefaultPreference(role, context));
        },
        [setPanelTabPreference],
    );

    const applyRoleDefaultTabs = useCallback(
        (role: PanelRole, context: PanelTabAvailabilityContext) => {
            setPanelTabPreference(createRoleDefaultPreference(role, context));
        },
        [setPanelTabPreference],
    );

    const getVisibleTabs = useCallback(
        (role: PanelRole, context: PanelTabAvailabilityContext) => resolveVisibleTabs({ role, preference: storedPreference, context }),
        [storedPreference],
    );

    return {
        storedPreference,
        setPanelTabPreference,
        setVisibleTabs,
        resetTabsToRoleDefault,
        applyRoleDefaultTabs,
        getVisibleTabs,
    };
}
