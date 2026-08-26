export type { FivePixelsProps, FivePixelsRequire, ReportProviderProps, ResolvedFivePixelsRequire } from "@/types/publicApi.js";
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
} from "@/types/adapter.js";
export { FivePixels } from "./FivePixels.js";
export { DotWaveOverlay, type DotWaveOrigin, type DotWaveOverlayProps } from "@/components/overlay/DotWaveOverlay.js";
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
export { ReportAuthError, resolveRegistrationError } from "@/utils/auth/reportAuthError.js";
export { FIVE_PIXELS_SYNC_VALUES, isRemoteLoginMethod, resolveFivePixelsSync, resolveRequireAuth, usesRemoteAuthLogin, type FivePixelsSync } from "@/constants/loginMethod.js";
export { resolveFivePixelsRequire } from "@/utils/report/resolveRequire.js";
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
