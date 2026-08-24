import type { FivePixelsSync } from "../../constants/loginMethod.js";
import type { PersistenceStatus } from "../../utils/shared/storage.js";
import type { AdapterHandlerName } from "../../utils/adapter/resolveAdapter.js";
/** Adapter / nested handler names shown in lock tooltips. */
export type IntegrationHandlerName = AdapterHandlerName | "github.onCreate";
export type IntegrationFeatureId = "listAll" | "deleteFeedback" | "feedbackPersistence" | "githubIssue" | "teamManage" | "teamRequest" | "dataTransfer" | "apiLogin" | "apiRegister" | "artemisLogin" | "activitySummary";
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
export declare function resolveIntegrationLock(feature: IntegrationFeatureId, caps: IntegrationCapabilities): IntegrationLockState;
export declare function formatIntegrationMissingHandlers(missingHandlers: IntegrationHandlerName[]): string;
//# sourceMappingURL=integrationFeatures.d.ts.map