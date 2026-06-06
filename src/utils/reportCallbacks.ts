import type { ReportEvent, ReportFeedback } from "../types/report.js";

export type ReportSideEffectCallbacks = {
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
};

export async function notifyFeedbackCreate(callbacks: ReportSideEffectCallbacks, feedback: ReportFeedback) {
    try {
        await callbacks.onEvent?.({ type: "feedback:create", payload: feedback });
    } catch (error) {
        console.error("[stitchable] feedback create callback failed", error);
    }
}

export async function notifyFeedbackUpdate(callbacks: ReportSideEffectCallbacks, feedback: ReportFeedback) {
    try {
        await callbacks.onEvent?.({ type: "feedback:update", payload: feedback });
    } catch (error) {
        console.error("[stitchable] feedback update callback failed", error);
    }
}

export async function notifyFeedbackDelete(callbacks: ReportSideEffectCallbacks, id: string) {
    try {
        await callbacks.onEvent?.({ type: "feedback:delete", payload: { id } });
    } catch (error) {
        console.error("[stitchable] feedback delete callback failed", error);
    }
}

export async function notifyFeedbackReply(
    callbacks: ReportSideEffectCallbacks,
    params: { feedbackId: string; message: string },
) {
    try {
        await callbacks.onReply?.(params);
        await callbacks.onEvent?.({ type: "feedback:reply", payload: params });
    } catch (error) {
        console.error("[stitchable] feedback reply callback failed", error);
    }
}

export async function notifyGitHubIssueCreated(
    callbacks: ReportSideEffectCallbacks,
    params: { feedback: ReportFeedback; issueUrl: string },
) {
    try {
        await callbacks.onEvent?.({ type: "feedback:github-issue-created", payload: params });
    } catch (error) {
        console.error("[stitchable] github issue create callback failed", error);
    }
}
