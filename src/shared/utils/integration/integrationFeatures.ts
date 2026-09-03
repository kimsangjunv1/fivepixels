import type { FivePixelsSync } from "@/shared/constants/loginMethod.js";
import type { PersistenceStatus } from "@/shared/utils/shared/storage.js";
import type { AdapterHandlerName } from "@/shared/utils/adapter/resolveAdapter.js";

/** Adapter / nested handler names shown in lock tooltips. */
export type IntegrationHandlerName = AdapterHandlerName | "github.onCreate";

export type IntegrationFeatureId =
    | "listAll"
    | "deleteFeedback"
    | "feedbackPersistence"
    | "githubIssue"
    | "teamManage"
    | "teamRequest"
    | "dataTransfer"
    | "apiLogin"
    | "apiRegister"
    | "artemisLogin"
    | "activitySummary";

export type IntegrationCapabilities = {
    sync: FivePixelsSync;
    persistenceMode: PersistenceStatus["mode"];
    persistenceMissingHandlers: IntegrationHandlerName[];
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
};

export type IntegrationLockState = {
    locked: boolean;
    missingHandlers: IntegrationHandlerName[];
};

const CORE_PERSISTENCE_HANDLERS: IntegrationHandlerName[] = [
    "adapter.markers.list",
    "adapter.feedback.create",
    "adapter.feedback.update",
];

const TEAM_MANAGE_HANDLERS: IntegrationHandlerName[] = [
    "adapter.members.list",
    "adapter.members.update",
];

function persistenceUnavailable(caps: IntegrationCapabilities): boolean {
    return caps.persistenceMode === "unavailable";
}

function corePersistenceMissing(caps: IntegrationCapabilities): IntegrationHandlerName[] {
    if (caps.persistenceMissingHandlers.length > 0) {
        return caps.persistenceMissingHandlers;
    }
    return [...CORE_PERSISTENCE_HANDLERS];
}

export function resolveIntegrationLock(feature: IntegrationFeatureId, caps: IntegrationCapabilities): IntegrationLockState {
    switch (feature) {
        case "feedbackPersistence":
            if (!persistenceUnavailable(caps)) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: corePersistenceMissing(caps) };

        case "listAll":
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "adapter.markers.list"] };
            }
            if (caps.persistenceMode !== "API" || caps.listAll) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["adapter.markers.list"] };

        case "deleteFeedback":
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "adapter.feedback.delete"] };
            }
            if (caps.persistenceMode !== "API" || caps.delete) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["adapter.feedback.delete"] };

        case "githubIssue":
            if (!caps.githubConfigured || caps.githubIssue) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["github.onCreate"] };

        case "teamManage":
            if (caps.persistenceMode !== "API") {
                return { locked: true, missingHandlers: [...CORE_PERSISTENCE_HANDLERS, ...TEAM_MANAGE_HANDLERS] };
            }
            if (caps.teamManage) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: [...TEAM_MANAGE_HANDLERS] };

        case "teamRequest":
            if (caps.persistenceMode !== "API") {
                return { locked: true, missingHandlers: [...CORE_PERSISTENCE_HANDLERS, "adapter.members.create"] };
            }
            if (caps.teamRequest) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["adapter.members.create"] };

        case "dataTransfer":
            if (caps.dataTransfer) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: [] };

        case "apiLogin":
            if (caps.sync !== "api" || caps.apiLogin) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["adapter.auth.login"] };

        case "apiRegister":
            if (caps.sync !== "api" || caps.apiRegister) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["adapter.auth.signup"] };

        case "artemisLogin":
            if (caps.sync !== "artemis" || caps.artemisLogin) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["adapter.auth.artemisLogin"] };

        case "activitySummary":
            if (caps.activitySummary) {
                return { locked: false, missingHandlers: [] };
            }
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "adapter.session.activitySummary"] };
            }
            if (caps.persistenceMode !== "API") {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["adapter.session.activitySummary"] };

        default:
            return { locked: false, missingHandlers: [] };
    }
}

export function formatIntegrationMissingHandlers(missingHandlers: IntegrationHandlerName[]): string {
    return missingHandlers.join(", ");
}
