import type { ReportLocale } from "../i18n/types.js";
export declare const LOCALE_PREFERENCE_STORAGE_KEY = "fivepixels:locale-preference";
export declare function hasStoredLocalePreference(): boolean;
export declare function useLocalePreference(initialLocale: ReportLocale): {
    locale: ReportLocale;
    setLocale: (nextLocale: ReportLocale) => void;
};
//# sourceMappingURL=useLocalePreference.d.ts.map