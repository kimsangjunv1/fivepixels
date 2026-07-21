import { useCallback, useState } from "react";
import { createRoleDefaultPreference, resolveVisibleTabs, sanitizeVisibleTabs, } from "../utils/panel/panelTabPreference.js";
const STORAGE_KEY = "fivepixels:panel-tab-preference";
function readStoredPanelTabPreference() {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.visibleTabs)) {
            return null;
        }
        return {
            visibleTabs: parsed.visibleTabs,
            customized: Boolean(parsed.customized),
        };
    }
    catch {
        return null;
    }
}
function persistPanelTabPreference(preference) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    }
    catch {
        // Ignore storage failures in restricted environments.
    }
}
export function usePanelTabPreference() {
    const [storedPreference, setStoredPreferenceState] = useState(() => readStoredPanelTabPreference());
    const setPanelTabPreference = useCallback((nextPreference) => {
        setStoredPreferenceState(nextPreference);
        persistPanelTabPreference(nextPreference);
    }, []);
    const setVisibleTabs = useCallback((visibleTabs, context, customized = true) => {
        const sanitized = sanitizeVisibleTabs(visibleTabs, context);
        if (sanitized.length === 0) {
            return;
        }
        setPanelTabPreference({
            visibleTabs: sanitized,
            customized,
        });
    }, [setPanelTabPreference]);
    const resetTabsToRoleDefault = useCallback((role, context) => {
        setPanelTabPreference(createRoleDefaultPreference(role, context));
    }, [setPanelTabPreference]);
    const applyRoleDefaultTabs = useCallback((role, context) => {
        setPanelTabPreference(createRoleDefaultPreference(role, context));
    }, [setPanelTabPreference]);
    const getVisibleTabs = useCallback((role, context) => resolveVisibleTabs({ role, preference: storedPreference, context }), [storedPreference]);
    return {
        storedPreference,
        setPanelTabPreference,
        setVisibleTabs,
        resetTabsToRoleDefault,
        applyRoleDefaultTabs,
        getVisibleTabs,
    };
}
//# sourceMappingURL=usePanelTabPreference.js.map