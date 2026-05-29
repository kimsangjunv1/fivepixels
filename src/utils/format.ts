export function createReplyId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `reply-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDate(value: string) {
    return new Date(value).toLocaleString("ko-KR");
}
