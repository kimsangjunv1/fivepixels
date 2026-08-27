import { getIntegrationLock } from "../../utils/integration/integrationGate.js";
const HANDLER_DEFINITIONS = [
    {
        id: "adapter.auth.login",
        group: "auth",
        relevant: ({ sync, requireAuth }) => sync === "api" && requireAuth,
        required: ({ sync, requireAuth }) => sync === "api" && requireAuth,
        isConnected: (a) => Boolean(a?.auth?.login),
    },
    {
        id: "adapter.auth.signup",
        group: "auth",
        relevant: ({ sync, requireAuth }) => sync === "api" && requireAuth,
        required: () => false,
        isConnected: (a) => Boolean(a?.auth?.signup),
    },
    {
        id: "adapter.auth.logout",
        group: "auth",
        relevant: ({ sync, requireAuth }) => sync === "api" && requireAuth,
        required: () => false,
        isConnected: (a) => Boolean(a?.auth?.logout),
    },
    {
        id: "adapter.auth.refresh",
        group: "auth",
        relevant: ({ sync, requireAuth }) => sync === "api" && requireAuth,
        required: () => false,
        isConnected: (a) => Boolean(a?.auth?.refresh),
    },
    {
        id: "adapter.auth.artemisLogin",
        group: "auth",
        relevant: ({ sync, requireAuth }) => sync === "artemis" && requireAuth,
        required: ({ sync, requireAuth }) => sync === "artemis" && requireAuth,
        isConnected: (a) => Boolean(a?.auth?.artemisLogin),
    },
    { id: "adapter.session.panelBootstrap", group: "session", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.session?.panelBootstrap) },
    { id: "adapter.session.activitySummary", group: "session", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.session?.activitySummary) },
    { id: "adapter.markers.list", group: "markers", relevant: isRemoteSyncCtx, required: isRemoteSyncCtx, isConnected: (a) => Boolean(a?.markers?.list) },
    { id: "adapter.feedback.create", group: "feedback", relevant: isRemoteSyncCtx, required: isRemoteSyncCtx, isConnected: (a) => Boolean(a?.feedback?.create) },
    { id: "adapter.feedback.getForUi", group: "feedback", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.feedback?.getForUi) },
    { id: "adapter.feedback.get", group: "feedback", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.feedback?.get) },
    {
        id: "adapter.feedback.update",
        group: "feedback",
        relevant: isRemoteSyncCtx,
        required: isRemoteSyncCtx,
        isConnected: (a) => Boolean(a?.feedback?.update || a?.cases?.update),
    },
    { id: "adapter.feedback.updateAssignee", group: "feedback", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.feedback?.updateAssignee) },
    { id: "adapter.feedback.updateStatus", group: "feedback", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.feedback?.updateStatus) },
    { id: "adapter.feedback.delete", group: "feedback", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.feedback?.delete) },
    { id: "adapter.cases.list", group: "cases", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.cases?.list) },
    { id: "adapter.cases.listByProject", group: "cases", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.cases?.listByProject) },
    { id: "adapter.cases.get", group: "cases", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.cases?.get) },
    { id: "adapter.cases.create", group: "cases", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.cases?.create) },
    { id: "adapter.cases.updateAssignee", group: "cases", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.cases?.updateAssignee) },
    { id: "adapter.cases.updateStatus", group: "cases", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.cases?.updateStatus) },
    { id: "adapter.cases.getTimeline", group: "cases", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.cases?.getTimeline) },
    { id: "adapter.replies.list", group: "replies", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.replies?.list) },
    { id: "adapter.replies.create", group: "replies", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.replies?.create) },
    { id: "adapter.replies.update", group: "replies", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.replies?.update) },
    { id: "adapter.replies.delete", group: "replies", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.replies?.delete) },
    { id: "adapter.members.list", group: "members", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.members?.list) },
    { id: "adapter.members.create", group: "members", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.members?.create) },
    { id: "adapter.members.update", group: "members", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.members?.update) },
    { id: "adapter.members.delete", group: "members", relevant: isRemoteSyncCtx, required: () => false, isConnected: (a) => Boolean(a?.members?.delete) },
];
const FEATURE_DEFINITIONS = [
    { id: "feedbackPersistence", relevant: (ctx) => isRemoteSync(ctx.sync) },
    { id: "apiLogin", relevant: (ctx) => ctx.sync === "api" && ctx.requireAuth },
    { id: "apiRegister", relevant: (ctx) => ctx.sync === "api" && ctx.requireAuth },
    { id: "artemisLogin", relevant: (ctx) => ctx.sync === "artemis" && ctx.requireAuth },
    { id: "deleteFeedback", relevant: (ctx) => isRemoteSync(ctx.sync) },
    { id: "listAll", relevant: (ctx) => isRemoteSync(ctx.sync) },
    { id: "teamManage", relevant: (ctx) => isRemoteSync(ctx.sync) },
    { id: "teamRequest", relevant: (ctx) => isRemoteSync(ctx.sync) },
    { id: "activitySummary", relevant: (ctx) => isRemoteSync(ctx.sync) },
    { id: "githubIssue", relevant: (_ctx, github) => Boolean(github) && github?.enabled !== false },
    { id: "dataTransfer", relevant: (ctx) => ctx.sync === "local" },
];
function isRemoteSync(sync) {
    return sync === "api" || sync === "artemis";
}
function isRemoteSyncCtx(ctx) {
    return isRemoteSync(ctx.sync);
}
export function buildAdapterIntegrationStatus(adapter, sync, capabilities, github, requireAuth = true) {
    if (!isRemoteSync(sync)) {
        return null;
    }
    const ctx = { sync, requireAuth };
    const handlers = HANDLER_DEFINITIONS.filter((definition) => definition.relevant(ctx)).map((definition) => {
        const connected = definition.isConnected(adapter, github);
        return {
            id: definition.id,
            group: definition.group,
            connected,
            required: definition.required(ctx),
            relevant: true,
        };
    });
    if (github && github.enabled !== false) {
        handlers.push({
            id: "github.onCreate",
            group: "github",
            connected: Boolean(github.onCreate),
            required: false,
            relevant: true,
        });
    }
    const relevantHandlers = handlers.filter((item) => item.relevant);
    const requiredHandlers = relevantHandlers.filter((item) => item.required);
    const connectedCount = relevantHandlers.filter((item) => item.connected).length;
    const requiredConnectedCount = requiredHandlers.filter((item) => item.connected).length;
    const features = FEATURE_DEFINITIONS.filter((definition) => definition.relevant(ctx, github)).map((definition) => ({
        id: definition.id,
        available: !getIntegrationLock(definition.id, capabilities).locked,
        relevant: true,
    }));
    return {
        sync,
        requireAuth,
        connectedCount,
        totalCount: relevantHandlers.length,
        requiredConnectedCount,
        requiredTotalCount: requiredHandlers.length,
        handlers: relevantHandlers,
        features: features.filter((item) => item.relevant),
        isRequiredComplete: requiredHandlers.length > 0 && requiredConnectedCount === requiredHandlers.length,
    };
}
//# sourceMappingURL=buildAdapterIntegrationStatus.js.map