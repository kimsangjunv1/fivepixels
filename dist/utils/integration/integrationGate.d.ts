import { type IntegrationCapabilities, type IntegrationFeatureId, type IntegrationLockState } from "./integrationFeatures.js";
export declare function buildIntegrationCapabilities(input: {
    sync: IntegrationCapabilities["sync"];
    persistenceMode: IntegrationCapabilities["persistenceMode"];
    persistenceMissingHandlers?: IntegrationCapabilities["persistenceMissingHandlers"];
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
export declare function getIntegrationLock(feature: IntegrationFeatureId, caps: IntegrationCapabilities): IntegrationLockState;
//# sourceMappingURL=integrationGate.d.ts.map