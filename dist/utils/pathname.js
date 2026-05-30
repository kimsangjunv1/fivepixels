export function getCurrentPathname(pathname) {
    if (pathname) {
        return pathname;
    }
    if (typeof window !== "undefined") {
        return window.location.pathname || "/";
    }
    return "/";
}
//# sourceMappingURL=pathname.js.map