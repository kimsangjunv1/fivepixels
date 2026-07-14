import { useCallback, useState } from "react";
import { DEFAULT_PANEL_ROLE, isPanelRole, type PanelRole } from "@/constants/panelRole.js";

const STORAGE_KEY = "fivepixels:panel-role-preference";

function readStoredPanelRole(fallback: PanelRole): PanelRole {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        if (isPanelRole(stored)) {
            return stored;
        }
    } catch {
        // Ignore storage failures in restricted environments.
    }

    return fallback;
}

function persistPanelRole(role: PanelRole) {
    try {
        window.localStorage.setItem(STORAGE_KEY, role);
    } catch {
        // Ignore storage failures in restricted environments.
    }
}

export function usePanelRolePreference(initialRole: PanelRole = DEFAULT_PANEL_ROLE) {
    const [panelRole, setPanelRoleState] = useState<PanelRole>(() => readStoredPanelRole(initialRole));

    const setPanelRole = useCallback((nextRole: PanelRole) => {
        setPanelRoleState(nextRole);
        persistPanelRole(nextRole);
    }, []);

    return {
        panelRole,
        setPanelRole,
    };
}
