export function getCurrentPathname(pathname?: string) {
    if (pathname) {
        return pathname;
    }

    if (typeof window !== "undefined") {
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
        return `${window.location.pathname || "/"}${window.location.search || ""}`;
    }

    return "/";
}
