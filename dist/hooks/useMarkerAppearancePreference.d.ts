import { type MarkerAppearancePreferences, type MarkerColorPreferences, type FeedbackModeDotColors, type MarkerShape, type AppearanceScale } from "../constants/markerAppearance.js";
export declare function useMarkerAppearancePreference(): {
    markerAppearance: MarkerAppearancePreferences;
    setMarkerAppearance: (next: MarkerAppearancePreferences | ((current: MarkerAppearancePreferences) => MarkerAppearancePreferences)) => void;
    setMarkerSize: (size: AppearanceScale) => void;
    setMarkerShape: (shape: MarkerShape) => void;
    setMarkerColors: (colors: MarkerColorPreferences) => void;
    setMarkerColor: (key: keyof MarkerColorPreferences, color: string) => void;
    setFeedbackModeDotColors: (colors: FeedbackModeDotColors) => void;
    setFeedbackModeDotColor: (appearance: keyof FeedbackModeDotColors, color: string) => void;
};
//# sourceMappingURL=useMarkerAppearancePreference.d.ts.map