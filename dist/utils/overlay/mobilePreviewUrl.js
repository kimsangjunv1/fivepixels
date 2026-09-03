export const MOBILE_PREVIEW_URL_STORAGE_KEY = "fivepixels:mobile-preview-url:v1";
export function readMobilePreviewUrl(fallback) {
    if (typeof window === "undefined") {
        return fallback;
    }
    try {
        const stored = window.sessionStorage.getItem(MOBILE_PREVIEW_URL_STORAGE_KEY);
        if (stored) {
            return stored;
        }
    }
    catch {
        // Ignore storage failures.
    }
    return fallback;
}
export function persistMobilePreviewUrl(url) {
    try {
        window.sessionStorage.setItem(MOBILE_PREVIEW_URL_STORAGE_KEY, url);
    }
    catch {
        // Ignore storage failures.
    }
}
/** Resolve user input into an absolute navigable URL. Returns null when invalid. */
export function normalizeMobilePreviewUrl(input, baseUrl) {
    const trimmed = input.trim();
    if (!trimmed) {
        return null;
    }
    try {
        if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
            return new URL(trimmed).href;
        }
        if (trimmed.startsWith("//")) {
            return new URL(trimmed, baseUrl).href;
        }
        if (trimmed.startsWith("/")) {
            return new URL(trimmed, baseUrl).href;
        }
        if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) {
            return new URL(`https://${trimmed}`).href;
        }
        return new URL(trimmed, baseUrl).href;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=mobilePreviewUrl.js.map