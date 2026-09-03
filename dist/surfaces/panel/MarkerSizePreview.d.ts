import { type AppearanceScale, type MarkerFillStyle, type MarkerFontSize, type MarkerShape } from "../../shared/constants/markerAppearance.js";
type MarkerSizePreviewProps = {
    size: AppearanceScale;
    fontSize: MarkerFontSize;
    shape: MarkerShape;
    color: string;
    fontFamily: string;
    fillStyle?: MarkerFillStyle;
    strokeColor?: string;
    label?: string;
    ariaLabel?: string;
    showReplyBadge?: boolean;
};
export declare function MarkerSizePreview({ size, fontSize, shape, color, fontFamily, fillStyle, strokeColor, label, ariaLabel, showReplyBadge, }: MarkerSizePreviewProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MarkerSizePreview.d.ts.map