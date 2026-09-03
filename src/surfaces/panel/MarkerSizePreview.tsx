import { DOT_SIZE } from "@/shared/constants/report.js";
import {
    getMarkerScaleFactor,
    resolveMarkerBadgeDisplay,
    MARKER_BADGE_LABEL_CLASS,
    type AppearanceScale,
    type MarkerFillStyle,
    type MarkerFontSize,
    type MarkerShape,
} from "@/shared/constants/markerAppearance.js";
import { getMarkerReplyBadgeSize, resolveMarkerGlyphPaint, resolveMarkerShapeStyle } from "@/shared/utils/marker/markerShape.js";
import { MarkerReplyBadge } from "@/surfaces/marker/MarkerReplyBadge.js";
import { MarkerShapeGlyph } from "@/surfaces/marker/MarkerShapeGlyph.js";

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

export function MarkerSizePreview({
    size,
    fontSize,
    shape,
    color,
    fontFamily,
    fillStyle = "filled",
    strokeColor = "#ffffff",
    label = "1",
    ariaLabel,
    showReplyBadge = false,
}: MarkerSizePreviewProps) {
    const dotSize = DOT_SIZE * getMarkerScaleFactor(size);
    const badgeDisplay = fontSize === "none" ? { content: null, fontSizePx: undefined, fontWeight: undefined } : resolveMarkerBadgeDisplay(size, label);
    const showMarkerLabel = Boolean(badgeDisplay.content);
    const shapeStyle = resolveMarkerShapeStyle(shape, dotSize);
    const paint = resolveMarkerGlyphPaint({
        color,
        fillStyle,
        strokeColor,
        strokeWidthPx: shapeStyle.strokeWidthPx,
    });
    const replyBadgeSize = getMarkerReplyBadgeSize(dotSize);

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
                                className="relative flex items-center justify-center"
                                style={{ width: shapeStyle.width, height: shapeStyle.height }}
                            >
                                <MarkerShapeGlyph
                                    shape={shape}
                                    fill={paint.fill}
                                    width={shapeStyle.width}
                                    height={shapeStyle.height}
                                    stroke={paint.stroke}
                                    strokeWidthPx={paint.strokeWidthPx}
                                    style={{ filter: "drop-shadow(0 4px 10px #00000090)" }}
                                />
                                {showMarkerLabel ? (
                                    <span
                                        className={`absolute inset-0 z-[1] flex items-center justify-center ${MARKER_BADGE_LABEL_CLASS}`}
                                        style={{
                                            fontFamily,
                                        }}
                                    >
                                        {badgeDisplay.content}
                                    </span>
                                ) : null}
                                {showReplyBadge ? (
                                    <MarkerReplyBadge
                                        size={replyBadgeSize}
                                        accentColor={color}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
