export function createReplyId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `reply-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDate(value: string) {
    return new Date(value).toLocaleString("ko-KR");
}

export function formatDateOnly(value: string) {
    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}년 ${month}월 ${day}일`;
}

export function formatTimeOnly(value: string) {
    const date = new Date(value);

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
