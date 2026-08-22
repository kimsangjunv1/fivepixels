import { resolveIntegrationLock, type IntegrationCapabilities, type IntegrationFeatureId, type IntegrationLockState } from "./integrationFeatures.js";
import type { PersistenceStatus } from "@/utils/shared/storage.js";
import type { IntegrationHandlerName } from "./integrationFeatures.js";

export function buildIntegrationCapabilities(input: {
    sync: IntegrationCapabilities["sync"];
    persistenceMode: IntegrationCapabilities["persistenceMode"];
    persistenceMissingHandlers?: IntegrationHandlerName[];
    listAll: boolean;
    delete: boolean;
    listReplies: boolean;
    createReply: boolean;
    activitySummary: boolean;
    panelBootstrap: boolean;
    githubConfigured: boolean;
    githubIssue: boolean;
    apiLogin: boolean;
    apiRegister: boolean;
    artemisLogin: boolean;
    teamRequest: boolean;
    teamManage: boolean;
    dataTransfer: boolean;
}): IntegrationCapabilities {
    return {
        ...input,
        persistenceMissingHandlers: input.persistenceMissingHandlers ?? [],
    };
}

export function persistenceMissingHandlerNames(status: PersistenceStatus): IntegrationHandlerName[] {
    if (status.mode === "unavailable" || status.mode === "conflict") {
        return [...status.missingHandlers];
    }
    return [];
}

export function getIntegrationLock(feature: IntegrationFeatureId, caps: IntegrationCapabilities): IntegrationLockState {
    return resolveIntegrationLock(feature, caps);
}
