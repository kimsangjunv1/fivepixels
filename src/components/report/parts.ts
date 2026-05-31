import type { CSSProperties } from "react";

export const STITCHABLE_ROOT_ATTR = "data-stitchable-root";
export const STITCHABLE_THEME_ATTR = "data-stitchable-theme";
export const STITCHABLE_PART_ATTR = "data-stitchable-part";

export type StitchablePart =
    | "floating-panel"
    | "panel-header"
    | "panel-drag-handle"
    | "panel-body"
    | "panel-feedback-section"
    | "dock-guide-layer"
    | "dock-guide"
    | "panel-title"
    | "badge"
    | "helper-text"
    | "button-row"
    | "primary-button"
    | "secondary-button"
    | "button-with-hint"
    | "shortcut-hint"
    | "error-text"
    | "overlay"
    | "highlight-box"
    | "highlight-label"
    | "readonly-rect"
    | "marker-button"
    | "marker-tooltip"
    | "marker-tooltip-title"
    | "marker-tooltip-header"
    | "marker-tooltip-message"
    | "tag-list"
    | "field-tag"
    | "draft-card"
    | "draft-card-title"
    | "field-stack"
    | "field-block"
    | "field-label"
    | "textarea"
    | "checkbox-row"
    | "side-panel"
    | "side-panel-header"
    | "filter-grid"
    | "filter-search-row"
    | "input"
    | "report-list"
    | "state-card"
    | "report-card"
    | "report-card-button"
    | "report-card-header"
    | "status-badge"
    | "report-meta"
    | "report-message"
    | "card-actions"
    | "link-button"
    | "editor-section"
    | "reply-list"
    | "reply-item"
    | "reply-text";

export function stitchableClass(part: StitchablePart, modifier?: string) {
    return modifier ? `stitchable-${part}--${modifier}` : `stitchable-${part}`;
}

export function stitchablePartProps(part: StitchablePart, options?: { modifier?: string; className?: string }) {
    const classNames = [stitchableClass(part), options?.modifier ? stitchableClass(part, options.modifier) : undefined, options?.className].filter(Boolean);

    return {
        [STITCHABLE_PART_ATTR]: part,
        className: classNames.join(" "),
    } as const;
}

export function createStitchableLayoutVars(isMobileViewport: boolean): CSSProperties {
    return {
        "--stitchable-floating-panel-width": isMobileViewport ? "calc(100vw - 32px)" : "320px",
        "--stitchable-side-panel-width": isMobileViewport ? "calc(100vw - 32px)" : "360px",
        "--stitchable-side-panel-max-height": isMobileViewport ? "min(68vh, 560px)" : "calc(100vh - 32px)",
        "--stitchable-side-panel-top": isMobileViewport ? "auto" : "16px",
        "--stitchable-side-panel-bottom": isMobileViewport ? "16px" : "auto",
        "--stitchable-side-panel-left": isMobileViewport ? "16px" : "auto",
        "--stitchable-side-panel-right": "16px",
    } as CSSProperties;
}
