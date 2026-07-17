export type { FivePixelsProps, ReportProviderProps } from "@/types/publicApi.js";
export { FivePixels } from "./FivePixels.js";
export { ReportProvider } from "@/providers/ReportProvider.js";
export { useReport, useReportPreferences, useReportSession, useReportData } from "@/providers/reportContext.js";
export type { ReportPreferencesValue, ReportSessionValue, ReportDataValue } from "@/providers/reportContext.js";
export { createLocalStorageReportAdapter } from "@/storage/local/localStorageAdapter.js";
export type {
    CreateReportFeedbackPayload,
    ReportAppearance,
    ReportAuthAction,
    ReportAuthProof,
    ReportEvent,
    ReportCase,
    ReportCaseStatus,
    ReportFeedback,
    ReportField,
    ReportFieldBase,
    ReportFieldType,
    ReportFieldValues,
    ReportAuthor,
    ReportGitHubIssueCreateResult,
    ReportGitHubIntegrationMode,
    ReportGitHubIntegrationState,
    ReportIdentify,
    ReportGitHubConfig,
    ReportIntegrations,
    ReportListAllParams,
    ReportListAllResult,
    ReportActivitySummaryParams,
    ReportActivitySummaryResult,
    ReportActivitySummaryBucket,
    ReportPanelBootstrapParams,
    ReportPanelBootstrapResult,
    ReportPanelStats,
    ReportRouteDetailsSummary,
    ReportPersistenceHandlers,
    ReportPosition,
    ReportPositionAnchor,
    ReportPositionRatio,
    ReportPositionViewport,
    ReportProject,
    QuestionThreadDisplay,
    FivePixelsMode,
    ReportTeam,
    ReportUi,
    ReportVisibility,
    ReportReply,
    ReportReplyStatus,
    ReportStatus,
    ReportStorageAdapter,
    ReportTargetType,
    SerializedReportFeedback,
    SerializedReportReply,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";

export {
    allCasesResolved,
    applyCaseStatusSync,
    createCaseId,
    createReportCase,
    getIssueProgressLabel,
    getIssueSummary,
    getOpenCases,
    getReportCases,
    shouldShowCaseProgress,
    getResolvedCaseCount,
    resolveCases,
    syncIssueStatusFromCases,
    canEditReportCases,
} from "@/utils/report/reportCases.js";
export { createReportAuthMessage, parsePublicKey, verifyReportAuthProof } from "@/utils/auth/personalKey.js";
export { REPORT_STATUS_FLOW, REPORT_STATUS_TRANSITIONS } from "@/types/report.js";
export {
    buildGitHubIssueUpdate,
    canCreateGitHubIssueFromList,
    canCreateGitHubIssueOnCreate,
    createGitIssuedReply,
    getGitHubIssueUrl,
    hasGitHubIssue,
    isGitIssued,
    isGitIssuedSystemReply,
    isGitHubIssueIntegrationEnabled,
} from "@/utils/github/githubIntegration.js";
export type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "@/i18n/index.js";
export { en as reportMessagesEn, ensureReportLocaleMessages, getDefaultFields, getReportMessages, resolveReportLocale } from "@/i18n/index.js";
export { FEEDBACK_STORAGE_CHANGED_EVENT, dispatchFeedbackStorageChanged } from "@/constants/feedbackStorageEvents.js";
export {
    findFeedbackInsertConflicts,
    getFeedbackStorageKey,
    insertFeedbackItems,
    readAllFeedback,
    upsertFeedbackItems,
    writeAllFeedback,
    type FeedbackInsertResult,
    type FeedbackTransferScope,
} from "@/utils/feedback/feedbackDataTransfer.js";
