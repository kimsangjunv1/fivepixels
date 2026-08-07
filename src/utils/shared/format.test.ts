import { describe, expect, it } from "vitest";
import { formatRelativeTime, formatTimeCompact, getRelativeTimeParts } from "./format.js";

describe("formatTimeCompact", () => {
    it("formats Korean compact time as 오전/오후 HH:mm in local time", () => {
        const afternoon = new Date(2026, 6, 23, 13, 30, 0);
        const midnight = new Date(2026, 6, 23, 0, 5, 0);
        const noon = new Date(2026, 6, 23, 12, 0, 0);

        expect(formatTimeCompact(afternoon.toISOString(), "ko")).toBe("오후 01:30");
        expect(formatTimeCompact(midnight.toISOString(), "ko")).toBe("오전 12:05");
        expect(formatTimeCompact(noon.toISOString(), "ko")).toBe("오후 12:00");
    });
});

describe("getRelativeTimeParts", () => {
    const labels = {
        secondsAgo: (count: number) => `${count}s`,
        minutesAgo: (count: number) => `${count}m`,
        hoursAgo: (count: number) => `${count}h`,
        daysAgo: (count: number) => `${count}d`,
        monthsAgo: (count: number) => `${count}mo`,
        yearsAgo: (count: number) => `${count}y`,
    };

    it("uses seconds, minutes, hours, and days thresholds", () => {
        const now = new Date(2026, 6, 27, 12, 0, 0);

        expect(getRelativeTimeParts(new Date(2026, 6, 27, 11, 59, 45).toISOString(), now)).toEqual({ unit: "second", count: 15 });
        expect(getRelativeTimeParts(new Date(2026, 6, 27, 11, 45, 0).toISOString(), now)).toEqual({ unit: "minute", count: 15 });
        expect(getRelativeTimeParts(new Date(2026, 6, 27, 9, 0, 0).toISOString(), now)).toEqual({ unit: "hour", count: 3 });
        expect(getRelativeTimeParts(new Date(2026, 6, 24, 12, 0, 0).toISOString(), now)).toEqual({ unit: "day", count: 3 });
    });

    it("switches to months only after the calendar month anniversary, clamping end-of-month", () => {
        const created = new Date(2026, 0, 31, 10, 0, 0);

        expect(getRelativeTimeParts(created.toISOString(), new Date(2026, 1, 27, 10, 0, 0))).toEqual({ unit: "day", count: 27 });
        expect(getRelativeTimeParts(created.toISOString(), new Date(2026, 1, 28, 10, 0, 0))).toEqual({ unit: "month", count: 1 });
        expect(getRelativeTimeParts(created.toISOString(), new Date(2026, 2, 31, 10, 0, 0))).toEqual({ unit: "month", count: 2 });
    });

    it("formats years after 12 calendar months", () => {
        const created = new Date(2025, 6, 27, 12, 0, 0);
        const now = new Date(2026, 6, 27, 12, 0, 0);

        expect(getRelativeTimeParts(created.toISOString(), now)).toEqual({ unit: "year", count: 1 });
        expect(formatRelativeTime(created.toISOString(), labels, now)).toBe("1y");
    });
});
