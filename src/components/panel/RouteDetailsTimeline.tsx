import { useLayoutEffect, useRef, useState } from "react";
import type { DailySparklineBucket, MonthlySparkline } from "@/utils/monthlySparkline.js";
import { toDateKey } from "@/utils/heatmapActivity.js";

const CELL_WIDTH_PX = 18;
const PILL_WIDTH_PX = 10;
const BAR_AREA_HEIGHT_PX = 22;
const DAY_LABEL_HEIGHT_PX = 16;
const ROW_GAP_PX = 4;
const TRACK_HEIGHT_PX = BAR_AREA_HEIGHT_PX + ROW_GAP_PX + DAY_LABEL_HEIGHT_PX;
const HEIGHT_NONE_PX = 6;
const HEIGHT_MID_PX = 12;
const HEIGHT_HIGH_PX = 20;

type TimelineLevel = "none" | "mid" | "high";

type RouteDetailsTimelineProps = {
    sparkline: MonthlySparkline;
    selectedDateKey: string;
    onSelectDateKey: (dateKey: string) => void;
    basedOnThisMonthLabel: string;
    timelineAriaLabel: string;
    dayAriaLabelTemplate: string;
    referenceDate?: Date;
};

function formatMessage(template: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce((message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)), template);
}

function resolveTimelineLevel(bucket: DailySparklineBucket, maxCount: number, isFuture: boolean): TimelineLevel {
    if (isFuture || bucket.count <= 0 || maxCount <= 0) {
        return "none";
    }

    if (maxCount === 1) {
        return "mid";
    }

    const midThreshold = maxCount / 2;
    return bucket.count <= midThreshold ? "mid" : "high";
}

function levelToHeight(level: TimelineLevel) {
    if (level === "high") {
        return HEIGHT_HIGH_PX;
    }

    if (level === "mid") {
        return HEIGHT_MID_PX;
    }

    return HEIGHT_NONE_PX;
}

function resolvePillColor(isSelected: boolean, isFuture: boolean) {
    if (isSelected) {
        return "bg-[#F6572E]";
    }

    if (isFuture) {
        return "bg-[var(--adaptive-black300)]";
    }

    return "bg-[var(--adaptive-black900)]";
}

function scrollDateToCenter(container: HTMLElement, dateKey: string) {
    const target = container.querySelector<HTMLElement>(`[data-date-key="${dateKey}"]`);

    if (!target) {
        return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const delta = targetRect.left + targetRect.width / 2 - (containerRect.left + containerRect.width / 2);
    container.scrollLeft += delta;
}

export function RouteDetailsTimeline({
    sparkline,
    selectedDateKey,
    onSelectDateKey,
    basedOnThisMonthLabel,
    timelineAriaLabel,
    dayAriaLabelTemplate,
    referenceDate = new Date(),
}: RouteDetailsTimelineProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const todayKey = toDateKey(referenceDate);
    const centeredMonthRef = useRef<string | null>(null);
    const [sideSpacerPx, setSideSpacerPx] = useState(0);
    const dayCount = sparkline.buckets.length;
    const trackWidthPx = sideSpacerPx * 2 + dayCount * CELL_WIDTH_PX;

    useLayoutEffect(() => {
        const container = scrollRef.current;

        if (!container) {
            return;
        }

        const updateSideSpacer = () => {
            setSideSpacerPx(Math.max(0, Math.round(container.clientWidth / 2 - CELL_WIDTH_PX / 2)));
        };

        updateSideSpacer();

        const observer = new ResizeObserver(updateSideSpacer);
        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        const container = scrollRef.current;

        if (!container || sideSpacerPx <= 0) {
            return;
        }

        if (centeredMonthRef.current === sparkline.monthKey) {
            return;
        }

        scrollDateToCenter(container, todayKey);
        centeredMonthRef.current = sparkline.monthKey;
    }, [sideSpacerPx, sparkline.monthKey, todayKey]);

    return (
        <section className="flex flex-col gap-[4px]">
            <div className="relative border-b border-b-[var(--adaptive-border-subtle)] pt-[10px]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-[0px] left-1/2 z-[2] w-[1px] -translate-x-1/2 bg-[#F6572E]"
                />

                <div
                    ref={scrollRef}
                    className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    role="listbox"
                    aria-label={timelineAriaLabel}
                >
                    <div
                        className="flex items-end"
                        style={{
                            width: `${trackWidthPx}px`,
                            minWidth: `${trackWidthPx}px`,
                        }}
                    >
                        <div
                            aria-hidden
                            className="shrink-0"
                            style={{ width: `${sideSpacerPx}px`, height: `${TRACK_HEIGHT_PX}px` }}
                        />

                        {sparkline.buckets.map((bucket) => {
                            const isSelected = bucket.dateKey === selectedDateKey;
                            const isFuture = bucket.dateKey > todayKey;
                            const level = resolveTimelineLevel(bucket, sparkline.maxCount, isFuture);
                            const heightPx = levelToHeight(level);
                            const pillColor = resolvePillColor(isSelected, isFuture);

                            return (
                                <button
                                    key={bucket.dateKey}
                                    type="button"
                                    role="option"
                                    data-date-key={bucket.dateKey}
                                    aria-selected={isSelected}
                                    aria-label={formatMessage(dayAriaLabelTemplate, { day: bucket.day, count: bucket.count })}
                                    disabled={isFuture}
                                    onClick={() => onSelectDateKey(bucket.dateKey)}
                                    className={`relative z-[1] flex shrink-0 flex-col items-center gap-[4px] ${isFuture ? "cursor-default" : "cursor-pointer"}`}
                                    style={{ width: `${CELL_WIDTH_PX}px` }}
                                >
                                    <span
                                        className="flex w-full items-end justify-center"
                                        style={{ height: `${BAR_AREA_HEIGHT_PX}px` }}
                                    >
                                        <span
                                            aria-hidden
                                            className={`rounded-full ${pillColor}`}
                                            style={{ width: `${PILL_WIDTH_PX}px`, height: `${heightPx}px`, minHeight: "10px" }}
                                        />
                                    </span>

                                    <span
                                        className={`flex h-[14px] min-w-[8px] items-center justify-center rounded-[4px] px-[2px] text-[8px] font-bold leading-none ${
                                            isSelected ? "bg-[#F6572E] text-white" : isFuture ? "text-[var(--adaptive-black400)]" : "text-[var(--adaptive-black700)]"
                                        }`}
                                    >
                                        {bucket.day}
                                    </span>
                                </button>
                            );
                        })}

                        <div
                            aria-hidden
                            className="shrink-0"
                            style={{ width: `${sideSpacerPx}px`, height: `${TRACK_HEIGHT_PX}px` }}
                        />
                    </div>
                </div>
            </div>

            <p className="px-[16px] text-right text-[11px] font-[500] text-[var(--adaptive-black500)] border-b border-b-[var(--adaptive-border-subtle)]">{basedOnThisMonthLabel}</p>
        </section>
    );
}
