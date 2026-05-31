import type { CSSProperties } from "react";
export declare const STITCHABLE_ROOT_ATTR = "data-stitchable-root";
export declare const STITCHABLE_THEME_ATTR = "data-stitchable-theme";
export declare const STITCHABLE_PART_ATTR = "data-stitchable-part";
export type StitchablePart = "floating-panel" | "panel-header" | "panel-drag-handle" | "panel-body" | "panel-feedback-section" | "dock-guide-layer" | "dock-guide" | "panel-title" | "badge" | "helper-text" | "button-row" | "primary-button" | "secondary-button" | "button-with-hint" | "shortcut-hint" | "error-text" | "overlay" | "highlight-box" | "highlight-label" | "readonly-rect" | "marker-button" | "marker-tooltip" | "marker-tooltip-title" | "marker-tooltip-header" | "marker-tooltip-message" | "tag-list" | "field-tag" | "draft-card" | "draft-card-title" | "field-stack" | "field-block" | "field-label" | "textarea" | "checkbox-row" | "side-panel" | "side-panel-header" | "filter-grid" | "filter-search-row" | "input" | "report-list" | "state-card" | "report-card" | "report-card-button" | "report-card-header" | "status-badge" | "report-meta" | "report-message" | "card-actions" | "link-button" | "editor-section" | "reply-list" | "reply-item" | "reply-text";
export declare function stitchableClass(part: StitchablePart, modifier?: string): string;
export declare function stitchablePartProps(part: StitchablePart, options?: {
    modifier?: string;
    className?: string;
}): {
    readonly "data-stitchable-part": StitchablePart;
    readonly className: string;
};
export declare function createStitchableLayoutVars(isMobileViewport: boolean): CSSProperties;
//# sourceMappingURL=parts.d.ts.map