function toIntlLocale(locale) {
    return locale === "ko" ? "ko-KR" : "en-US";
}
export function createReplyId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `reply-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
export function formatDate(value, locale = "en") {
    return new Date(value).toLocaleString(toIntlLocale(locale));
}
export function formatDateOnly(value, locale = "en") {
    const date = new Date(value);
    if (locale === "ko") {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}년 ${month}월 ${day}일`;
    }
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(date);
}
export function formatClockTime(value) {
    const date = new Date(value);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}
export function formatTimeOnly(value, locale = "en") {
    const date = new Date(value);
    if (locale === "ko") {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const isAM = hours < 12;
        const period = isAM ? "오전" : "오후";
        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }
        const displayHour = String(hours).padStart(2, "0");
        return `${period} ${displayHour}시 ${minutes}분`;
    }
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}
/** Compact clock for thread meta, e.g. `오후 01:30` / `1:30 PM`. */
export function formatTimeCompact(value, locale = "en") {
    const date = new Date(value);
    if (locale === "ko") {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const isAM = hours < 12;
        const period = isAM ? "오전" : "오후";
        hours = hours % 12;
        if (hours === 0) {
            hours = 12;
        }
        return `${period} ${String(hours).padStart(2, "0")}:${minutes}`;
    }
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
}
/** Add calendar months while clamping day to the target month's last day. */
function addCalendarMonths(date, months) {
    const year = date.getFullYear();
    const month = date.getMonth() + months;
    const targetYear = year + Math.floor(month / 12);
    const targetMonth = ((month % 12) + 12) % 12;
    const day = Math.min(date.getDate(), daysInMonth(targetYear, targetMonth));
    return new Date(targetYear, targetMonth, day, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}
function getCalendarMonthsDiff(from, to) {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (months <= 0) {
        return 0;
    }
    const anniversary = addCalendarMonths(from, months);
    if (to.getTime() < anniversary.getTime()) {
        months -= 1;
    }
    return Math.max(0, months);
}
export function getRelativeTimeParts(value, now = new Date()) {
    const then = new Date(value);
    if (Number.isNaN(then.getTime()) || Number.isNaN(now.getTime())) {
        return null;
    }
    const diffMs = Math.max(0, now.getTime() - then.getTime());
    if (diffMs < MS_PER_MINUTE) {
        return { unit: "second", count: Math.max(1, Math.floor(diffMs / MS_PER_SECOND)) };
    }
    if (diffMs < MS_PER_HOUR) {
        return { unit: "minute", count: Math.floor(diffMs / MS_PER_MINUTE) };
    }
    if (diffMs < MS_PER_DAY) {
        return { unit: "hour", count: Math.floor(diffMs / MS_PER_HOUR) };
    }
    const months = getCalendarMonthsDiff(then, now);
    if (months < 1) {
        return { unit: "day", count: Math.max(1, Math.floor(diffMs / MS_PER_DAY)) };
    }
    if (months < 12) {
        return { unit: "month", count: months };
    }
    return { unit: "year", count: Math.floor(months / 12) };
}
export function formatRelativeTime(value, labels, now = new Date()) {
    const parts = getRelativeTimeParts(value, now);
    if (!parts) {
        return "";
    }
    switch (parts.unit) {
        case "second":
            return labels.secondsAgo(parts.count);
        case "minute":
            return labels.minutesAgo(parts.count);
        case "hour":
            return labels.hoursAgo(parts.count);
        case "day":
            return labels.daysAgo(parts.count);
        case "month":
            return labels.monthsAgo(parts.count);
        case "year":
            return labels.yearsAgo(parts.count);
    }
}
/** Compact feed timestamps like `12m`, `3h`, `5d` (reference activity-feed style). */
export function formatRelativeTimeCompact(value, now = new Date()) {
    const parts = getRelativeTimeParts(value, now);
    if (!parts) {
        return "";
    }
    if (parts.unit === "second") {
        return "now";
    }
    const suffix = {
        minute: "m",
        hour: "h",
        day: "d",
        month: "mo",
        year: "y",
    };
    return `${parts.count}${suffix[parts.unit]}`;
}
//# sourceMappingURL=format.js.map