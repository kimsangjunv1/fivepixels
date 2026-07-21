import { type AppearanceScale, type MarkerFontSize, type MarkerShape } from "../../constants/markerAppearance.js";
type MarkerSizePreviewProps = {
    size: AppearanceScale;
    fontSize: MarkerFontSize;
    shape: MarkerShape;
    color: string;
    fontFamily: string;
    label?: string;
    ariaLabel?: string;
};
export declare function MarkerSizePreview({ size, fontSize, shape, color, fontFamily, label, ariaLabel }: MarkerSizePreviewProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MarkerSizePreview.d.ts.map