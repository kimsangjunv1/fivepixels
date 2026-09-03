export async function notifyFeedbackCreate(callbacks, feedback) {
    try {
        await callbacks.onEvent?.({ type: "feedback:create", payload: feedback });
    }
    catch (error) {
        console.error("[fivepixels] feedback create callback failed", error);
    }
}
export async function notifyFeedbackUpdate(callbacks, feedback) {
    try {
        await callbacks.onEvent?.({ type: "feedback:update", payload: feedback });
    }
    catch (error) {
        console.error("[fivepixels] feedback update callback failed", error);
    }
}
export async function notifyFeedbackDelete(callbacks, id) {
    try {
        await callbacks.onEvent?.({ type: "feedback:delete", payload: { id } });
    }
    catch (error) {
        console.error("[fivepixels] feedback delete callback failed", error);
    }
}
export async function notifyFeedbackReply(callbacks, params) {
    try {
        await callbacks.onReply?.(params);
        await callbacks.onEvent?.({ type: "feedback:reply", payload: params });
    }
    catch (error) {
        console.error("[fivepixels] feedback reply callback failed", error);
    }
}
export async function notifyGitHubIssueCreated(callbacks, params) {
    try {
        await callbacks.onEvent?.({ type: "feedback:github-issue-created", payload: params });
    }
    catch (error) {
        console.error("[fivepixels] github issue create callback failed", error);
    }
}
//# sourceMappingURL=reportCallbacks.js.map