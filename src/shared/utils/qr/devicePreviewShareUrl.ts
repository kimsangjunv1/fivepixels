const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isLoopbackHostname(hostname: string): boolean {
    return LOOPBACK_HOSTS.has(hostname.trim().toLowerCase());
}

export function isLoopbackPageUrl(href = typeof window !== "undefined" ? window.location.href : ""): boolean {
    try {
        return isLoopbackHostname(new URL(href).hostname);
    } catch {
        return false;
    }
}

export function getCurrentPageShareUrl(href = typeof window !== "undefined" ? window.location.href : ""): string {
    try {
        return new URL(href).toString();
    } catch {
        return href;
    }
}

/** Returns a normalized absolute URL, or null if the input is empty / invalid. */
export function normalizeShareUrlInput(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) {
        return null;
    }

    try {
        const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `http://${trimmed}`;
        const url = new URL(withProtocol);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }
        return url.toString();
    } catch {
        return null;
    }
}

export function resolveDevicePreviewQrUrl(args: {
    pageHref?: string;
    manualUrl?: string;
}): { url: string | null; needsManualUrl: boolean } {
    const pageHref = args.pageHref ?? (typeof window !== "undefined" ? window.location.href : "");
    const needsManualUrl = isLoopbackPageUrl(pageHref);

    if (!needsManualUrl) {
        return {
            url: getCurrentPageShareUrl(pageHref),
            needsManualUrl: false,
        };
    }

    return {
        url: normalizeShareUrlInput(args.manualUrl ?? ""),
        needsManualUrl: true,
    };
}
