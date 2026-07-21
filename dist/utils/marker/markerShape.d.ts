import type { MarkerShape } from "../../constants/markerAppearance.js";
type MarkerShapeStyle = {
    anchorClass: string;
    shapeClass: string;
    ringClass: string;
    width: number;
    height: number;
    clipPath?: string;
    paddingX?: number;
};
export declare function resolveMarkerShapeStyle(shape: MarkerShape, dotSize: number, hasBadge: boolean, isModalDetached: boolean): MarkerShapeStyle;
export {};
//# sourceMappingURL=markerShape.d.ts.map