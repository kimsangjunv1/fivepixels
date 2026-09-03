import type { CSSProperties } from "react";
import type { MarkerShape } from "@/constants/markerAppearance.js";
import { getMarkerShapeDefinition } from "@/constants/markerShapeRegistry.js";

type MarkerShapeGlyphProps = {
    shape: MarkerShape;
    fill: string;
    width: number;
    height: number;
    stroke?: string;
    strokeWidthPx?: number;
    dashed?: boolean;
    className?: string;
    style?: CSSProperties;
};

/**
 * Renders a marker silhouette from official Material 3 SVG path data
 * with a non-scaling stroke so the outline stays exactly `strokeWidthPx` (2px).
 */
export function MarkerShapeGlyph({ shape, fill, width, height, stroke = "#ffffff", strokeWidthPx, dashed = false, className = "", style }: MarkerShapeGlyphProps) {
    const definition = getMarkerShapeDefinition(shape);
    const resolvedStrokeWidth = strokeWidthPx ?? definition.strokeWidthPx;

    return (
        <svg
            aria-hidden
            width={width}
            height={height}
            viewBox="0 0 1 1"
            className={`pointer-events-none overflow-visible ${className}`}
            style={{
                display: "block",
                overflow: "visible",
                filter: "drop-shadow(0px 0px 1px #1118271a) drop-shadow(0px 0px 1px #1118271a)  drop-shadow(0px 4px 2px rgba(17, 24, 39, 0.1))",
                ...style,
            }}
        >
            <path
                d={definition.pathD}
                fill={fill}
                stroke={stroke}
                strokeWidth={resolvedStrokeWidth}
                strokeDasharray={dashed ? "0.06 0.04" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}
