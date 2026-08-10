import type { MarkerFillStyle, MarkerShape } from "../../constants/markerAppearance.js";
type MarkerShapePickerProps = {
    value: MarkerShape;
    onChange: (value: MarkerShape) => void;
    labels: Record<MarkerShape, string>;
    ariaLabel: string;
    previewColor: string;
    fillStyle?: MarkerFillStyle;
};
export declare function MarkerShapePicker({ value, onChange, labels, ariaLabel, previewColor, fillStyle, }: MarkerShapePickerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MarkerShapePicker.d.ts.map