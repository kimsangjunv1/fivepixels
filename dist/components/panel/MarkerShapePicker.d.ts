import type { MarkerShape } from "../../constants/markerAppearance.js";
type MarkerShapePickerProps = {
    value: MarkerShape;
    onChange: (value: MarkerShape) => void;
    labels: Record<MarkerShape, string>;
    ariaLabel: string;
};
export declare function MarkerShapePicker({ value, onChange, labels, ariaLabel }: MarkerShapePickerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MarkerShapePicker.d.ts.map