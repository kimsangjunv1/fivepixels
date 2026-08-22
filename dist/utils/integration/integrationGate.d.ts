import { type IntegrationCapabilities, type IntegrationFeatureId, type IntegrationLockState } from "./integrationFeatures.js";
import type { PersistenceStatus } from "../../utils/shared/storage.js";
import type { IntegrationHandlerName } from "./integrationFeatures.js";
export declare function buildIntegrationCapabilities(input: {
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
}): IntegrationCapabilities;
export declare function persistenceMissingHandlerNames(status: PersistenceStatus): IntegrationHandlerName[];
export declare function getIntegrationLock(feature: IntegrationFeatureId, caps: IntegrationCapabilities): IntegrationLockState;
//# sourceMappingURL=integrationGate.d.ts.map