export const STITCHABLE_ROOT_ATTR = "data-stitchable-root";
export const STITCHABLE_THEME_ATTR = "data-stitchable-theme";
export const STITCHABLE_PART_ATTR = "data-stitchable-part";
export function stitchableClass(part, modifier) {
    return modifier ? `stitchable-${part}--${modifier}` : `stitchable-${part}`;
}
export function stitchablePartProps(part, options) {
    const classNames = [stitchableClass(part), options?.modifier ? stitchableClass(part, options.modifier) : undefined, options?.className].filter(Boolean);
    return {
        [STITCHABLE_PART_ATTR]: part,
        className: classNames.join(" "),
    };
}
export function createStitchableLayoutVars(isMobileViewport) {
    return {
        "--stitchable-floating-panel-width": isMobileViewport ? "calc(100vw - 32px)" : "320px",
        "--stitchable-side-panel-width": isMobileViewport ? "calc(100vw - 32px)" : "360px",
        "--stitchable-side-panel-max-height": isMobileViewport ? "min(68vh, 560px)" : "calc(100vh - 32px)",
        "--stitchable-side-panel-top": isMobileViewport ? "auto" : "16px",
        "--stitchable-side-panel-bottom": isMobileViewport ? "16px" : "auto",
        "--stitchable-side-panel-left": isMobileViewport ? "16px" : "auto",
        "--stitchable-side-panel-right": "16px",
    };
}
//# sourceMappingURL=parts.js.map