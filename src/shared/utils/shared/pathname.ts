import { getPagePathname, getPageWindow, isPageDocumentBridged } from "@/shared/utils/overlay/pageDocumentBridge.js";

export function getCurrentPathname(pathname?: string) {
    if (pathname) {
        return pathname;
    }

    if (typeof window !== "undefined") {
        if (isPageDocumentBridged()) {
            return getPagePathname();
        }

        return window.location.pathname || "/";
    }

    return "/";
}

/** Pathname + search for display (does not affect report route matching). */
export function getCurrentPathLabel(pathLabel?: string) {
    if (pathLabel) {
        return pathLabel;
    }

    if (typeof window !== "undefined") {
        if (isPageDocumentBridged()) {
            try {
                const location = getPageWindow().location;
                return `${location.pathname || "/"}${location.search || ""}`;
            } catch {
                // fall through to host location
            }
        }

        return `${window.location.pathname || "/"}${window.location.search || ""}`;
    }

    return "/";
}
