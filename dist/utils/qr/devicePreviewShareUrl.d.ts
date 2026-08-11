export declare function isLoopbackHostname(hostname: string): boolean;
export declare function isLoopbackPageUrl(href?: string): boolean;
export declare function getCurrentPageShareUrl(href?: string): string;
/** Returns a normalized absolute URL, or null if the input is empty / invalid. */
export declare function normalizeShareUrlInput(raw: string): string | null;
export declare function resolveDevicePreviewQrUrl(args: {
    pageHref?: string;
    manualUrl?: string;
}): {
    url: string | null;
    needsManualUrl: boolean;
};
//# sourceMappingURL=devicePreviewShareUrl.d.ts.map