/**
 * Theme-adaptive brand accents.
 * Dark mode keeps the bright neon hexes; light mode uses darker counterparts
 * defined on `[data-fivepixels-theme]` in `adaptive-colors.css`.
 */
export const ACCENT_COLOR = {
    green: "var(--adaptive-accent-green)",
    red: "var(--adaptive-accent-red)",
    blue: "var(--adaptive-accent-blue)",
    coral: "var(--adaptive-accent-coral)",
    coralHover: "var(--adaptive-accent-coral-hover)",
    pink: "var(--adaptive-accent-pink)",
};
/** Canonical dark-mode hex values (source of truth for the bright palette). */
export const ACCENT_COLOR_DARK = {
    green: "#baff00",
    red: "#ff3b30",
    blue: "#4dabff",
    coral: "#f6562f",
    coralHover: "#bc3110",
    pink: "#fb328b",
};
/** Light-mode counterparts — darker for contrast on light surfaces. */
export const ACCENT_COLOR_LIGHT = {
    green: "#92b522",
    red: "#e04848",
    blue: "#3b8eeb",
    coral: "#e0552f",
    coralHover: "#c4431f",
    pink: "#e03a8a",
};
//# sourceMappingURL=accentColors.js.map