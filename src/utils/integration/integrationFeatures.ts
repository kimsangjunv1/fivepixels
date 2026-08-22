import type { FivePixelsSync } from "@/constants/loginMethod.js";
import type { PersistenceStatus } from "@/utils/shared/storage.js";

/** Public prop / nested handler names shown in lock tooltips. */
export type IntegrationHandlerName =
    | "onList"
    | "onCreate"
    | "onUpdate"
    | "onDelete"
    | "onListAll"
    | "onListReplies"
    | "onCreateReply"
    | "onActivitySummary"
    | "onPanelBootstrap"
    | "onApiLogin"
    | "onApiRegister"
    | "onArtemisLogin"
    | "onListReviewers"
    | "onListReviewerRequests"
    | "onCreateReviewerRequest"
    | "onResolveReviewerRequest"
    | "onRegisterReviewer"
    | "onUpdateReviewer"
    | "github.onCreate";

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
    /** Adapter can list all pages (localStorage always true; API needs onListAll). */
    listAll: boolean;
    /** Adapter can delete (localStorage always true; API needs onDelete). */
    delete: boolean;
    listReplies: boolean;
    createReply: boolean;
    activitySummary: boolean;
    panelBootstrap: boolean;
    /** `github` prop is present and not explicitly disabled. */
    githubConfigured: boolean;
    /** `github.onCreate` is provided. */
    githubIssue: boolean;
    apiLogin: boolean;
    apiRegister: boolean;
    artemisLogin: boolean;
    teamRequest: boolean;
    teamManage: boolean;
    /** Import/export/command — localStorage only. */
    dataTransfer: boolean;
};

export type IntegrationLockState = {
    locked: boolean;
    missingHandlers: IntegrationHandlerName[];
};

const CORE_PERSISTENCE_HANDLERS: IntegrationHandlerName[] = ["onList", "onCreate", "onUpdate"];
const TEAM_MANAGE_HANDLERS: IntegrationHandlerName[] = [
    "onListReviewerRequests",
    "onResolveReviewerRequest",
    "onRegisterReviewer",
    "onUpdateReviewer",
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
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "onListAll"] };
            }
            if (caps.persistenceMode !== "API" || caps.listAll) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onListAll"] };

        case "deleteFeedback":
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "onDelete"] };
            }
            if (caps.persistenceMode !== "API" || caps.delete) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onDelete"] };

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
                return { locked: true, missingHandlers: [...CORE_PERSISTENCE_HANDLERS, "onCreateReviewerRequest"] };
            }
            if (caps.teamRequest) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onCreateReviewerRequest"] };

        case "dataTransfer":
            if (caps.dataTransfer) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: [] };

        case "apiLogin":
            if (caps.sync !== "api" || caps.apiLogin) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onApiLogin"] };

        case "apiRegister":
            if (caps.sync !== "api" || caps.apiRegister) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onApiRegister"] };

        case "artemisLogin":
            if (caps.sync !== "artemis" || caps.artemisLogin) {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onArtemisLogin"] };

        case "activitySummary":
            if (caps.activitySummary) {
                return { locked: false, missingHandlers: [] };
            }
            if (persistenceUnavailable(caps)) {
                return { locked: true, missingHandlers: [...corePersistenceMissing(caps), "onActivitySummary"] };
            }
            if (caps.persistenceMode !== "API") {
                return { locked: false, missingHandlers: [] };
            }
            return { locked: true, missingHandlers: ["onActivitySummary"] };

        default:
            return { locked: false, missingHandlers: [] };
    }
}

export function formatIntegrationMissingHandlers(missingHandlers: IntegrationHandlerName[]): string {
    return missingHandlers.join(", ");
}
