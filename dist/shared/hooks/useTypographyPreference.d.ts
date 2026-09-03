import { type TypographyPreferences, type MarkerFontSize } from "../../shared/constants/markerAppearance.js";
export declare function useTypographyPreference(): {
    typography: TypographyPreferences;
    setTypography: (next: TypographyPreferences | ((current: TypographyPreferences) => TypographyPreferences)) => void;
    setFontSize: (fontSize: MarkerFontSize) => void;
    setFontFamily: (fontFamily: string) => void;
};
//# sourceMappingURL=useTypographyPreference.d.ts.map