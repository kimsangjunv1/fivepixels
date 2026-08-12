import { getPagePathname, getPageWindow, isPageDocumentBridged } from "../../utils/overlay/pageDocumentBridge.js";
export function getCurrentPathname(pathname) {
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
export function getCurrentPathLabel(pathLabel) {
    if (pathLabel) {
        return pathLabel;
    }
    if (typeof window !== "undefined") {
        if (isPageDocumentBridged()) {
            try {
                const location = getPageWindow().location;
                return `${location.pathname || "/"}${location.search || ""}`;
            }
            catch {
                // fall through to host location
            }
        }
        return `${window.location.pathname || "/"}${window.location.search || ""}`;
    }
    return "/";
}
//# sourceMappingURL=pathname.js.map