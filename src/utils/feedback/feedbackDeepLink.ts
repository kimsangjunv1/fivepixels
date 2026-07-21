import type { ReportFeedback } from "@/types/report.js";

export const FEEDBACK_DEEP_LINK_FLAG = "fivepixels";
export const FEEDBACK_DEEP_LINK_TARGET = "feedback";
export const FEEDBACK_DEEP_LINK_ID_PARAM = "idx";

export type FeedbackDeepLink = {
    feedbackId: string;
};

export function parseFeedbackDeepLink(search = typeof window !== "undefined" ? window.location.search : ""): FeedbackDeepLink | null {
    const params = new URLSearchParams(search);

    if (params.get(FEEDBACK_DEEP_LINK_FLAG) !== "true") {
        return null;
    }

    if (params.get("target") !== FEEDBACK_DEEP_LINK_TARGET) {
        return null;
    }

    const feedbackId = params.get(FEEDBACK_DEEP_LINK_ID_PARAM)?.trim();

    if (!feedbackId) {
        return null;
    }

    return { feedbackId };
}

export function buildFeedbackShareUrl(report: Pick<ReportFeedback, "id" | "pathname">, origin = typeof window !== "undefined" ? window.location.origin : "http://localhost") {
    const url = new URL(report.pathname, origin);

    url.searchParams.set(FEEDBACK_DEEP_LINK_FLAG, "true");
    url.searchParams.set("target", FEEDBACK_DEEP_LINK_TARGET);
    url.searchParams.set(FEEDBACK_DEEP_LINK_ID_PARAM, report.id);

    return url.toString();
}

export function clearFeedbackDeepLinkFromUrl() {
    if (typeof window === "undefined") {
        return;
    }

    const url = new URL(window.location.href);

    url.searchParams.delete("target");
    url.searchParams.delete(FEEDBACK_DEEP_LINK_ID_PARAM);

    const next = `${url.pathname}${url.search}${url.hash}`;

    window.history.replaceState(window.history.state, "", next);
}
