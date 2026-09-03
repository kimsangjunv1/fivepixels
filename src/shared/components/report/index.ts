export type { FivePixelsProps, FivePixelsRequire, ReportProviderProps, ResolvedFivePixelsRequire } from "@/shared/types/publicApi.js";
export type {
    FivePixelsAdapter,
    FivePixelsAuthAdapter,
    FivePixelsCaseAssigneePayload,
    FivePixelsCaseStatusPayload,
    FivePixelsCasesAdapter,
    FivePixelsCaseTimelineResult,
    FivePixelsFeedbackAdapter,
    FivePixelsFeedbackAssigneePayload,
    FivePixelsFeedbackStatusPayload,
    FivePixelsMarkersAdapter,
    FivePixelsMarkersListParams,
    FivePixelsMembersAdapter,
    FivePixelsRepliesAdapter,
    FivePixelsSessionAdapter,
    UpdateReplyPayload,
} from "@/shared/types/adapter.js";
export { FivePixels } from "@/core/FivePixels.js";
export { DotWaveOverlay, type DotWaveOrigin, type DotWaveOverlayProps } from "@/core/DotWaveOverlay.js";
export { ReportProvider } from "@/shared/providers/ReportProvider.js";
export { useReport, useReportPreferences, useReportSession, useReportData } from "@/shared/providers/reportContext.js";
export type { ReportPreferencesValue, ReportSessionValue, ReportDataValue } from "@/shared/providers/reportContext.js";
export { createLocalStorageReportAdapter } from "@/shared/storage/local/localStorageAdapter.js";
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
    ReportAuthorRole,
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
    ReportTeamHandlers,
    ReportAuthHandlers,
    ReportAuthUser,
    ReportApiLoginPayload,
    ReportApiRegisterPayload,
    CreateReviewerRequestPayload,
    RegisterReviewerPayload,
    ReportReviewerRequest,
    ResolveReviewerRequestPayload,
    UpdateReviewerPayload,
    ReportPosition,
    ReportPositionAnchor,
    ReportPositionRatio,
    ReportPositionViewport,
    ReportProject,
    QuestionThreadDisplay,
    ThreadLayoutStyle,
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
} from "@/shared/types/report.js";

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
} from "@/shared/utils/report/reportCases.js";
export { createReportAuthMessage, parsePublicKey, verifyReportAuthProof } from "@/shared/utils/auth/personalKey.js";
export { ReportAuthError, resolveRegistrationError } from "@/shared/utils/auth/reportAuthError.js";
export { FIVE_PIXELS_SYNC_VALUES, isRemoteLoginMethod, resolveFivePixelsSync, resolveRequireAuth, usesRemoteAuthLogin, type FivePixelsSync } from "@/shared/constants/loginMethod.js";
export { resolveFivePixelsRequire } from "@/shared/utils/report/resolveRequire.js";
export { REPORT_STATUS_FLOW, REPORT_STATUS_TRANSITIONS } from "@/shared/types/report.js";
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
} from "@/shared/utils/github/githubIntegration.js";
export type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "@/shared/i18n/index.js";
export { en as reportMessagesEn, ensureReportLocaleMessages, getDefaultFields, getReportMessages, resolveReportLocale } from "@/shared/i18n/index.js";
export { FEEDBACK_STORAGE_CHANGED_EVENT, dispatchFeedbackStorageChanged } from "@/shared/constants/feedbackStorageEvents.js";
export {
    findFeedbackInsertConflicts,
    getFeedbackStorageKey,
    insertFeedbackItems,
    readAllFeedback,
    upsertFeedbackItems,
    writeAllFeedback,
    type FeedbackInsertResult,
    type FeedbackTransferScope,
} from "@/shared/utils/feedback/feedbackDataTransfer.js";
