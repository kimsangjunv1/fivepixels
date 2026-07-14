import { useMemo, useState } from "react";
import { PointerFollowTooltip } from "@/components/ui/PointerFollowTooltip.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import {
    formatHourLabel,
    resolveHourlyBarHeightPx,
    type HourlyCompareBucket,
    type HourlyCompareSparkline,
} from "@/utils/hourlyCompareSparkline.js";

const BAR_MAX_HEIGHT_PX = 36;
const BAR_MIN_HEIGHT_PX = 3;
const BAR_IDLE_CLASS = "bg-[var(--adaptive-blue200)]";
const BAR_HOVER_CLASS = "bg-[var(--adaptive-blue500)]";
const BAR_FUTURE_CLASS = "bg-[var(--adaptive-black200)]";

type RouteDetailsTimelineProps = {
    sparkline: HourlyCompareSparkline;
    todayLabel: string;
    yesterdayLabel: string;
    timelineAriaLabel: string;
    hourAriaLabelTemplate: string;
    tooltipTodayTemplate: string;
    tooltipYesterdayTemplate: string;
};

function formatMessage(template: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce((message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)), template);
}

function SummarySide({
    label,
    count,
}: {
    label: string;
    count: number;
}) {
    return (
        <div className="flex w-[52px] shrink-0 flex-col justify-center gap-[2px]">
            <p className="text-[11px] font-[600] leading-none text-[var(--adaptive-black500)]">{label}</p>
            <p className={`text-[18px] font-bold leading-none text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{count.toLocaleString()}</p>
        </div>
    );
}

function HourColumn({
    bucket,
    maxCount,
    isHovered,
    isFuture,
    ariaLabel,
    onHover,
    onLeave,
}: {
    bucket: HourlyCompareBucket;
    maxCount: number;
    isHovered: boolean;
    isFuture: boolean;
    ariaLabel: string;
    onHover: (bucket: HourlyCompareBucket, clientX: number, clientY: number) => void;
    onLeave: () => void;
}) {
    const todayHeight = isFuture ? 0 : resolveHourlyBarHeightPx(bucket.todayCount, maxCount, BAR_MAX_HEIGHT_PX, BAR_MIN_HEIGHT_PX);
    const yesterdayHeight = resolveHourlyBarHeightPx(bucket.yesterdayCount, maxCount, BAR_MAX_HEIGHT_PX, BAR_MIN_HEIGHT_PX);
    const barClass = isHovered ? BAR_HOVER_CLASS : isFuture ? BAR_FUTURE_CLASS : BAR_IDLE_CLASS;

    return (
        <button
            type="button"
            aria-label={ariaLabel}
            className="group relative flex min-w-0 flex-1 flex-col items-center"
            onMouseEnter={(event) => onHover(bucket, event.clientX, event.clientY)}
            onMouseMove={(event) => onHover(bucket, event.clientX, event.clientY)}
            onMouseLeave={onLeave}
            onFocus={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                onHover(bucket, rect.left + rect.width / 2, rect.top + rect.height / 2);
            }}
            onBlur={onLeave}
        >
            <span
                className="flex w-full items-end justify-center"
                style={{ height: `${BAR_MAX_HEIGHT_PX}px` }}
            >
                <span
                    aria-hidden
                    className={`w-full max-w-[8px] rounded-t-[2px] ${barClass}`}
                    style={{ height: `${todayHeight}px` }}
                />
            </span>

            <span
                aria-hidden
                className="h-[1px] w-full bg-[var(--adaptive-border-subtle)]"
            />

            <span
                className="flex w-full items-start justify-center"
                style={{ height: `${BAR_MAX_HEIGHT_PX}px` }}
            >
                <span
                    aria-hidden
                    className={`w-full max-w-[8px] rounded-b-[2px] ${isHovered ? BAR_HOVER_CLASS : BAR_IDLE_CLASS}`}
                    style={{ height: `${yesterdayHeight}px` }}
                />
            </span>
        </button>
    );
}

export function RouteDetailsTimeline({
    sparkline,
    todayLabel,
    yesterdayLabel,
    timelineAriaLabel,
    hourAriaLabelTemplate,
    tooltipTodayTemplate,
    tooltipYesterdayTemplate,
}: RouteDetailsTimelineProps) {
    const [hoveredBucket, setHoveredBucket] = useState<HourlyCompareBucket | null>(null);
    const [hoverPointer, setHoverPointer] = useState<{ clientX: number; clientY: number } | null>(null);

    const activeBucket = useMemo(() => {
        if (hoveredBucket) {
            return hoveredBucket;
        }

        return sparkline.buckets[sparkline.currentHour] ?? sparkline.buckets[0] ?? null;
    }, [hoveredBucket, sparkline.buckets, sparkline.currentHour]);

    const handleHover = (bucket: HourlyCompareBucket, clientX: number, clientY: number) => {
        setHoveredBucket(bucket);
        setHoverPointer({ clientX, clientY });
    };

    const handleLeave = () => {
        setHoveredBucket(null);
        setHoverPointer(null);
    };

    return (
        <section className="flex flex-col border-b border-b-[var(--adaptive-border-subtle)] px-[16px] py-[12px]">
            <div className="flex items-stretch gap-[10px]">
                <div className="flex shrink-0 flex-col justify-between py-[2px]">
                    <SummarySide
                        label={todayLabel}
                        count={activeBucket?.todayCount ?? 0}
                    />
                    <SummarySide
                        label={yesterdayLabel}
                        count={activeBucket?.yesterdayCount ?? 0}
                    />
                </div>

                <div
                    className="flex min-w-0 flex-1 items-stretch gap-[1px]"
                    role="img"
                    aria-label={timelineAriaLabel}
                >
                    {sparkline.buckets.map((bucket) => {
                        const isFuture = bucket.hour > sparkline.currentHour;
                        const isHovered = hoveredBucket?.hour === bucket.hour;

                        return (
                            <HourColumn
                                key={bucket.hour}
                                bucket={bucket}
                                maxCount={sparkline.maxCount}
                                isHovered={isHovered}
                                isFuture={isFuture}
                                ariaLabel={formatMessage(hourAriaLabelTemplate, {
                                    hour: formatHourLabel(bucket.hour),
                                    todayCount: bucket.todayCount,
                                    yesterdayCount: bucket.yesterdayCount,
                                })}
                                onHover={handleHover}
                                onLeave={handleLeave}
                            />
                        );
                    })}
                </div>
            </div>

            <PointerFollowTooltip
                open={Boolean(hoveredBucket && hoverPointer)}
                pointer={hoverPointer}
                className="min-w-[160px]"
            >
                {hoveredBucket ? (
                    <div className="flex flex-col gap-[4px] text-left text-[12px] leading-[1.4]">
                        <p className="flex items-center justify-between gap-[12px]">
                            <span className="text-[var(--adaptive-black500)]">
                                {formatMessage(tooltipTodayTemplate, { hour: formatHourLabel(hoveredBucket.hour) })}
                            </span>
                            <span className={`font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>
                                {hoveredBucket.todayCount.toLocaleString()}
                            </span>
                        </p>
                        <p className="flex items-center justify-between gap-[12px]">
                            <span className="text-[var(--adaptive-black500)]">
                                {formatMessage(tooltipYesterdayTemplate, { hour: formatHourLabel(hoveredBucket.hour) })}
                            </span>
                            <span className={`font-bold text-[var(--adaptive-black900)] ${panelNumericClassName}`}>
                                {hoveredBucket.yesterdayCount.toLocaleString()}
                            </span>
                        </p>
                    </div>
                ) : null}
            </PointerFollowTooltip>
        </section>
    );
}
