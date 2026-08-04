import { DOT_SIZE } from "@/constants/report.js";
import {
    getMarkerScaleFactor,
    resolveMarkerBadgeDisplay,
    type AppearanceScale,
    type MarkerFontSize,
    type MarkerShape,
} from "@/constants/markerAppearance.js";
import { resolveMarkerShapeStyle } from "@/utils/marker/markerShape.js";

type MarkerSizePreviewProps = {
    size: AppearanceScale;
    fontSize: MarkerFontSize;
    shape: MarkerShape;
    color: string;
    fontFamily: string;
    label?: string;
    ariaLabel?: string;
};

export function MarkerSizePreview({ size, fontSize, shape, color, fontFamily, label = "1", ariaLabel }: MarkerSizePreviewProps) {
    const dotSize = DOT_SIZE * getMarkerScaleFactor(size);
    const badgeDisplay = fontSize === "none" ? { content: null, fontSizePx: undefined, fontWeight: undefined } : resolveMarkerBadgeDisplay(size, label);
    const showMarkerLabel = Boolean(badgeDisplay.content);
    const shapeStyle = resolveMarkerShapeStyle(shape, dotSize, showMarkerLabel, false);

    return (
        <div
            className="relative overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)]"
            aria-label={ariaLabel}
        >
            <div className="flex h-[88px]">
                <div className="w-[22%] shrink-0 bg-[var(--adaptive-black100)]" />
                <div className="relative min-w-0 flex-1 p-[10px]">
                    <div className="mb-[8px] h-[8px] w-[42%] rounded-[3px] bg-[var(--adaptive-black100)]" />
                    <div className="relative rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[10px]">
                        <div className="mb-[6px] h-[6px] w-[72%] rounded-[2px] bg-[var(--adaptive-black200)]" />
                        <div className="mb-[6px] h-[6px] w-[58%] rounded-[2px] bg-[var(--adaptive-black200)]" />
                        <div className="h-[6px] w-[34%] rounded-[2px] bg-[var(--adaptive-blue100)]" />

                        <div
                            className={`pointer-events-none absolute left-[68%] top-[42%] ${shapeStyle.anchorClass}`}
                            aria-hidden
                        >
                            <div
                                className={`flex items-center justify-center border-[4px] border-white shadow-[0_4px_10px_#00000090] ${shapeStyle.shapeClass} ${showMarkerLabel ? "text-white" : ""}`}
                                style={{
                                    backgroundColor: color,
                                    width: shapeStyle.width,
                                    height: shapeStyle.height,
                                    minWidth: shapeStyle.width,
                                    minHeight: shapeStyle.height,
                                    paddingLeft: shapeStyle.paddingX,
                                    paddingRight: shapeStyle.paddingX,
                                    clipPath: shapeStyle.clipPath,
                                    fontSize: badgeDisplay.fontSizePx === undefined ? undefined : `${badgeDisplay.fontSizePx}px`,
                                    fontWeight: badgeDisplay.fontWeight,
                                    fontFamily: showMarkerLabel ? fontFamily : undefined,
                                    lineHeight: 1,
                                }}
                            >
                                {showMarkerLabel ? badgeDisplay.content : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
