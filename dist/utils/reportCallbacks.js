export async function notifyFeedbackCreate(callbacks, feedback) {
    try {
        await callbacks.onCreate?.(feedback);
        await callbacks.onEvent?.({ type: "feedback:create", payload: feedback });
    }
    catch (error) {
        console.error("[stitchable] feedback create callback failed", error);
    }
}
export async function notifyFeedbackUpdate(callbacks, feedback) {
    try {
        await callbacks.onUpdate?.(feedback);
        await callbacks.onEvent?.({ type: "feedback:update", payload: feedback });
    }
    catch (error) {
        console.error("[stitchable] feedback update callback failed", error);
    }
}
export async function notifyFeedbackDelete(callbacks, id) {
    try {
        await callbacks.onDelete?.(id);
        await callbacks.onEvent?.({ type: "feedback:delete", payload: { id } });
    }
    catch (error) {
        console.error("[stitchable] feedback delete callback failed", error);
    }
}
export async function notifyFeedbackReply(callbacks, params) {
    try {
        await callbacks.onReply?.(params);
        await callbacks.onEvent?.({ type: "feedback:reply", payload: params });
    }
    catch (error) {
        console.error("[stitchable] feedback reply callback failed", error);
    }
}
//# sourceMappingURL=reportCallbacks.js.map