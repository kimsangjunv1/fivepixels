export function getCurrentPathname(pathname) {
    if (pathname) {
        return pathname;
    }
    if (typeof window !== "undefined") {
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
        return `${window.location.pathname || "/"}${window.location.search || ""}`;
    }
    return "/";
}
//# sourceMappingURL=pathname.js.map