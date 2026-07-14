import type { ReportFeedback } from "@/types/report.js";
import { toDateKey } from "@/utils/panel/heatmapActivity.js";

export type HourlyCompareBucket = {
    hour: number;
    todayCount: number;
    yesterdayCount: number;
};

export type HourlyCompareSparkline = {
    todayDateKey: string;
    yesterdayDateKey: string;
    currentHour: number;
    buckets: HourlyCompareBucket[];
    maxCount: number;
    todayTotal: number;
    yesterdayTotal: number;
};

function shiftDateKey(dateKey: string, deltaDays: number) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + deltaDays);
    return toDateKey(date);
}

function createEmptyHourCounts() {
    return Array.from({ length: 24 }, () => 0);
}

function resolveBarHeightPx(count: number, maxCount: number, maxHeightPx: number, minHeightPx: number) {
    if (count <= 0 || maxCount <= 0) {
        return 0;
    }

    return Math.max(minHeightPx, Math.round((count / maxCount) * maxHeightPx));
}

export function resolveHourlyBarHeightPx(count: number, maxCount: number, maxHeightPx = 36, minHeightPx = 3) {
    return resolveBarHeightPx(count, maxCount, maxHeightPx, minHeightPx);
}

export function formatHourLabel(hour: number) {
    return `${String(hour).padStart(2, "0")}:00`;
}

export function buildHourlyCompareSparkline(reports: ReportFeedback[], referenceDate = new Date()): HourlyCompareSparkline {
    const todayDateKey = toDateKey(referenceDate);
    const yesterdayDateKey = shiftDateKey(todayDateKey, -1);
    const currentHour = referenceDate.getHours();
    const todayCounts = createEmptyHourCounts();
    const yesterdayCounts = createEmptyHourCounts();

    for (const report of reports) {
        const createdAt = new Date(report.created_at);

        if (Number.isNaN(createdAt.getTime())) {
            continue;
        }

        const createdKey = toDateKey(createdAt);
        const hour = createdAt.getHours();

        if (createdKey === todayDateKey) {
            todayCounts[hour] += 1;
        } else if (createdKey === yesterdayDateKey) {
            yesterdayCounts[hour] += 1;
        }
    }

    let maxCount = 0;
    let todayTotal = 0;
    let yesterdayTotal = 0;
    const buckets: HourlyCompareBucket[] = [];

    for (let hour = 0; hour < 24; hour += 1) {
        const todayCount = todayCounts[hour] ?? 0;
        const yesterdayCount = yesterdayCounts[hour] ?? 0;
        todayTotal += todayCount;
        yesterdayTotal += yesterdayCount;
        maxCount = Math.max(maxCount, todayCount, yesterdayCount);
        buckets.push({ hour, todayCount, yesterdayCount });
    }

    return {
        todayDateKey,
        yesterdayDateKey,
        currentHour,
        buckets,
        maxCount,
        todayTotal,
        yesterdayTotal,
    };
}
