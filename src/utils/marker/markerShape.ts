import type { MarkerShape } from "@/constants/markerAppearance.js";

type MarkerShapeStyle = {
    anchorClass: string;
    shapeClass: string;
    ringClass: string;
    width: number;
    height: number;
    clipPath?: string;
    paddingX?: number;
};

export function resolveMarkerShapeStyle(shape: MarkerShape, dotSize: number, hasBadge: boolean, isModalDetached: boolean): MarkerShapeStyle {
    if (isModalDetached) {
        const size = dotSize + 2;

        return {
            anchorClass: "-translate-x-1/2 -translate-y-1/2",
            shapeClass: "rounded-[5px]",
            ringClass: "rounded-[8px]",
            width: size,
            height: size,
        };
    }

    const baseSize = dotSize + 2;

    if (shape === "square") {
        return {
            anchorClass: "-translate-x-1/2 -translate-y-1/2",
            shapeClass: "rounded-[4px]",
            ringClass: "rounded-[6px]",
            width: baseSize,
            height: baseSize,
        };
    }

    if (shape === "pill") {
        return {
            anchorClass: "-translate-x-1/2 -translate-y-1/2",
            shapeClass: "rounded-full",
            ringClass: "rounded-full",
            width: hasBadge ? Math.max(baseSize + 10, dotSize + 12) : baseSize + 4,
            height: baseSize,
            paddingX: hasBadge ? 8 : 0,
        };
    }

    if (shape === "pin") {
        const pinHeight = baseSize + 6;
        const pinWidth = Math.round(baseSize * 0.85);

        return {
            anchorClass: "-translate-x-1/2 -translate-y-[92%]",
            shapeClass: "",
            ringClass: "rounded-[6px]",
            width: pinWidth,
            height: pinHeight,
            clipPath: "polygon(50% 100%, 6% 42%, 6% 8%, 94% 8%, 94% 42%)",
        };
    }

    return {
        anchorClass: "-translate-x-1/2 -translate-y-1/2",
        shapeClass: "rounded-full",
        ringClass: "rounded-full",
        width: baseSize,
        height: baseSize,
    };
}
