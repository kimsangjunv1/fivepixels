import type { FivePixelsSync } from "../../constants/loginMethod.js";
import type { PersistenceStatus } from "../../utils/shared/storage.js";
/** Public prop / nested handler names shown in lock tooltips. */
export type IntegrationHandlerName = "onList" | "onCreate" | "onUpdate" | "onDelete" | "onListAll" | "onListReplies" | "onCreateReply" | "onActivitySummary" | "onPanelBootstrap" | "onApiLogin" | "onApiRegister" | "onArtemisLogin" | "onListReviewers" | "onListReviewerRequests" | "onCreateReviewerRequest" | "onResolveReviewerRequest" | "onRegisterReviewer" | "onUpdateReviewer" | "github.onCreate";
export type IntegrationFeatureId = "listAll" | "deleteFeedback" | "feedbackPersistence" | "githubIssue" | "teamManage" | "teamRequest" | "dataTransfer" | "apiLogin" | "apiRegister" | "artemisLogin" | "activitySummary";
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
export declare function resolveIntegrationLock(feature: IntegrationFeatureId, caps: IntegrationCapabilities): IntegrationLockState;
export declare function formatIntegrationMissingHandlers(missingHandlers: IntegrationHandlerName[]): string;
//# sourceMappingURL=integrationFeatures.d.ts.map