import type { ReportLocale } from "@/i18n/types.js";
import type { ReportActivitySummaryParams, ReportActivitySummaryResult, ReportFeedback } from "@/types/report.js";
import type { HeatmapActorScope, HeatmapMetric, HeatmapViewMode } from "@/types/report-ui.js";

export type HeatmapCell = {
    dateKey: string | null;
    weekIndex: number;
    dayOfWeek: number;
    count: number;
    inRange: boolean;
};

export type HeatmapWeekLabel = {
    weekIndex: number;
    label: string;
};

export type HeatmapYearMonthBucket = {
    monthKey: string;
    monthIndex: number;
    count: number;
};

export type HeatmapYearSummary = {
    buckets: HeatmapYearMonthBucket[];
    maxCount: number;
    totalCount: number;
};

export type HeatmapGrid = {
    cells: HeatmapCell[];
    weekLabels: HeatmapWeekLabel[];
    totalWeeks: number;
    maxCount: number;
    totalCount: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_KEY_PATTERN = /^(\d{4})-(\d{2})$/;

export function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function toMonthKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}

export function parseMonthKey(monthKey: string) {
    const match = MONTH_KEY_PATTERN.exec(monthKey);

    if (!match) {
        throw new Error(`Invalid month key: ${monthKey}`);
    }

    return {
        year: Number(match[1]),
        month: Number(match[2]),
    };
}

export function shiftMonthKey(monthKey: string, delta: number) {
    const { year, month } = parseMonthKey(monthKey);
    const date = new Date(year, month - 1 + delta, 1);

    return toMonthKey(date);
}

export function compareMonthKeys(left: string, right: string) {
    return left.localeCompare(right);
}

export function formatHeatmapMonthLabel(monthKey: string, locale: ReportLocale) {
    const { year, month } = parseMonthKey(monthKey);

    if (locale === "ko") {
        return `${year}년 ${month}월`;
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
    }).format(new Date(year, month - 1, 1));
}

export function startOfLocalDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);

    return next;
}

function alignToSunday(date: Date) {
    const aligned = startOfLocalDay(date);
    aligned.setDate(aligned.getDate() - aligned.getDay());

    return aligned;
}

function isDateKeyInMonth(dateKey: string, monthKey: string) {
    return dateKey.startsWith(`${monthKey}-`);
}

function getMonthGridBounds(monthKey: string) {
    const { year, month } = parseMonthKey(monthKey);
    const rangeStart = startOfLocalDay(new Date(year, month - 1, 1));
    const rangeEnd = startOfLocalDay(new Date(year, month, 0));
    const gridStart = alignToSunday(rangeStart);
    const gridEnd = addDays(alignToSunday(rangeEnd), 6);

    return {
        rangeStart,
        rangeEnd,
        gridStart,
        gridEnd,
    };
}

export function getHeatmapCellDelay(weekIndex: number, dayOfWeek: number, _totalWeeks: number, staggerMs = 16) {
    return (weekIndex + dayOfWeek) * staggerMs;
}

export function getHeatmapCellMaxDelay(totalWeeks: number, staggerMs = 16) {
    if (totalWeeks <= 0) {
        return 0;
    }

    return (totalWeeks - 1 + 6) * staggerMs;
}

export function getHeatmapEntranceDuration(totalWeeks: number, staggerMs = 16, cellDurationMs = 420) {
    return getHeatmapCellMaxDelay(totalWeeks, staggerMs) + cellDurationMs;
}

export function countHeatmapActivity(
    reports: ReportFeedback[],
    options: {
        actorScope: HeatmapActorScope;
        metric: HeatmapMetric;
        actorName?: string | null;
    },
) {
    const counts = new Map<string, number>();
    const actor = options.actorName?.trim() ?? "";

    for (const report of reports) {
        if (options.metric === "created" || options.metric === "activity") {
            const matchesCreatedActor = options.actorScope === "team" || (report.author_name?.trim() === actor && actor.length > 0);

            if (matchesCreatedActor) {
                const createdAt = new Date(report.created_at);

                if (!Number.isNaN(createdAt.getTime())) {
                    const key = toDateKey(createdAt);
                    counts.set(key, (counts.get(key) ?? 0) + 1);
                }
            }
        }

        if (options.metric !== "activity" || !report.replies) {
            continue;
        }

        for (const reply of report.replies) {
            if (reply.author_type === "system") {
                continue;
            }

            const replyActor = reply.author_name?.trim() ?? "";
            const matchesReplyActor = options.actorScope === "team" || (replyActor === actor && actor.length > 0);

            if (!matchesReplyActor) {
                continue;
            }

            const repliedAt = new Date(reply.created_at);

            if (Number.isNaN(repliedAt.getTime())) {
                continue;
            }

            const key = toDateKey(repliedAt);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
    }

    return counts;
}

function applyViewMode(
    dailyCounts: Map<string, number>,
    viewMode: HeatmapViewMode,
    rangeStart: Date,
    rangeEnd: Date,
    gridStart: Date,
) {
    if (viewMode === "daily") {
        return dailyCounts;
    }

    const next = new Map<string, number>();
    const cursor = startOfLocalDay(rangeStart);

    if (viewMode === "cumulative") {
        let runningTotal = 0;

        while (cursor.getTime() <= rangeEnd.getTime()) {
            const key = toDateKey(cursor);
            runningTotal += dailyCounts.get(key) ?? 0;
            next.set(key, runningTotal);
            cursor.setDate(cursor.getDate() + 1);
        }

        return next;
    }

    const weekTotals = new Map<number, number>();

    while (cursor.getTime() <= rangeEnd.getTime()) {
        const key = toDateKey(cursor);
        const weekIndex = Math.floor((cursor.getTime() - gridStart.getTime()) / (7 * DAY_MS));
        weekTotals.set(weekIndex, (weekTotals.get(weekIndex) ?? 0) + (dailyCounts.get(key) ?? 0));
        cursor.setDate(cursor.getDate() + 1);
    }

    const weeklyCursor = startOfLocalDay(rangeStart);

    while (weeklyCursor.getTime() <= rangeEnd.getTime()) {
        const key = toDateKey(weeklyCursor);
        const weekIndex = Math.floor((weeklyCursor.getTime() - gridStart.getTime()) / (7 * DAY_MS));
        next.set(key, weekTotals.get(weekIndex) ?? 0);
        weeklyCursor.setDate(weeklyCursor.getDate() + 1);
    }

    return next;
}

export function buildHeatmapGrid(
    reports: ReportFeedback[],
    options: {
        monthKey: string;
        actorScope: HeatmapActorScope;
        metric: HeatmapMetric;
        viewMode: HeatmapViewMode;
        actorName?: string | null;
    },
): HeatmapGrid {
    const { rangeStart, rangeEnd, gridStart, gridEnd } = getMonthGridBounds(options.monthKey);
    const dailyCounts = countHeatmapActivity(reports, options);
    const counts = applyViewMode(dailyCounts, options.viewMode, rangeStart, rangeEnd, gridStart);

    const cells: HeatmapCell[] = [];
    let maxCount = 0;
    let totalCount = 0;
    const cursor = new Date(gridStart);

    while (cursor.getTime() <= gridEnd.getTime()) {
        const dateKey = toDateKey(cursor);
        const inRange = isDateKeyInMonth(dateKey, options.monthKey);
        const weekIndex = Math.floor((cursor.getTime() - gridStart.getTime()) / (7 * DAY_MS));
        const count = inRange ? (counts.get(dateKey) ?? 0) : 0;

        cells.push({
            dateKey,
            weekIndex,
            dayOfWeek: cursor.getDay(),
            count,
            inRange,
        });

        if (inRange) {
            maxCount = Math.max(maxCount, count);
            if (options.viewMode !== "cumulative") {
                totalCount += dailyCounts.get(dateKey) ?? 0;
            }
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    if (options.viewMode === "cumulative" && cells.length > 0) {
        const lastInRange = [...cells].reverse().find((cell) => cell.inRange);
        totalCount = lastInRange?.count ?? 0;
        maxCount = Math.max(maxCount, totalCount);
    }

    const totalWeeks = cells.length > 0 ? Math.max(...cells.map((cell) => cell.weekIndex)) + 1 : 0;

    return {
        cells,
        weekLabels: [],
        totalWeeks,
        maxCount,
        totalCount,
    };
}

export function formatShortMonthLabel(monthIndex: number, locale: ReportLocale) {
    if (locale === "ko") {
        return `${monthIndex + 1}월`;
    }

    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2000, monthIndex, 1));
}

export function buildYearMonthSummary(
    reports: ReportFeedback[],
    options: {
        year: number;
        actorScope: HeatmapActorScope;
        metric: HeatmapMetric;
        actorName?: string | null;
    },
): HeatmapYearSummary {
    const dailyCounts = countHeatmapActivity(reports, options);
    const buckets: HeatmapYearMonthBucket[] = [];
    let maxCount = 0;
    let totalCount = 0;

    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const monthKey = `${options.year}-${String(monthIndex + 1).padStart(2, "0")}`;
        let count = 0;

        for (const [dateKey, dayCount] of dailyCounts) {
            if (dateKey.startsWith(`${monthKey}-`)) {
                count += dayCount;
            }
        }

        buckets.push({ monthKey, monthIndex, count });
        maxCount = Math.max(maxCount, count);
        totalCount += count;
    }

    return { buckets, maxCount, totalCount };
}

export function buildActivitySummaryFromReports(reports: ReportFeedback[], params: ReportActivitySummaryParams): ReportActivitySummaryResult {
    const actorScope = params.actorScope ?? "team";
    const metric = params.metric ?? "created";

    if (params.month) {
        const monthKey = `${params.year}-${String(params.month).padStart(2, "0")}`;
        const grid = buildHeatmapGrid(reports, {
            monthKey,
            actorScope,
            metric,
            viewMode: "daily",
            actorName: params.actorName ?? null,
        });
        const buckets = grid.cells
            .filter((cell) => cell.inRange && cell.dateKey)
            .map((cell) => ({
                dateKey: cell.dateKey!,
                count: cell.count,
            }));

        return {
            year: params.year,
            month: params.month,
            buckets,
            totalCount: grid.totalCount,
        };
    }

    const yearSummary = buildYearMonthSummary(reports, {
        year: params.year,
        actorScope,
        metric,
        actorName: params.actorName ?? null,
    });

    return {
        year: params.year,
        buckets: yearSummary.buckets.map((bucket) => ({
            dateKey: bucket.monthKey,
            count: bucket.count,
        })),
        totalCount: yearSummary.totalCount,
    };
}

export function getYearMonthCellDelay(monthIndex: number, staggerMs = 24) {
    return monthIndex * staggerMs;
}

export function getYearEntranceDuration(staggerMs = 24, cellDurationMs = 320) {
    return 11 * staggerMs + cellDurationMs;
}

export function resolveHeatmapLevel(count: number, maxCount: number) {
    if (count <= 0 || maxCount <= 0) {
        return 0;
    }

    const ratio = count / maxCount;

    if (ratio <= 0.25) {
        return 1;
    }

    if (ratio <= 0.5) {
        return 2;
    }

    if (ratio <= 0.75) {
        return 3;
    }

    return 4;
}
