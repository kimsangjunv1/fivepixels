import type { ReportEvent, ReportFeedback } from "../types/report.js";

export type ReportEventCallbacks = {
    onCreate?: (feedback: ReportFeedback) => void | Promise<void>;
    onUpdate?: (feedback: ReportFeedback) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
    onReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
};

export async function notifyFeedbackCreate(callbacks: ReportEventCallbacks, feedback: ReportFeedback) {
    try {
        await callbacks.onCreate?.(feedback);
        await callbacks.onEvent?.({ type: "feedback:create", payload: feedback });
    } catch (error) {
        console.error("[stitchable] feedback create callback failed", error);
    }
}

export async function notifyFeedbackUpdate(callbacks: ReportEventCallbacks, feedback: ReportFeedback) {
    try {
        await callbacks.onUpdate?.(feedback);
        await callbacks.onEvent?.({ type: "feedback:update", payload: feedback });
    } catch (error) {
        console.error("[stitchable] feedback update callback failed", error);
    }
}

export async function notifyFeedbackDelete(callbacks: ReportEventCallbacks, id: string) {
    try {
        await callbacks.onDelete?.(id);
        await callbacks.onEvent?.({ type: "feedback:delete", payload: { id } });
    } catch (error) {
        console.error("[stitchable] feedback delete callback failed", error);
    }
}

export async function notifyFeedbackReply(
    callbacks: ReportEventCallbacks,
    params: { feedbackId: string; message: string },
) {
    try {
        await callbacks.onReply?.(params);
        await callbacks.onEvent?.({ type: "feedback:reply", payload: params });
    } catch (error) {
        console.error("[stitchable] feedback reply callback failed", error);
    }
}
