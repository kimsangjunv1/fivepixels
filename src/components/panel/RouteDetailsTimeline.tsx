import { useMemo, useState } from "react";
import { StyleInspectTooltip, StyleInspectTooltipRow } from "@/components/ui/StyleInspectTooltip.js";
import { panelNumericClassName } from "@/utils/panel/panelTypography.js";
import { formatHourLabel, resolveHourlyBarHeightPx, type HourlyCompareBucket, type HourlyCompareSparkline } from "@/utils/panel/hourlyCompareSparkline.js";

const BAR_MAX_HEIGHT_PX = 36;
const BAR_MIN_HEIGHT_PX = 3;
const BAR_IDLE_CLASS = "bg-[var(--adaptive-black900)]";
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

function SummarySide({ label, count }: { label: string; count: number }) {
    return (
        <div className="flex shrink-0 flex-col justify-center gap-[8px] p-[8px]">
            <p className="text-[14px] font-[600] leading-none text-[var(--adaptive-black500)]">{label}</p>
            <p className={`text-[14px] font-bold leading-none text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{count.toLocaleString()}</p>
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
                className="flex-1 flex w-full items-end justify-center"
                style={{ height: `${BAR_MAX_HEIGHT_PX}px` }}
            >
                <span
                    aria-hidden
                    className={`w-full max-w-[8px] ${barClass}`}
                    style={{ height: `${todayHeight}px` }}
                />
            </span>

            <span
                aria-hidden
                className="h-[0.1px] w-full bg-[var(--adaptive-border-subtle)]"
            />

            <span
                className="flex-1 flex w-full items-start justify-center"
                style={{ height: `${BAR_MAX_HEIGHT_PX}px` }}
            >
                <span
                    aria-hidden
                    className={`w-full max-w-[8px] ${isHovered ? BAR_HOVER_CLASS : BAR_IDLE_CLASS}`}
                    style={{ height: `${yesterdayHeight}px` }}
                />
            </span>
        </button>
    );
}

export function RouteDetailsTimeline({ sparkline, todayLabel, yesterdayLabel, timelineAriaLabel, hourAriaLabelTemplate, tooltipTodayTemplate, tooltipYesterdayTemplate }: RouteDetailsTimelineProps) {
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
        <section className="flex border-b border-b-[var(--adaptive-border-subtle)]">
            <div className="flex shrink-0 flex-col justify-between border-r border-r-[var(--adaptive-border-subtle)]">
                <SummarySide
                    label={todayLabel}
                    count={activeBucket?.todayCount ?? 0}
                />
                <div className="h-[0.1px] w-full bg-[var(--adaptive-border-subtle)]" />
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

            <StyleInspectTooltip
                open={Boolean(hoveredBucket && hoverPointer)}
                pointer={hoverPointer}
            >
                {hoveredBucket ? (
                    <>
                        <StyleInspectTooltipRow
                            label={formatMessage(tooltipTodayTemplate, { hour: formatHourLabel(hoveredBucket.hour) })}
                            value={hoveredBucket.todayCount.toLocaleString()}
                        />
                        <StyleInspectTooltipRow
                            label={formatMessage(tooltipYesterdayTemplate, { hour: formatHourLabel(hoveredBucket.hour) })}
                            value={hoveredBucket.yesterdayCount.toLocaleString()}
                        />
                    </>
                ) : null}
            </StyleInspectTooltip>
        </section>
    );
}
