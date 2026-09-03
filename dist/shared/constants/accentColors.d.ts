/**
 * Theme-adaptive brand accents.
 * Dark mode keeps the bright neon hexes; light mode uses darker counterparts
 * defined on `[data-fivepixels-theme]` in `adaptive-colors.css`.
 */
export declare const ACCENT_COLOR: {
    readonly green: "var(--adaptive-accent-green)";
    readonly red: "var(--adaptive-accent-red)";
    readonly blue: "var(--adaptive-accent-blue)";
    readonly coral: "var(--adaptive-accent-coral)";
    readonly coralHover: "var(--adaptive-accent-coral-hover)";
    readonly pink: "var(--adaptive-accent-pink)";
};
/** Canonical dark-mode hex values (source of truth for the bright palette). */
export declare const ACCENT_COLOR_DARK: {
    readonly green: "#baff00";
    readonly red: "#ff3b30";
    readonly blue: "#4dabff";
    readonly coral: "#f6562f";
    readonly coralHover: "#bc3110";
    readonly pink: "#fb328b";
};
/** Light-mode counterparts — darker for contrast on light surfaces. */
export declare const ACCENT_COLOR_LIGHT: {
    readonly green: "#92b522";
    readonly red: "#e04848";
    readonly blue: "#3b8eeb";
    readonly coral: "#e0552f";
    readonly coralHover: "#c4431f";
    readonly pink: "#e03a8a";
};
//# sourceMappingURL=accentColors.d.ts.map