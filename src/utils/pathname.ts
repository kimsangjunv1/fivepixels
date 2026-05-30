export function getCurrentPathname(pathname?: string) {
    if (pathname) {
        return pathname;
    }

    if (typeof window !== "undefined") {
        return window.location.pathname || "/";
    }

    return "/";
}
