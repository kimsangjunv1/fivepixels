import { type MarkerAppearancePreferences, type MarkerColorPreferences, type MarkerShape, type AppearanceScale } from "../constants/markerAppearance.js";
export declare function useMarkerAppearancePreference(): {
    markerAppearance: MarkerAppearancePreferences;
    setMarkerAppearance: (next: MarkerAppearancePreferences | ((current: MarkerAppearancePreferences) => MarkerAppearancePreferences)) => void;
    setMarkerSize: (size: AppearanceScale) => void;
    setMarkerShape: (shape: MarkerShape) => void;
    setMarkerColors: (colors: MarkerColorPreferences) => void;
    setMarkerColor: (key: keyof MarkerColorPreferences, color: string) => void;
};
//# sourceMappingURL=useMarkerAppearancePreference.d.ts.map