import type { FivePixelsSync } from "@/constants/loginMethod.js";
import type { FivePixelsAdapter } from "@/types/adapter.js";
import type { ReportGitHubConfig } from "@/types/report.js";
import { getIntegrationLock } from "@/utils/integration/integrationGate.js";
import type { IntegrationCapabilities, IntegrationFeatureId, IntegrationHandlerName } from "@/utils/integration/integrationFeatures.js";

export type AdapterIntegrationGroup = "auth" | "session" | "markers" | "feedback" | "cases" | "replies" | "members" | "github";

export type AdapterIntegrationHandlerItem = {
    id: IntegrationHandlerName;
    group: AdapterIntegrationGroup;
    connected: boolean;
    required: boolean;
    relevant: boolean;
};

export type AdapterIntegrationFeatureItem = {
    id: IntegrationFeatureId;
    available: boolean;
    relevant: boolean;
};

export type AdapterIntegrationStatus = {
    sync: FivePixelsSync;
    connectedCount: number;
    totalCount: number;
    requiredConnectedCount: number;
    requiredTotalCount: number;
    handlers: AdapterIntegrationHandlerItem[];
    features: AdapterIntegrationFeatureItem[];
    isRequiredComplete: boolean;
};

type HandlerDefinition = {
    id: IntegrationHandlerName;
    group: AdapterIntegrationGroup;
    relevant: (sync: FivePixelsSync) => boolean;
    required: (sync: FivePixelsSync) => boolean;
    isConnected: (adapter: FivePixelsAdapter | undefined, github?: ReportGitHubConfig) => boolean;
};

const HANDLER_DEFINITIONS: HandlerDefinition[] = [
    { id: "adapter.auth.login", group: "auth", relevant: (sync) => sync === "api", required: (sync) => sync === "api", isConnected: (a) => Boolean(a?.auth?.login) },
    { id: "adapter.auth.signup", group: "auth", relevant: (sync) => sync === "api", required: () => false, isConnected: (a) => Boolean(a?.auth?.signup) },
    { id: "adapter.auth.artemisLogin", group: "auth", relevant: (sync) => sync === "artemis", required: (sync) => sync === "artemis", isConnected: (a) => Boolean(a?.auth?.artemisLogin) },
    { id: "adapter.session.getMe", group: "session", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.session?.getMe) },
    { id: "adapter.session.panelBootstrap", group: "session", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.session?.panelBootstrap) },
    { id: "adapter.session.activitySummary", group: "session", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.session?.activitySummary) },
    { id: "adapter.markers.list", group: "markers", relevant: isRemoteSync, required: isRemoteSync, isConnected: (a) => Boolean(a?.markers?.list) },
    { id: "adapter.feedback.create", group: "feedback", relevant: isRemoteSync, required: isRemoteSync, isConnected: (a) => Boolean(a?.feedback?.create) },
    { id: "adapter.feedback.getForUi", group: "feedback", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.feedback?.getForUi) },
    {
        id: "adapter.feedback.update",
        group: "feedback",
        relevant: isRemoteSync,
        required: isRemoteSync,
        isConnected: (a) => Boolean(a?.feedback?.update || a?.cases?.update),
    },
    { id: "adapter.feedback.delete", group: "feedback", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.feedback?.delete) },
    { id: "adapter.cases.list", group: "cases", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.cases?.list) },
    { id: "adapter.cases.getTimeline", group: "cases", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.cases?.getTimeline) },
    { id: "adapter.replies.list", group: "replies", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.replies?.list) },
    { id: "adapter.replies.create", group: "replies", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.replies?.create) },
    { id: "adapter.members.list", group: "members", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.members?.list) },
    { id: "adapter.members.create", group: "members", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.members?.create) },
    { id: "adapter.members.update", group: "members", relevant: isRemoteSync, required: () => false, isConnected: (a) => Boolean(a?.members?.update) },
];

const FEATURE_DEFINITIONS: Array<{ id: IntegrationFeatureId; relevant: (sync: FivePixelsSync, github?: ReportGitHubConfig) => boolean }> = [
    { id: "feedbackPersistence", relevant: isRemoteSync },
    { id: "apiLogin", relevant: (sync) => sync === "api" },
    { id: "apiRegister", relevant: (sync) => sync === "api" },
    { id: "artemisLogin", relevant: (sync) => sync === "artemis" },
    { id: "deleteFeedback", relevant: isRemoteSync },
    { id: "listAll", relevant: isRemoteSync },
    { id: "teamManage", relevant: isRemoteSync },
    { id: "teamRequest", relevant: isRemoteSync },
    { id: "activitySummary", relevant: isRemoteSync },
    { id: "githubIssue", relevant: (_sync, github) => Boolean(github) && github?.enabled !== false },
    { id: "dataTransfer", relevant: (sync) => sync === "local" },
];

function isRemoteSync(sync: FivePixelsSync): boolean {
    return sync === "api" || sync === "artemis";
}

export function buildAdapterIntegrationStatus(
    adapter: FivePixelsAdapter | undefined,
    sync: FivePixelsSync,
    capabilities: IntegrationCapabilities,
    github?: ReportGitHubConfig,
): AdapterIntegrationStatus | null {
    if (!isRemoteSync(sync)) {
        return null;
    }

    const handlers: AdapterIntegrationHandlerItem[] = HANDLER_DEFINITIONS.filter((definition) => definition.relevant(sync)).map((definition) => {
        const connected = definition.isConnected(adapter, github);

        return {
            id: definition.id,
            group: definition.group,
            connected,
            required: definition.required(sync),
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

    const features: AdapterIntegrationFeatureItem[] = FEATURE_DEFINITIONS.filter((definition) => definition.relevant(sync, github)).map((definition) => ({
        id: definition.id,
        available: !getIntegrationLock(definition.id, capabilities).locked,
        relevant: true,
    }));

    return {
        sync,
        connectedCount,
        totalCount: relevantHandlers.length,
        requiredConnectedCount,
        requiredTotalCount: requiredHandlers.length,
        handlers: relevantHandlers,
        features: features.filter((item) => item.relevant),
        isRequiredComplete: requiredHandlers.length > 0 && requiredConnectedCount === requiredHandlers.length,
    };
}
