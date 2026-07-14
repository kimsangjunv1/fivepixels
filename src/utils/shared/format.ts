import type { ReportLocale } from "@/i18n/types.js";

function toIntlLocale(locale: ReportLocale) {
    return locale === "ko" ? "ko-KR" : "en-US";
}

export function createReplyId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `reply-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDate(value: string, locale: ReportLocale = "en") {
    return new Date(value).toLocaleString(toIntlLocale(locale));
}

export function formatDateOnly(value: string, locale: ReportLocale = "en") {
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

export function formatClockTime(value: string) {
    const date = new Date(value);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

export function formatTimeOnly(value: string, locale: ReportLocale = "en") {
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
