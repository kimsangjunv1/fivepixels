export declare const MOBILE_PREVIEW_URL_STORAGE_KEY = "fivepixels:mobile-preview-url:v1";
export declare function readMobilePreviewUrl(fallback: string): string;
export declare function persistMobilePreviewUrl(url: string): void;
/** Resolve user input into an absolute navigable URL. Returns null when invalid. */
export declare function normalizeMobilePreviewUrl(input: string, baseUrl: string): string | null;
//# sourceMappingURL=mobilePreviewUrl.d.ts.map