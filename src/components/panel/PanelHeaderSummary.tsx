import { useMemo, useState } from "react";
import { useReport } from "@/providers/reportContext.js";
import { formatDateOnly } from "@/utils/format.js";
import { formatStatCount } from "@/utils/formatStatCount.js";
import { buildMonthlySparkline, resolveSparklineBarHeight, resolveSparklineBarTone, type DailySparklineBucket } from "@/utils/monthlySparkline.js";
import { panelNumericClassName } from "@/utils/panelTypography.js";
import { PointerFollowTooltip } from "@/components/ui/PointerFollowTooltip.js";

const SPARKLINE_MAX_HEIGHT_PX = 14;

function formatMessage(template: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce((message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)), template);
}

function TooltipRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-[12px] text-[14px] leading-[1.45]">
            <span className="shrink-0 text-[var(--adaptive-black500)]">{label}</span>
            <span className={`min-w-0 text-right font-[var(--coding-font)] text-[var(--adaptive-black900)] ${panelNumericClassName}`}>{value}</span>
        </div>
    );
}

type PanelHeaderSummaryProps = {
    onOpenYearView: () => void;
};

export function PanelHeaderSummary({ onOpenYearView }: PanelHeaderSummaryProps) {
    const { targetStats, currentPathname, currentPageReports, locale, messages, setFilters, openPanelTab, panelTab } = useReport();
    const sparkline = useMemo(() => buildMonthlySparkline(currentPageReports), [currentPageReports]);
    const panelMessages = messages.panel;
    const [hoveredBucket, setHoveredBucket] = useState<DailySparklineBucket | null>(null);
    const [hoverPointer, setHoverPointer] = useState<{ clientX: number; clientY: number } | null>(null);

    const handleViewDay = (dateKey: string) => {
        setFilters((current) => ({ ...current, dateKey }));

        if (panelTab !== "feedback-list") {
            openPanelTab("feedback-list");
        }
    };

    return (
        <section
            className="flex min-w-0 flex-1 flex-col px-[16px] py-[8px]"
            aria-label={panelMessages.headerSummaryAriaLabel}
        >
            {/* <p className="truncate text-[12px] font-[500] text-[var(--adaptive-black500)]">{currentPathname}</p> */}

            <div className="flex flex-wrap items-end gap-x-[12px] gap-y-[4px]">
                <section className="flex flex-col items-center">
                    <p className="text-[14px]">{formatStatCount(targetStats.inProgress)}</p>
                    <p className="text-[12px]">{panelMessages.statsInProgress}</p>
                </section>

                <section className="flex flex-col items-center">
                    <p className="text-[14px]">{formatStatCount(targetStats.found)}</p>
                    <p className="text-[12px]">{panelMessages.statsFound.toLowerCase()}</p>
                </section>

                <section className="flex flex-col items-center">
                    <p className="text-[14px]">{formatStatCount(targetStats.resolved)}</p>
                    <p className="text-[12px]">{panelMessages.statsResolved.toLowerCase()}</p>
                </section>
            </div>

            {/* <div className="flex items-center gap-[8px]">
                <div className="min-w-0 flex-1">
                    <div className="mb-[4px] flex items-center justify-between gap-[8px]">
                        <p className="text-[11px] font-[600] text-[var(--adaptive-black500)]">{sparkline.monthLabel}</p>
                        <button
                            type="button"
                            onClick={onOpenYearView}
                            className="shrink-0 text-[11px] font-[600] text-[var(--adaptive-blue500)] hover:underline"
                        >
                            {panelMessages.yearView}
                        </button>
                    </div>

                    <div
                        className="flex items-center gap-[2px]"
                        role="img"
                        aria-label={panelMessages.sparklineAriaLabel}
                    >
                        {sparkline.buckets.map((bucket) => {
                            const heightPercent = resolveSparklineBarHeight(bucket.count, sparkline.maxCount);
                            const tone = resolveSparklineBarTone(bucket.count, sparkline.maxCount);
                            const barHeightPx = heightPercent > 0 ? Math.max(2, Math.round((heightPercent / 100) * SPARKLINE_MAX_HEIGHT_PX)) : 2;
                            const labelDate = formatDateOnly(`${bucket.dateKey}T12:00:00`, locale);
                            return (
                                <button
                                    key={bucket.dateKey}
                                    type="button"
                                    aria-label={formatMessage(panelMessages.sparklineDayAriaLabel, {
                                        date: labelDate,
                                        count: bucket.count,
                                    })}
                                    onClick={() => handleViewDay(bucket.dateKey)}
                                    onMouseEnter={(event) => {
                                        setHoveredBucket(bucket);
                                        setHoverPointer({ clientX: event.clientX, clientY: event.clientY });
                                    }}
                                    onMouseMove={(event) => {
                                        setHoverPointer({ clientX: event.clientX, clientY: event.clientY });
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredBucket(null);
                                        setHoverPointer(null);
                                    }}
                                    className={`w-[6px] rounded-[2px] ${
                                        tone === "peak" ? "bg-[var(--adaptive-blue500)]" : tone === "muted" ? "bg-[var(--adaptive-black300)]" : "bg-[var(--adaptive-black200)]"
                                    } hover:ring-1 hover:ring-[var(--adaptive-blue300)]`}
                                    style={{ height: `${barHeightPx}px` }}
                                >
                                    <span className="sr-only">{labelDate}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div> */}

            <PointerFollowTooltip
                open={Boolean(hoveredBucket && hoverPointer)}
                pointer={hoverPointer}
            >
                {hoveredBucket ? (
                    <div className="flex flex-col gap-[6px] text-left">
                        {/* <p className="text-[14px] font-[700] text-[var(--adaptive-black900)]">{formatDateOnly(`${hoveredBucket.dateKey}T12:00:00`, locale)}</p> */}
                        <TooltipRow
                            label={panelMessages.statsFound}
                            value={String(hoveredBucket.stats.found)}
                        />
                        <TooltipRow
                            label={panelMessages.statsResolved}
                            value={String(hoveredBucket.stats.resolved)}
                        />
                        <TooltipRow
                            label={panelMessages.statsInProgress}
                            value={String(hoveredBucket.stats.inProgress)}
                        />
                        {/* <p className="border-t border-[var(--adaptive-border-subtle)] pt-[6px] text-[14px] text-[var(--adaptive-blue500)]">
                            {panelMessages.sparklineViewDay}
                        </p> */}
                    </div>
                ) : null}
            </PointerFollowTooltip>
        </section>
    );
}
