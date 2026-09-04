import { type CSSProperties, type Ref } from "react";
import type { Marker, MarkerDetachedKind } from "../../shared/types/report-ui.js";
import type { ReportFeedback } from "../../shared/types/report.js";
import type { MarkerAppearancePreferences, TypographyPreferences } from "../../shared/constants/markerAppearance.js";
type MarkerButtonProps = {
    markerItem: Marker;
    isHovered: boolean;
    isReportMode: boolean;
    isInteractive: boolean;
    isProximityHighlighted: boolean;
    isWindowOpen: boolean;
    viewingWindowBadge: string;
    detachedAriaLabel: string;
    detachedModalAriaLabel: string;
    markerAppearance: MarkerAppearancePreferences;
    typography: TypographyPreferences;
    onActivate: (report: ReportFeedback) => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    onPointerMove: (clientX: number, clientY: number) => void;
    positioning?: "fixed" | "absolute";
};
export declare function MarkerButton({ markerItem, isHovered, isReportMode, isInteractive, isProximityHighlighted, isWindowOpen, viewingWindowBadge, detachedAriaLabel, detachedModalAriaLabel, markerAppearance, typography, onActivate, onHoverStart, onHoverEnd, onPointerMove, positioning, }: MarkerButtonProps): import("react").JSX.Element;
type MarkerTooltipSurfaceProps = {
    report: ReportFeedback;
    detached?: boolean;
    detachedKind?: MarkerDetachedKind;
    detachedHint?: string;
    detachedModalHint?: string;
    positioning?: "fixed" | "absolute";
    style?: CSSProperties;
    containerRef?: Ref<HTMLDivElement>;
};
export declare function MarkerTooltipSurface({ report, detached, detachedKind, detachedHint, detachedModalHint, positioning, style, containerRef, }: MarkerTooltipSurfaceProps): import("react").JSX.Element;
export declare function MarkerLayer(): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=MarkerLayer.d.ts.map