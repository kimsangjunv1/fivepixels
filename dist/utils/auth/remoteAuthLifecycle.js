export function resolveRemoteOnboardingCompleted(isRemoteAuth, selfProfileCompleted, remoteSession) {
    return Boolean(isRemoteAuth && selfProfileCompleted && remoteSession);
}
export function isReportAuthUser(value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    const user = value;
    return typeof user.id === "string" && user.id.length > 0 && typeof user.name === "string" && user.name.length > 0;
}
/** Optional server logout — host may omit the handler and still clear local session. */
export async function invokeOptionalLogout(logout) {
    if (!logout) {
        return;
    }
    await logout();
}
export function applyRefreshUser(returned) {
    if (isReportAuthUser(returned)) {
        return { action: "update", user: returned };
    }
    return { action: "keep" };
}
export function resolveRefreshSessionMethod(current, loginMethod) {
    if (current?.method === "api" || current?.method === "artemis") {
        return current.method;
    }
    return loginMethod === "artemis" ? "artemis" : "api";
}
//# sourceMappingURL=remoteAuthLifecycle.js.map