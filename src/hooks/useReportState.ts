import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureReportLocaleMessages, getReportMessages, setActiveReportMessages } from "@/i18n/index.js";
import type { DeepPartialReportMessages } from "@/i18n/types.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReportShortcuts } from "./useReportShortcuts.js";
import { useMarkerTargetPreviewPreference } from "./useMarkerTargetPreviewPreference.js";
import { useMarkerAppearancePreference } from "./useMarkerAppearancePreference.js";
import { useTypographyPreference } from "./useTypographyPreference.js";
import { useReportPersistence } from "./useReportPersistence.js";
import { useIsMobileViewport } from "./useIsMobileViewport.js";
import { useAppearancePreference } from "./useAppearancePreference.js";
import { PANEL_APPEARANCE_STORAGE_KEY, TOOLTIP_APPEARANCE_STORAGE_KEY } from "@/constants/appearance.js";
import { useLocalePreference } from "./useLocalePreference.js";
import { useQuestionThreadPreference } from "./useQuestionThreadPreference.js";
import { usePanelRolePreference } from "./usePanelRolePreference.js";
import { usePersonalKey } from "./usePersonalKey.js";
import { useSelfProfile } from "./useSelfProfile.js";
import { hasStoredPersonalKey, getAuthorIdFromPrivateKey, getAuthorNameFromPrivateKey, parsePrivateKeyBundle, publicKeysMatch, serializePublicKey } from "@/utils/personalKey.js";
import { usePanelBootstrap } from "./usePanelBootstrap.js";
import { useResolvedAppearance } from "./useResolvedAppearance.js";
import { buildPanelStats } from "@/utils/panelBootstrap.js";
import { buildPanelRoleStats } from "@/utils/panelRoleStats.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ReportAppearance,
    ReportAuthor,
    ReportActivitySummaryParams,
    ReportActivitySummaryResult,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportGitHubConfig,
    FivePixelsMode,
    ReportIdentify,
    ReportListAllParams,
    ReportListAllResult,
    ReportPanelBootstrapParams,
    ReportPanelBootstrapResult,
    ReportReply,
    QuestionThreadDisplay,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import type {
    DraftReport,
    EditableDraft,
    HoverPointer,
    Marker,
    PendingFeedbackComposer,
    PickProbeCompareMode,
    PickProbeFieldKey,
    PickProbeLayoutMode,
    PickProbeValues,
    PickTargetContextMenuState,
    ProbeSessionAction,
    ReportMode,
    ReportPanelTab,
    SavedProbeDeletion,
    SavedProbeEntry,
    TargetSnapshot,
} from "@/types/report-ui.js";
import {
    canShowCaseClaimAction,
    createReplyStatusForSubmit,
    getFeedbackDisplayStatus,
    getLatestBranchRootForCase,
    getReportReplies,
    ISSUE_ROOT_PARENT_ID,
    resolveOriginalFeedbackAuthorName,
    resolveParentReplyIdForCaseQuestion,
} from "@/utils/feedbackThread.js";
import { clampRatio, getMarkerFromReport, resolveTooltipAnchor } from "@/utils/coordinates.js";
import { getFeedbackTargetElement, isFeedbackTargetVisible, scrollToFeedbackTarget, waitForTargetRevealResync } from "@/utils/locateFeedback.js";

const MARKER_HOVER_LEAVE_MS = 250;
const OVERLAY_HOVER_LEAVE_MS = 100;
import { findPickTargetByPoint, getSelectableTargets, isSameHoverTarget, resolveFeedbackDocumentAnchor, toFeedbackHoverSnapshot } from "@/utils/dom.js";
import { shouldInspectFontStyle } from "@/utils/pickTargetInspect.js";
import { applyPickProbeCompareMode, applyPickProbeValueDiff, capturePickProbeValues, formatSavedProbeEditsSummary, getProposedChanges } from "@/utils/pickProbe.js";
import {
    applySavedProbeEditsCompareMode,
    captureProbeOriginalSnapshot,
    captureSavedProbeDeletion,
    createSavedProbeEntry,
    restoreProbeElementFromSnapshot,
    findElementByProbeKey,
    getPickProbeElementKey,
    restoreProbeElementOriginal,
    restoreSavedProbeDeletion,
} from "@/utils/pickProbeSession.js";
import { playPickTargetDeleteAnimation } from "@/utils/pickTargetDeleteAnimation.js";
import { applyProbeSessionActionBackward, applyProbeSessionActionForward } from "@/utils/probeSessionHistory.js";
import { getPickProbeLayoutMode } from "@/utils/probeLayout.js";
import { markerToTargetSnapshot } from "@/utils/markerTarget.js";
import { createInitialFieldValues, getFieldError, getFieldTags } from "@/utils/fields.js";
import {
    canEditReportCases,
    claimCaseAssignee,
    createReportCase,
    buildResolvedCasesUpdate,
    canActOnCase,
    getCaseAssigneeName,
    isValidFocusedCase,
    resolveDefaultFocusedCaseId,
    transferCaseAssignee,
} from "@/utils/reportCases.js";
import { createReplyId } from "@/utils/format.js";
import { notifyFeedbackCreate, notifyFeedbackDelete, notifyFeedbackReply, notifyFeedbackUpdate, notifyGitHubIssueCreated, type ReportSideEffectCallbacks } from "@/utils/reportCallbacks.js";
import { buildGitHubIssueStatusUpdate, buildGitHubIssueUpdate, canCreateGitHubIssueFromList, canCreateGitHubIssueOnCreate, isGitIssued } from "@/utils/githubIntegration.js";
import { buildPresentationViewers, resolveSessionActor } from "@/utils/reportTeam.js";

function resolveDefaultAuthorName(identify: ReportIdentify | undefined, authors: ReportAuthor[], selfName?: string) {
    if (identify?.name) {
        return identify.name;
    }

    return authors[0]?.name ?? selfName ?? "";
}

type AuthDiagnosticsField = "projectId" | "environment" | "authorId" | "publicKey";
type AuthDiagnosticsStatus = "matched" | "failed" | "disabled";
type AuthDiagnosticsReason =
    | "reviewer-key-not-enforced"
    | "missing-personal-key"
    | "invalid-personal-key-format"
    | "project-mismatch"
    | "environment-mismatch"
    | "missing-team-author"
    | "author-id-mismatch"
    | "missing-team-public-key"
    | "public-key-mismatch"
    | "matched";

type AuthDiagnosticsItem = {
    field: AuthDiagnosticsField;
    expected: string | null;
    actual: string | null;
    matched: boolean;
};

type AuthDiagnostics = {
    status: AuthDiagnosticsStatus;
    reason: AuthDiagnosticsReason;
    items: AuthDiagnosticsItem[];
    expected: Record<AuthDiagnosticsField, string | null>;
    actual: Record<AuthDiagnosticsField, string | null>;
};

export type PanelView = "onboarding" | "setup-complete" | "key-issue" | "ready";

export type ReportStateConfig = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    panelAppearance: ReportAppearance;
    tooltipAppearance: ReportAppearance;
    questionThreadDefault?: QuestionThreadDisplay;
    fields: ReportField[];
    authors?: ReportAuthor[];
    requireReviewerKey?: boolean;
    shortcut?: string;
    identify?: ReportIdentify;
    onList?: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onPanelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
    onActivitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
    onListReplies?: (commentId: string) => Promise<ReportReply[]>;
    onNavigate?: (pathname: string) => void | Promise<void>;
    onRevealTarget?: (report: ReportFeedback) => boolean | Promise<boolean>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onCreateReply?: (commentId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    onEvent?: (event: ReportEvent) => void | Promise<void>;
    onReply?: (params: { feedbackId: string; message: string }) => void | Promise<void>;
    github?: ReportGitHubConfig;
    routeKey?: string;
    showFeedbackList: boolean;
    visibleShortcutKeys?: boolean;
    initialLocale: ReportLocale;
    messageOverrides?: DeepPartialReportMessages;
    pixelsMode?: FivePixelsMode;
};

export function useReportState({
    projectId,
    environment,
    appVersion,
    panelAppearance,
    tooltipAppearance,
    questionThreadDefault = "expanded",
    fields,
    authors = [],
    requireReviewerKey = false,
    shortcut: _shortcut,
    identify,
    onList,
    onListAll,
    onPanelBootstrap,
    onActivitySummary,
    onListReplies,
    onNavigate,
    onRevealTarget,
    onCreate,
    onCreateReply,
    onUpdate,
    onDelete,
    onEvent,
    onReply,
    github,
    routeKey,
    showFeedbackList,
    visibleShortcutKeys = false,
    initialLocale,
    messageOverrides,
    pixelsMode = "default",
}: ReportStateConfig) {
    const { appearance: activePanelAppearance, setAppearance: setPanelAppearance } = useAppearancePreference(PANEL_APPEARANCE_STORAGE_KEY, panelAppearance);
    const { appearance: activeTooltipAppearance, setAppearance: setTooltipAppearance } = useAppearancePreference(TOOLTIP_APPEARANCE_STORAGE_KEY, tooltipAppearance);
    const { showMarkerTargetPreview, setShowMarkerTargetPreview, toggleMarkerTargetPreview } = useMarkerTargetPreviewPreference();
    const { markerAppearance, setMarkerAppearance, setMarkerSize, setMarkerShape, setMarkerColors, setMarkerColor } = useMarkerAppearancePreference();
    const { typography, setTypography, setFontSize, setFontFamily } = useTypographyPreference();
    const { questionThreadDisplay, setQuestionThreadDisplay } = useQuestionThreadPreference(questionThreadDefault);
    const { panelRole, setPanelRole } = usePanelRolePreference();
    const { locale, setLocale } = useLocalePreference(initialLocale);
    const [localeMessagesReady, setLocaleMessagesReady] = useState(locale !== "ko");
    const messages = useMemo(() => getReportMessages(locale, messageOverrides), [locale, localeMessagesReady, messageOverrides]);

    useEffect(() => {
        if (locale !== "ko") {
            setLocaleMessagesReady(true);
            return;
        }

        let cancelled = false;
        setLocaleMessagesReady(false);

        void ensureReportLocaleMessages("ko").then(() => {
            if (!cancelled) {
                setLocaleMessagesReady(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [locale]);

    useEffect(() => {
        setActiveReportMessages(messages);
    }, [messages]);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const hoveredElementRef = useRef<HTMLElement | null>(null);
    const selectedElementRef = useRef<HTMLElement | null>(null);
    const hoverLeaveTimeoutRef = useRef<number | null>(null);
    const overlayHoverLeaveTimeoutRef = useRef<number | null>(null);

    const [mode, setMode] = useState<ReportMode>("idle");
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [panelTab, setPanelTab] = useState<ReportPanelTab | null>(null);

    const panelExpanded = !panelCollapsed && mode !== "report";
    const fetchEnabled = panelExpanded || mode === "view";
    const needsFullReportList = mode === "view" || panelTab === "feedback-list" || (!onPanelBootstrap && fetchEnabled);
    const listFetchEnabled = fetchEnabled && needsFullReportList;
    const bootstrapEnabled = fetchEnabled && panelExpanded && Boolean(onPanelBootstrap);

    const resolvedPanelAppearance = useResolvedAppearance(activePanelAppearance);
    const resolvedTooltipAppearance = useResolvedAppearance(activeTooltipAppearance);
    const isMobileViewport = useIsMobileViewport();
    const {
        canTransferFeedback,
        canListAllFeedback,
        currentPathname,
        listScope,
        setListScope,
        filters,
        setFilters,
        selectedReportId,
        setSelectedReportId,
        reports,
        currentPageReports,
        filteredReports,
        currentPageFilteredReports,
        routeDetailsStats,
        selectedReport,
        isError,
        isFetching,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isCreating,
        isUpdating,
        isDeleting,
        queryErrorMessage,
        refetch,
        createFeedback,
        updateFeedback,
        deleteFeedback,
        loadRepliesIfNeeded,
        createReply,
        usesCreateReply,
    } = useReportPersistence({
        projectId,
        environment,
        appVersion,
        fields,
        onList,
        onListAll,
        onListReplies,
        onCreate,
        onCreateReply,
        onUpdate,
        onDelete,
        routeKey,
        fetchEnabled,
        listFetchEnabled,
    });
    const bootstrapParams = useMemo(() => ({ pathname: currentPathname }), [currentPathname]);
    const { bootstrap: panelBootstrap } = usePanelBootstrap({
        enabled: bootstrapEnabled,
        params: bootstrapParams,
        fields,
        reports: currentPageReports,
        pathname: currentPathname,
        onPanelBootstrap,
    });
    const resolvedRouteDetailsStats = useMemo(() => panelBootstrap?.routeDetails ?? routeDetailsStats, [panelBootstrap, routeDetailsStats]);
    const eventCallbacks = useMemo<ReportSideEffectCallbacks>(
        () => ({
            onEvent,
            onReply,
        }),
        [onEvent, onReply],
    );
    const { selfProfile, saveSelfProfile, markOnboardingComplete } = useSelfProfile(projectId, environment);
    const requiresReviewerKey = requireReviewerKey || authors.some((author) => Boolean(author.publicKey));
    const {
        personalKey,
        publicKey,
        personalKeyRequired,
        personalKeyPendingRegistration,
        personalKeyCandidates,
        authorizedAuthors,
        issuePersonalKey,
        issueSelfKey,
        rotatePersonalKey,
        insertPersonalKey,
        signPayload,
    } = usePersonalKey({
        enabled: !requiresReviewerKey || hasStoredPersonalKey(projectId, environment),
        requireKey: requiresReviewerKey,
        projectId,
        environment,
        identify,
        authors,
    });
    const activeIdentify =
        authorizedAuthors[0] ?? (selfProfile?.authorId && selfProfile.name ? { id: selfProfile.authorId, name: selfProfile.name } : undefined) ?? (personalKeyRequired ? undefined : identify);
    const isPresentationMode = pixelsMode === "presentation";
    const presentationViewers = useMemo(() => buildPresentationViewers(identify, authors), [authors, identify]);
    const [presentationViewerId, setPresentationViewerId] = useState<string | null>(null);

    const resolvedPresentationViewerId = useMemo(() => {
        if (!isPresentationMode || presentationViewers.length === 0) {
            return null;
        }

        if (presentationViewerId && presentationViewers.some((viewer) => viewer.id === presentationViewerId)) {
            return presentationViewerId;
        }

        return presentationViewers[0]?.id ?? null;
    }, [isPresentationMode, presentationViewerId, presentationViewers]);

    const authorSelectionLocked = Boolean(personalKey);

    const hasPersistedPersonalKey = hasStoredPersonalKey(projectId, environment);
    const isSelfAuthenticated = hasPersistedPersonalKey;
    const authDiagnostics = useMemo<AuthDiagnostics>(() => {
        const parsedBundle = personalKey ? parsePrivateKeyBundle(personalKey) : null;
        const teamReviewer = parsedBundle ? authors.find((author) => author.id === parsedBundle.authorId) : null;
        const expected: Record<AuthDiagnosticsField, string | null> = {
            projectId,
            environment: environment ?? "",
            authorId: teamReviewer?.id ?? null,
            publicKey: teamReviewer?.publicKey?.trim() || null,
        };
        const actual: Record<AuthDiagnosticsField, string | null> = {
            projectId: parsedBundle?.projectId ?? null,
            environment: parsedBundle?.environment ?? "",
            authorId: parsedBundle?.authorId ?? null,
            publicKey: parsedBundle ? serializePublicKey(parsedBundle.publicKey) : null,
        };
        const items: AuthDiagnosticsItem[] = [
            { field: "projectId", expected: expected.projectId, actual: actual.projectId, matched: expected.projectId === actual.projectId },
            { field: "environment", expected: expected.environment, actual: actual.environment, matched: (expected.environment ?? "") === (actual.environment ?? "") },
            { field: "authorId", expected: expected.authorId, actual: actual.authorId, matched: expected.authorId === actual.authorId },
            {
                field: "publicKey",
                expected: expected.publicKey,
                actual: actual.publicKey,
                matched: Boolean(expected.publicKey && actual.publicKey && publicKeysMatch(expected.publicKey, actual.publicKey)),
            },
        ];

        if (!requiresReviewerKey) {
            return { status: "disabled", reason: "reviewer-key-not-enforced", items, expected, actual };
        }
        if (!personalKey) {
            return { status: "failed", reason: "missing-personal-key", items, expected, actual };
        }
        if (!parsedBundle) {
            return { status: "failed", reason: "invalid-personal-key-format", items, expected, actual };
        }
        if (parsedBundle.projectId !== projectId) {
            return { status: "failed", reason: "project-mismatch", items, expected, actual };
        }
        if ((parsedBundle.environment ?? "") !== (environment ?? "")) {
            return { status: "failed", reason: "environment-mismatch", items, expected, actual };
        }
        if (!teamReviewer) {
            return { status: "failed", reason: "missing-team-author", items, expected, actual };
        }
        if (!teamReviewer.publicKey?.trim()) {
            return { status: "failed", reason: "missing-team-public-key", items, expected, actual };
        }
        if (!actual.publicKey || !publicKeysMatch(teamReviewer.publicKey, actual.publicKey)) {
            return { status: "failed", reason: "public-key-mismatch", items, expected, actual };
        }

        return { status: "matched", reason: "matched", items, expected, actual };
    }, [authors, environment, personalKey, projectId, requiresReviewerKey]);

    const panelView = useMemo<PanelView>(() => {
        if (isPresentationMode || !requiresReviewerKey) {
            return "ready";
        }

        if (!hasPersistedPersonalKey) {
            return "onboarding";
        }

        if (selfProfile && !selfProfile.completed) {
            return "setup-complete";
        }

        if (personalKeyPendingRegistration) {
            return "setup-complete";
        }

        if (authDiagnostics.status === "failed") {
            if (
                authDiagnostics.reason === "public-key-mismatch" ||
                authDiagnostics.reason === "project-mismatch" ||
                authDiagnostics.reason === "environment-mismatch" ||
                authDiagnostics.reason === "invalid-personal-key-format"
            ) {
                return "key-issue";
            }

            return "setup-complete";
        }

        return "ready";
    }, [authDiagnostics.reason, authDiagnostics.status, hasPersistedPersonalKey, isPresentationMode, personalKeyPendingRegistration, requiresReviewerKey, selfProfile]);

    useEffect(() => {
        if (selfProfile && !selfProfile.completed && hasPersistedPersonalKey && authorizedAuthors.length > 0) {
            markOnboardingComplete();
        }
    }, [authorizedAuthors.length, hasPersistedPersonalKey, markOnboardingComplete, selfProfile]);

    const completeOnboarding = useCallback(
        async ({ name }: { name: string }) => {
            const trimmedName = name.trim();
            const authorId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `self-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const issued = await issueSelfKey(authorId, trimmedName);
            saveSelfProfile({ name: trimmedName, authorId, completed: false });
            return { ...issued, authorId };
        },
        [issueSelfKey, saveSelfProfile],
    );

    const restoreFromBackup = useCallback(
        async (backupKey: string) => {
            const result = await insertPersonalKey(backupKey);

            if (!result.saved) {
                return { restored: false as const, reason: result.reason };
            }

            if (!requiresReviewerKey && !result.authorized) {
                return { restored: false as const, reason: "unauthorized" as const };
            }

            const authorId = getAuthorIdFromPrivateKey(backupKey);
            const restoredName = getAuthorNameFromPrivateKey(backupKey);
            saveSelfProfile({
                name: restoredName ?? "",
                authorId: authorId ?? "",
                completed: result.authorized || !requiresReviewerKey,
            });

            return { restored: true as const, name: restoredName, authorized: result.authorized };
        },
        [insertPersonalKey, requiresReviewerKey, saveSelfProfile],
    );

    const skipOnboarding = useCallback(() => {
        markOnboardingComplete();
    }, [markOnboardingComplete]);

    const sessionActor = useMemo(
        () =>
            resolveSessionActor({
                isPresentationMode,
                presentationViewers,
                presentationViewerId: resolvedPresentationViewerId,
                activeIdentify,
            }),
        [activeIdentify, isPresentationMode, presentationViewers, resolvedPresentationViewerId],
    );

    const signCreatePayload = async (payload: CreateReportFeedbackPayload) => {
        const auth = await signPayload("feedback:create", payload);
        return auth ? { ...payload, auth } : payload;
    };

    const signUpdatePayload = async (payload: UpdateReportFeedbackPayload) => {
        const auth = await signPayload("feedback:update", payload);
        return auth ? { ...payload, auth } : payload;
    };

    const signReplyPayload = async (payload: CreateReplyPayload) => {
        const auth = await signPayload("reply:create", payload);
        return auth ? { ...payload, auth } : payload;
    };

    const applyGitHubIssueUpdate = async (report: ReportFeedback, result: { issueNumber: number; issueUrl: string }) => {
        if (usesCreateReply) {
            const updatedFeedback = await updateFeedback(report.id, await signUpdatePayload(buildGitHubIssueStatusUpdate(report, result)));

            await createReply(
                report.id,
                await signReplyPayload({
                    message: messages.resolution.gitIssuedMessage,
                    status: "suggested",
                    author_type: "system",
                }),
            );

            return updatedFeedback;
        }

        return updateFeedback(report.id, await signUpdatePayload(buildGitHubIssueUpdate(report, result, messages.resolution.gitIssuedMessage)));
    };

    const [showTargetPreview, setShowTargetPreview] = useState(false);
    const [selectableTargets, setSelectableTargets] = useState<TargetSnapshot[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [draft, setDraft] = useState<DraftReport | null>(null);
    const [hoveredTarget, setHoveredTarget] = useState<TargetSnapshot | null>(null);
    const [hoverPointer, setHoverPointer] = useState<HoverPointer | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<TargetSnapshot | null>(null);
    const [pickProbeOpen, setPickProbeOpen] = useState(false);
    const [pickProbeBaseline, setPickProbeBaseline] = useState<PickProbeValues | null>(null);
    const [pickProbeValues, setPickProbeValues] = useState<PickProbeValues | null>(null);
    const [pickProbeSupportsTextFields, setPickProbeSupportsTextFields] = useState(false);
    const [pickProbeLayoutMode, setPickProbeLayoutMode] = useState<PickProbeLayoutMode>(null);
    const [pickProbeCompareMode, setPickProbeCompareModeState] = useState<PickProbeCompareMode>("after");
    const [pickTargetContextMenu, setPickTargetContextMenu] = useState<PickTargetContextMenuState | null>(null);
    const [contextMenuElementKey, setContextMenuElementKey] = useState<string | null>(null);
    const [savedProbeEdits, setSavedProbeEdits] = useState<Record<string, SavedProbeEntry>>({});
    const [savedProbeDeletions, setSavedProbeDeletions] = useState<SavedProbeDeletion[]>([]);
    const savedProbeDeletionsRef = useRef(savedProbeDeletions);
    savedProbeDeletionsRef.current = savedProbeDeletions;
    const [probeSessionHistoryState, setProbeSessionHistoryState] = useState<{
        actions: ProbeSessionAction[];
        index: number;
    }>({ actions: [], index: -1 });
    const [savedProbeCompareMode, setSavedProbeCompareModeState] = useState<PickProbeCompareMode>("after");
    const pickProbeRestoreRef = useRef<{
        style: string | null;
        textContent: string | null;
        inputValue: string | null;
    } | null>(null);
    const pickProbeOriginalSnapshotRef = useRef<ReturnType<typeof captureProbeOriginalSnapshot> | null>(null);
    const pickProbeElementKeyRef = useRef<string | null>(null);
    const draftElementRef = useRef<HTMLElement | null>(null);
    const contextMenuElementRef = useRef<HTMLElement | null>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
    const [activeReplyReportId, setActiveReplyReportId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [replySubmitAsQuestion, setReplySubmitAsQuestion] = useState(false);
    const [draftAuthorName, setDraftAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfProfile?.name));
    const [replyAuthorName, setReplyAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfProfile?.name));

    const applyPresentationViewer = useCallback(
        (viewerId: string | null) => {
            if (!isPresentationMode) {
                return;
            }

            const viewer = presentationViewers.find((item) => item.id === viewerId) ?? presentationViewers[0];

            if (!viewer) {
                return;
            }

            setPresentationViewerId(viewer.id);
        },
        [isPresentationMode, presentationViewers],
    );

    useEffect(() => {
        if (!sessionActor?.name) {
            return;
        }

        setReplyAuthorName(sessionActor.name);
        setDraftAuthorName(sessionActor.name);
    }, [sessionActor?.id, sessionActor?.name]);

    const setDraftAuthorNameSafe = useCallback(
        (name: string) => {
            if (authorSelectionLocked && sessionActor?.name) {
                setDraftAuthorName(sessionActor.name);
                return;
            }

            setDraftAuthorName(name);
        },
        [authorSelectionLocked, sessionActor?.name],
    );

    const setReplyAuthorNameSafe = useCallback(
        (name: string) => {
            if (authorSelectionLocked && sessionActor?.name) {
                setReplyAuthorName(sessionActor.name);
                return;
            }

            setReplyAuthorName(name);
        },
        [authorSelectionLocked, sessionActor?.name],
    );
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isClaimingAssignee, setIsClaimingAssignee] = useState(false);
    const [pendingComposer, setPendingComposer] = useState<PendingFeedbackComposer>(null);
    const [confirmAuthorName, setConfirmAuthorName] = useState("");
    const [showConfirmAuthorSelect, setShowConfirmAuthorSelect] = useState(false);
    const pendingLocateReportIdRef = useRef<string | null>(null);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [editableDraft, setEditableDraft] = useState<EditableDraft | null>(null);
    const [creatingGitHubIssueId, setCreatingGitHubIssueId] = useState<string | null>(null);
    const [caseEditReportId, setCaseEditReportId] = useState<string | null>(null);
    const [caseEditDraft, setCaseEditDraft] = useState<ReportFeedback["cases"] | null>(null);
    const [focusedCaseId, setFocusedCaseId] = useState<string | null>(null);

    const canCreateGitHubIssueFromListValue = useMemo(() => canCreateGitHubIssueFromList(github), [github]);

    const canCreateGitHubIssueOnCreateValue = useMemo(() => canCreateGitHubIssueOnCreate(github), [github]);
    const activeReplyAnchor = useMemo(() => resolveTooltipAnchor(markers, activeReplyReportId), [activeReplyReportId, markers]);
    const activeReplyReport = activeReplyAnchor?.report ?? null;
    const tooltipAnchor = useMemo(() => {
        const hoveredAnchor = resolveTooltipAnchor(markers, hoveredMarkerId);

        if (!activeReplyReportId) {
            return hoveredAnchor;
        }

        if (hoveredMarkerId && hoveredMarkerId !== activeReplyReportId) {
            return hoveredAnchor;
        }

        return activeReplyAnchor ?? hoveredAnchor;
    }, [activeReplyAnchor, activeReplyReportId, hoveredMarkerId, markers]);
    const tooltipReport = tooltipAnchor?.report ?? null;
    const tooltipFieldTags = useMemo(() => (tooltipReport ? getFieldTags(fields, tooltipReport.field_values) : []), [fields, tooltipReport]);

    const targetStats = useMemo(() => {
        if (panelBootstrap?.stats) {
            return panelBootstrap.stats;
        }

        return buildPanelStats(currentPageFilteredReports);
    }, [currentPageFilteredReports, panelBootstrap]);

    const roleStatItems = useMemo(
        () =>
            buildPanelRoleStats({
                role: panelRole,
                reports: currentPageFilteredReports,
                actorName: sessionActor?.name ?? null,
                fallbackStats: targetStats,
                messages,
            }),
        [panelRole, currentPageFilteredReports, sessionActor?.name, targetStats, messages],
    );

    const authorizedAuthorId = authorizedAuthors[0]?.id ?? null;
    const activeIdentifyId = activeIdentify?.id ?? null;
    const activeIdentifyName = activeIdentify?.name ?? null;

    useEffect(() => {
        setDraft(null);
        setErrorMessage("");
        setHoveredTarget(null);
        setSelectedTarget(null);
        setHoveredMarkerId(null);
        setActiveReplyReportId(null);
        setReplyDraft("");
        setPendingComposer(null);
        setShowConfirmAuthorSelect(false);
        setConfirmAuthorName("");
        setDraftAuthorName(sessionActor?.name ?? resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfProfile?.name));
        if (!isPresentationMode) {
            setReplyAuthorName(sessionActor?.name ?? resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfProfile?.name));
        }
        setEditingReportId(null);
        setEditableDraft(null);
        if (mode !== "idle") {
            setShowTargetPreview(false);
        }
        hoveredElementRef.current = null;
        selectedElementRef.current = null;
        if (hoverLeaveTimeoutRef.current) {
            window.clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = null;
        }
        if (overlayHoverLeaveTimeoutRef.current) {
            window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            overlayHoverLeaveTimeoutRef.current = null;
        }
    }, [currentPathname, mode, activeIdentifyId, activeIdentifyName, authorizedAuthorId, isPresentationMode, sessionActor?.name, selfProfile?.authorId, selfProfile?.name]);

    useEffect(() => {
        if (!isPresentationMode || presentationViewers.length === 0 || !resolvedPresentationViewerId) {
            return;
        }

        applyPresentationViewer(resolvedPresentationViewerId);
    }, [applyPresentationViewer, isPresentationMode, presentationViewers.length, resolvedPresentationViewerId]);

    useEffect(() => {
        setShowTargetPreview(false);
    }, [currentPathname]);

    useEffect(() => {
        return () => {
            if (hoverLeaveTimeoutRef.current) {
                window.clearTimeout(hoverLeaveTimeoutRef.current);
            }
            if (overlayHoverLeaveTimeoutRef.current) {
                window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const syncSelectableTargets = () => {
            setSelectableTargets(getSelectableTargets());
        };

        syncSelectableTargets();
        window.addEventListener("scroll", syncSelectableTargets, { passive: true, capture: true });
        window.addEventListener("resize", syncSelectableTargets);

        return () => {
            window.removeEventListener("scroll", syncSelectableTargets, { capture: true });
            window.removeEventListener("resize", syncSelectableTargets);
        };
    }, [currentPathname]);

    useEffect(() => {
        if (!showTargetPreview) {
            return;
        }

        const syncPreviewRects = () => {
            setSelectableTargets(getSelectableTargets());
        };

        window.addEventListener("scroll", syncPreviewRects, { passive: true, capture: true });
        window.addEventListener("resize", syncPreviewRects);

        return () => {
            window.removeEventListener("scroll", syncPreviewRects, { capture: true });
            window.removeEventListener("resize", syncPreviewRects);
        };
    }, [showTargetPreview]);

    const syncMarkers = useCallback(() => {
        setMarkers(currentPageFilteredReports.map((report) => getMarkerFromReport(report, window.scrollY)));
    }, [currentPageFilteredReports, markerAppearance.size]);

    const activeMarkerReportId = useMemo(() => {
        if (activeReplyReportId) {
            return activeReplyReportId;
        }

        if (hoveredMarkerId) {
            return hoveredMarkerId;
        }

        return null;
    }, [activeReplyReportId, hoveredMarkerId]);

    const activeMarkerTarget = useMemo(() => {
        if (mode === "report") {
            return null;
        }

        if (!activeMarkerReportId) {
            return null;
        }

        const marker = markers.find((item) => item.report.id === activeMarkerReportId);

        if (!marker) {
            return null;
        }

        return markerToTargetSnapshot(marker);
    }, [activeMarkerReportId, markers, mode]);

    const markerPreviewTargets = useMemo(() => {
        if (!showMarkerTargetPreview) {
            return [];
        }

        return markers.flatMap((marker) => {
            const snapshot = markerToTargetSnapshot(marker);

            if (!snapshot) {
                return [];
            }

            if (activeMarkerTarget && snapshot.id === activeMarkerTarget.id) {
                return [];
            }

            return [snapshot];
        });
    }, [activeMarkerTarget, markers, showMarkerTargetPreview]);

    const statusText = useMemo(() => {
        if (mode === "report") {
            const focusTarget = selectedTarget ?? hoveredTarget;

            if (!focusTarget) {
                return messages.statusText.reportReady;
            }

            if (focusTarget.isTagged) {
                const typeLabel = focusTarget.type === "item" ? messages.statusText.selectedItem : messages.statusText.selectedGroup;
                return `${typeLabel}\n${focusTarget.id}`;
            }

            return `${messages.statusText.selectedUntaggedTarget}\n${focusTarget.suggestedReportId ?? focusTarget.id}`;
        }

        if (mode === "view") {
            return isFetching ? messages.statusText.loadingFeedback : messages.statusText.ready;
        }

        if (showTargetPreview) {
            return messages.statusText.showingSelectableTargets(selectableTargets.length);
        }

        if (showMarkerTargetPreview) {
            return messages.statusText.showingMarkerTargets(markerPreviewTargets.length + (activeMarkerTarget ? 1 : 0));
        }

        if (selectableTargets.length === 0) {
            return messages.statusText.noSelectableTargets;
        }

        return messages.statusText.ready;
    }, [
        activeMarkerTarget,
        filteredReports.length,
        hoveredTarget,
        isFetching,
        markerPreviewTargets.length,
        messages.statusText,
        mode,
        selectableTargets.length,
        selectedTarget,
        showMarkerTargetPreview,
        showTargetPreview,
    ]);

    useEffect(() => {
        const shouldSyncMarkers = mode === "view" || showMarkerTargetPreview;

        if (!shouldSyncMarkers) {
            setMarkers([]);
            return;
        }

        let cancelled = false;

        const runSync = () => {
            if (!cancelled) {
                syncMarkers();
            }
        };

        runSync();
        void waitForTargetRevealResync().then(runSync);

        let mutationSyncTimeout: number | null = null;

        const scheduleMutationSync = () => {
            if (mutationSyncTimeout !== null) {
                window.clearTimeout(mutationSyncTimeout);
            }

            mutationSyncTimeout = window.setTimeout(() => {
                mutationSyncTimeout = null;
                runSync();
            }, 50);
        };

        const mutationObserver = new MutationObserver((mutations) => {
            if (mutations.some((mutation) => mutation.type === "attributes" || mutation.type === "childList")) {
                scheduleMutationSync();
            }
        });

        mutationObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "style", "aria-hidden"],
            childList: true,
            subtree: true,
        });

        window.addEventListener("scroll", syncMarkers, { passive: true, capture: true });
        window.addEventListener("resize", syncMarkers);

        return () => {
            cancelled = true;

            if (mutationSyncTimeout !== null) {
                window.clearTimeout(mutationSyncTimeout);
            }

            mutationObserver.disconnect();
            window.removeEventListener("scroll", syncMarkers, { capture: true });
            window.removeEventListener("resize", syncMarkers);
        };
    }, [currentPathname, mode, showMarkerTargetPreview, syncMarkers]);

    useEffect(() => {
        if (!showMarkerTargetPreview) {
            return;
        }

        const syncPreviewRects = () => {
            syncMarkers();
        };

        window.addEventListener("scroll", syncPreviewRects, { passive: true, capture: true });
        window.addEventListener("resize", syncPreviewRects);

        return () => {
            window.removeEventListener("scroll", syncPreviewRects, { capture: true });
            window.removeEventListener("resize", syncPreviewRects);
        };
    }, [showMarkerTargetPreview, syncMarkers]);

    const prepareFeedbackLocation = useCallback(
        async (report: ReportFeedback) => {
            const targetElement = getFeedbackTargetElement(report);

            if (targetElement && isFeedbackTargetVisible(targetElement)) {
                scrollToFeedbackTarget(report);
                return;
            }

            let revealed = false;

            if (onRevealTarget) {
                try {
                    revealed = Boolean(await onRevealTarget(report));
                } catch {
                    revealed = false;
                }
            }

            if (revealed) {
                await waitForTargetRevealResync();
                syncMarkers();
            }

            scrollToFeedbackTarget(report);
        },
        [onRevealTarget, syncMarkers],
    );

    useEffect(() => {
        if (mode !== "report") {
            return;
        }

        const syncTargetRects = () => {
            setHoveredTarget(toFeedbackHoverSnapshot(hoveredElementRef.current));
            setSelectedTarget(toFeedbackHoverSnapshot(selectedElementRef.current));
        };

        window.addEventListener("scroll", syncTargetRects, { passive: true, capture: true });
        window.addEventListener("resize", syncTargetRects);

        return () => {
            window.removeEventListener("scroll", syncTargetRects, { capture: true });
            window.removeEventListener("resize", syncTargetRects);
        };
    }, [mode]);

    useEffect(() => {
        if (hoveredMarkerId && !markers.some((marker) => marker.report.id === hoveredMarkerId)) {
            setHoveredMarkerId(null);
        }
    }, [hoveredMarkerId, markers]);

    // markers (points, tooltip, reply)
    const clearHoverLeaveTimeout = () => {
        if (hoverLeaveTimeoutRef.current) {
            window.clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = null;
        }
    };

    const scheduleHoverLeave = (markerId: string) => {
        clearHoverLeaveTimeout();

        hoverLeaveTimeoutRef.current = window.setTimeout(() => {
            setHoveredMarkerId((current) => (current === markerId ? null : current));
            hoverLeaveTimeoutRef.current = null;
        }, MARKER_HOVER_LEAVE_MS);
    };

    const clearOverlayHoverLeaveTimeout = () => {
        if (overlayHoverLeaveTimeoutRef.current) {
            window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            overlayHoverLeaveTimeoutRef.current = null;
        }
    };

    const scheduleOverlayHoverLeave = () => {
        if (overlayHoverLeaveTimeoutRef.current) {
            return;
        }

        overlayHoverLeaveTimeoutRef.current = window.setTimeout(() => {
            if (!hoveredElementRef.current) {
                setHoveredTarget(null);
                setHoverPointer(null);
            }

            overlayHoverLeaveTimeoutRef.current = null;
        }, OVERLAY_HOVER_LEAVE_MS);
    };

    const refreshSelectedTargetSnapshot = useCallback(() => {
        const element = selectedElementRef.current;

        if (!element) {
            return;
        }

        const snapshot = toFeedbackHoverSnapshot(element);

        if (!snapshot) {
            return;
        }

        setSelectedTarget(snapshot);
        setHoveredTarget(snapshot);
    }, []);

    const closePickProbePanelOnly = useCallback(() => {
        setPickProbeOpen(false);
        setPickProbeBaseline(null);
        setPickProbeValues(null);
        setPickProbeSupportsTextFields(false);
        setPickProbeLayoutMode(null);
        setPickProbeCompareModeState("after");
        pickProbeElementKeyRef.current = null;
    }, []);

    const resetPickProbeState = useCallback(() => {
        closePickProbePanelOnly();
    }, [closePickProbePanelOnly]);

    const revertSavedProbeEdit = useCallback(
        (elementKey: string) => {
            setSavedProbeEdits((current) => {
                const entry = current[elementKey];

                if (!entry) {
                    return current;
                }

                const element = findElementByProbeKey(elementKey);

                if (element) {
                    restoreProbeElementOriginal(element, entry);
                }

                const next = { ...current };
                delete next[elementKey];
                return next;
            });

            if (pickProbeElementKeyRef.current === elementKey) {
                pickProbeRestoreRef.current = null;
                pickProbeOriginalSnapshotRef.current = null;
                closePickProbePanelOnly();
            }
        },
        [closePickProbePanelOnly],
    );

    const pushProbeSessionAction = useCallback((action: ProbeSessionAction) => {
        setProbeSessionHistoryState((current) => {
            const actions = current.actions.slice(0, current.index + 1);
            actions.push(action);

            return {
                actions,
                index: actions.length - 1,
            };
        });
    }, []);

    const undoProbeSessionAction = useCallback(() => {
        setProbeSessionHistoryState((current) => {
            if (current.index < 0) {
                return current;
            }

            const action = current.actions[current.index];

            setSavedProbeEdits((edits) => {
                const next = applyProbeSessionActionBackward(action, {
                    edits,
                    deletions: savedProbeDeletionsRef.current,
                });
                setSavedProbeDeletions(next.deletions);

                return next.edits;
            });

            return {
                actions: current.actions,
                index: current.index - 1,
            };
        });
    }, []);

    const redoProbeSessionAction = useCallback(() => {
        setProbeSessionHistoryState((current) => {
            if (current.index >= current.actions.length - 1) {
                return current;
            }

            const action = current.actions[current.index + 1];

            setSavedProbeEdits((edits) => {
                const next = applyProbeSessionActionForward(action, {
                    edits,
                    deletions: savedProbeDeletionsRef.current,
                });
                setSavedProbeDeletions(next.deletions);

                return next.edits;
            });

            return {
                actions: current.actions,
                index: current.index + 1,
            };
        });
    }, []);

    const revertAllSavedProbeEdits = useCallback(() => {
        setProbeSessionHistoryState({ actions: [], index: -1 });

        setSavedProbeDeletions((deletions) => {
            for (const entry of [...deletions].reverse()) {
                restoreSavedProbeDeletion(entry);
            }

            return [];
        });

        setSavedProbeEdits((current) => {
            for (const entry of Object.values(current)) {
                const element = findElementByProbeKey(entry.elementKey);

                if (element) {
                    restoreProbeElementOriginal(element, entry);
                }
            }

            return {};
        });
        setSavedProbeCompareModeState("after");
    }, []);

    const canUndoProbeSession = probeSessionHistoryState.index >= 0;
    const canRedoProbeSession = probeSessionHistoryState.index < probeSessionHistoryState.actions.length - 1;

    const hasProbeSessionChanges = useMemo(() => probeSessionHistoryState.index >= 0, [probeSessionHistoryState.index]);

    const setSavedProbeCompareMode = useCallback((compareMode: PickProbeCompareMode) => {
        setSavedProbeCompareModeState(compareMode);
        setSavedProbeEdits((current) => {
            applySavedProbeEditsCompareMode(current, compareMode);
            return current;
        });
    }, []);

    const pickProbeChanges = useMemo(() => {
        if (!pickProbeBaseline || !pickProbeValues) {
            return [];
        }

        return getProposedChanges(pickProbeBaseline, pickProbeValues, pickProbeSupportsTextFields, pickProbeLayoutMode);
    }, [pickProbeBaseline, pickProbeLayoutMode, pickProbeSupportsTextFields, pickProbeValues]);

    const pickProbeHasEdits = pickProbeChanges.length > 0;

    const persistPickProbeEdits = useCallback(
        (options?: { closePanel?: boolean; values?: PickProbeValues }) => {
            const element = selectedElementRef.current;
            const values = options?.values ?? pickProbeValues;

            if (!element || !pickProbeBaseline || !values) {
                if (options?.closePanel) {
                    closePickProbePanelOnly();
                }

                return;
            }

            const elementKey = getPickProbeElementKey(element);
            const changes = getProposedChanges(pickProbeBaseline, values, pickProbeSupportsTextFields, pickProbeLayoutMode);
            const existing = savedProbeEdits[elementKey];

            if (changes.length === 0) {
                if (existing) {
                    pushProbeSessionAction({
                        kind: "style-revert",
                        elementKey,
                        revertedEntry: existing,
                    });

                    setSavedProbeEdits((current) => {
                        const next = { ...current };
                        delete next[elementKey];
                        return next;
                    });
                }

                if (options?.closePanel) {
                    pickProbeRestoreRef.current = null;
                    pickProbeOriginalSnapshotRef.current = null;
                    closePickProbePanelOnly();
                }

                refreshSelectedTargetSnapshot();
                return;
            }

            const previousEntry = existing ?? null;
            const originalSnapshot = pickProbeOriginalSnapshotRef.current;

            applyPickProbeCompareMode(element, savedProbeCompareMode, pickProbeBaseline, values);

            const nextEntry = createSavedProbeEntry(
                elementKey,
                pickProbeBaseline,
                values,
                originalSnapshot?.style ?? pickProbeRestoreRef.current?.style ?? null,
                originalSnapshot?.textContent ?? pickProbeRestoreRef.current?.textContent ?? pickProbeBaseline.textContent,
                existing,
                originalSnapshot?.innerHTML ?? null,
                originalSnapshot?.inputValue ?? null,
            );

            const appliedChanged = !existing || getProposedChanges(existing.applied, values, pickProbeSupportsTextFields, pickProbeLayoutMode).length > 0;

            setSavedProbeEdits((current) => ({
                ...current,
                [elementKey]: nextEntry,
            }));

            if (appliedChanged) {
                pushProbeSessionAction({
                    kind: "style-apply",
                    elementKey,
                    previousEntry,
                    nextEntry,
                });
            }

            if (options?.closePanel) {
                pickProbeRestoreRef.current = null;
                pickProbeOriginalSnapshotRef.current = null;
                closePickProbePanelOnly();
            }

            refreshSelectedTargetSnapshot();
        },
        [
            closePickProbePanelOnly,
            pickProbeBaseline,
            pickProbeLayoutMode,
            pickProbeSupportsTextFields,
            pickProbeValues,
            pushProbeSessionAction,
            refreshSelectedTargetSnapshot,
            savedProbeCompareMode,
            savedProbeEdits,
        ],
    );

    const commitPickProbeEdits = useCallback(() => {
        persistPickProbeEdits({ closePanel: true });
    }, [persistPickProbeEdits]);

    const openPickProbe = useCallback(() => {
        const element = selectedElementRef.current;

        if (!element) {
            return;
        }

        if (pickProbeOpen) {
            closePickProbePanelOnly();
        }

        const elementKey = getPickProbeElementKey(element);
        const saved = savedProbeEdits[elementKey];

        pickProbeElementKeyRef.current = elementKey;
        const supportsTextFields = shouldInspectFontStyle(element);
        const layoutMode = getPickProbeLayoutMode(element);
        setPickProbeSupportsTextFields(supportsTextFields);
        setPickProbeLayoutMode(layoutMode);
        const freshBaseline = capturePickProbeValues(element);

        const sessionSnapshot = captureProbeOriginalSnapshot(element);
        pickProbeOriginalSnapshotRef.current = sessionSnapshot;
        pickProbeRestoreRef.current = {
            style: sessionSnapshot.style,
            textContent: sessionSnapshot.textContent,
            inputValue: sessionSnapshot.inputValue,
        };

        if (saved) {
            applyPickProbeCompareMode(element, savedProbeCompareMode, saved.baseline, saved.applied);
            setPickProbeBaseline({ ...freshBaseline, ...saved.baseline });
            setPickProbeValues({ ...freshBaseline, ...saved.applied });
        } else {
            const baseline = capturePickProbeValues(element);
            setPickProbeBaseline(baseline);
            setPickProbeValues(baseline);
        }

        setPickProbeCompareModeState("after");
        setPickProbeOpen(true);
        refreshSelectedTargetSnapshot();
    }, [closePickProbePanelOnly, pickProbeOpen, refreshSelectedTargetSnapshot, savedProbeCompareMode, savedProbeEdits]);

    const closePickProbe = useCallback(() => {
        resetPickProbeState();
    }, [resetPickProbeState]);

    const closePickTargetContextMenu = useCallback(() => {
        setPickTargetContextMenu(null);
        setContextMenuElementKey(null);
    }, []);

    const handlePickTargetRevert = useCallback(() => {
        const elementKey = contextMenuElementKey;

        closePickTargetContextMenu();

        if (!elementKey) {
            return;
        }

        const entry = savedProbeEdits[elementKey];

        if (!entry) {
            return;
        }

        revertSavedProbeEdit(elementKey);
        pushProbeSessionAction({
            kind: "style-revert",
            elementKey,
            revertedEntry: entry,
        });
    }, [closePickTargetContextMenu, contextMenuElementKey, pushProbeSessionAction, revertSavedProbeEdit, savedProbeEdits]);

    const handlePickTargetEdit = useCallback(() => {
        const element = contextMenuElementRef.current;

        closePickTargetContextMenu();

        if (!element) {
            return;
        }

        if (pickProbeOpen) {
            resetPickProbeState();
        }

        selectedElementRef.current = element;
        hoveredElementRef.current = element;
        const snapshot = toFeedbackHoverSnapshot(element);

        if (snapshot) {
            setSelectedTarget(snapshot);
        }

        openPickProbe();
    }, [closePickTargetContextMenu, openPickProbe, pickProbeOpen, resetPickProbeState]);

    const handlePickTargetDelete = useCallback(() => {
        const element = contextMenuElementRef.current;
        const elementKey = element ? getPickProbeElementKey(element) : null;

        closePickTargetContextMenu();
        resetPickProbeState();

        if (!element) {
            return;
        }

        const shouldClearDraft = draftElementRef.current === element;
        const rect = element.getBoundingClientRect();
        const deletion = elementKey ? captureSavedProbeDeletion(element, elementKey) : null;
        const previousStyleEntry = elementKey ? (savedProbeEdits[elementKey] ?? null) : null;

        contextMenuElementRef.current = null;

        if (selectedElementRef.current === element) {
            selectedElementRef.current = null;
            hoveredElementRef.current = null;
            setSelectedTarget(null);
            setHoveredTarget(null);
            setHoverPointer(null);
        }

        void playPickTargetDeleteAnimation(rect).then(() => {
            if (!element.isConnected) {
                return;
            }

            element.remove();

            if (deletion) {
                setSavedProbeDeletions((current) => [...current, deletion]);

                if (previousStyleEntry) {
                    setSavedProbeEdits((current) => {
                        const next = { ...current };
                        delete next[deletion.elementKey];

                        return next;
                    });
                }

                pushProbeSessionAction({
                    kind: "delete",
                    deletion,
                    previousStyleEntry,
                });
            }

            if (shouldClearDraft) {
                draftElementRef.current = null;
                setDraft(null);
            }
        });
    }, [closePickTargetContextMenu, pushProbeSessionAction, resetPickProbeState, savedProbeEdits]);

    useEffect(() => {
        if (mode !== "report") {
            resetPickProbeState();
            closePickTargetContextMenu();
        }
    }, [closePickTargetContextMenu, mode, resetPickProbeState]);

    const setPickProbeCompareMode = useCallback(
        (compareMode: PickProbeCompareMode) => {
            const element = selectedElementRef.current;

            if (!element || !pickProbeBaseline || !pickProbeValues) {
                return;
            }

            applyPickProbeCompareMode(element, compareMode, pickProbeBaseline, pickProbeValues);
            setPickProbeCompareModeState(compareMode);
            refreshSelectedTargetSnapshot();

            if (compareMode === "after") {
                persistPickProbeEdits();
            }
        },
        [persistPickProbeEdits, pickProbeBaseline, pickProbeValues, refreshSelectedTargetSnapshot],
    );

    const updatePickProbeValue = useCallback(
        (key: PickProbeFieldKey, value: string) => {
            const element = selectedElementRef.current;

            if (!element || !pickProbeBaseline || !pickProbeValues) {
                return;
            }

            const nextValues = {
                ...pickProbeValues,
                [key]: value,
            };

            setPickProbeValues(nextValues);

            if (pickProbeCompareMode === "after") {
                applyPickProbeValueDiff(element, pickProbeBaseline, nextValues, "after");
                refreshSelectedTargetSnapshot();
                persistPickProbeEdits({ values: nextValues });
            }
        },
        [pickProbeBaseline, pickProbeCompareMode, pickProbeValues, persistPickProbeEdits, refreshSelectedTargetSnapshot],
    );

    const resetPickProbeValues = useCallback(() => {
        const element = selectedElementRef.current;

        if (!element || !pickProbeBaseline || !pickProbeValues) {
            return;
        }

        setPickProbeValues(pickProbeBaseline);

        const snapshot = pickProbeOriginalSnapshotRef.current;

        if (snapshot) {
            restoreProbeElementFromSnapshot(element, snapshot);
        } else if (pickProbeHasEdits) {
            applyPickProbeCompareMode(element, pickProbeCompareMode, pickProbeBaseline, pickProbeBaseline);
        }

        persistPickProbeEdits({ values: pickProbeBaseline });
        refreshSelectedTargetSnapshot();
    }, [pickProbeBaseline, pickProbeCompareMode, pickProbeHasEdits, pickProbeValues, persistPickProbeEdits, refreshSelectedTargetSnapshot]);

    const stopEditing = () => {
        setEditingReportId(null);
        setEditableDraft(null);
    };

    const cancelCaseEdit = useCallback(() => {
        setCaseEditReportId(null);
        setCaseEditDraft(null);
    }, []);

    useEffect(() => {
        if (!activeReplyReport) {
            return;
        }

        setFocusedCaseId((current) => {
            if (current && isValidFocusedCase(activeReplyReport, current)) {
                return current;
            }

            return resolveDefaultFocusedCaseId(activeReplyReport);
        });
    }, [activeReplyReport]);

    const clearFocusedCase = useCallback(() => {
        setFocusedCaseId(null);
    }, []);

    const selectCase = useCallback((caseId: string) => {
        setFocusedCaseId(caseId);
        setPendingComposer(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setErrorMessage("");
    }, []);

    const ensureFocusedCase = useCallback(
        (report: ReportFeedback) => {
            if (isValidFocusedCase(report, focusedCaseId)) {
                return true;
            }

            setErrorMessage(messages.errors.selectCaseFirst);
            return false;
        },
        [focusedCaseId, messages.errors.selectCaseFirst],
    );

    const ensureCanActOnFocusedCase = useCallback(
        (report: ReportFeedback) => {
            if (!ensureFocusedCase(report) || !focusedCaseId) {
                return false;
            }

            const actorName = sessionActor?.name?.trim() ?? "";

            if (actorName && canActOnCase(report, focusedCaseId, actorName)) {
                return true;
            }

            setErrorMessage(messages.errors.caseAssigneeOnly);
            return false;
        },
        [ensureFocusedCase, focusedCaseId, messages.errors.caseAssigneeOnly, sessionActor?.name],
    );

    const beginCaseEdit = useCallback(
        (report: ReportFeedback) => {
            if (!canEditReportCases(report)) {
                setErrorMessage(messages.errors.archivedReadOnly);
                return;
            }

            setCaseEditReportId(report.id);
            setCaseEditDraft(report.cases.map((item) => ({ ...item })));
            setErrorMessage("");
        },
        [messages.errors.archivedReadOnly],
    );

    const updateCaseEditDraftCase = useCallback((caseId: string, text: string) => {
        setCaseEditDraft((current) => {
            if (!current) {
                return current;
            }

            return current.map((item) => (item.id === caseId ? { ...item, text } : item));
        });
    }, []);

    const addCaseEditDraftCase = useCallback(() => {
        setCaseEditDraft((current) => (current ? [...current, createReportCase("")] : current));
    }, []);

    const removeCaseEditDraftCase = useCallback((caseId: string) => {
        setCaseEditDraft((current) => {
            if (!current || current.length <= 1) {
                return current;
            }

            return current.filter((item) => item.id !== caseId);
        });
    }, []);

    const handleCaseEditSave = async () => {
        if (!caseEditReportId || !caseEditDraft) {
            return;
        }

        const report = reports.find((item) => item.id === caseEditReportId) ?? activeReplyReport;

        if (!report) {
            return;
        }

        if (!canEditReportCases(report)) {
            setErrorMessage(messages.errors.archivedNotEditable);
            return;
        }

        const nextError = getFieldError(caseEditDraft, report.field_values, fields, messages.errors);

        if (nextError) {
            setErrorMessage(nextError);
            return;
        }

        try {
            const cases = caseEditDraft.map((item) => ({
                ...item,
                text: item.text.trim(),
                updated_at: new Date().toISOString(),
            }));
            const updatedFeedback = await updateFeedback(report.id, await signUpdatePayload({ cases }));

            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            cancelCaseEdit();
            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.updateFeedbackFailed);
        }
    };

    const isCaseEditing = Boolean(caseEditReportId && caseEditDraft);
    const caseEditCases = caseEditReportId === activeReplyReport?.id ? caseEditDraft : null;

    useEffect(() => {
        if (caseEditReportId && activeReplyReportId && caseEditReportId !== activeReplyReportId) {
            cancelCaseEdit();
        }
    }, [activeReplyReportId, cancelCaseEdit, caseEditReportId]);

    const selectReport = (reportId: string) => {
        setSelectedReportId(reportId);

        if (editingReportId && editingReportId !== reportId) {
            stopEditing();
        }
    };

    const closeReplyComposer = () => {
        setActiveReplyReportId(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setShowConfirmAuthorSelect(false);
        cancelCaseEdit();
        clearFocusedCase();
    };

    const showFeedbackTooltip = useCallback(
        async (report: ReportFeedback) => {
            await prepareFeedbackLocation(report);
            clearHoverLeaveTimeout();
            closeReplyComposer();
            setHoveredMarkerId(report.id);
        },
        [clearHoverLeaveTimeout, closeReplyComposer, prepareFeedbackLocation],
    );

    const locateFeedback = async (reportId: string) => {
        const report = filteredReports.find((item) => item.id === reportId);

        if (!report) {
            return;
        }

        selectReport(reportId);

        if (report.pathname !== currentPathname) {
            pendingLocateReportIdRef.current = reportId;

            try {
                if (onNavigate) {
                    await onNavigate(report.pathname);
                } else if (typeof window !== "undefined") {
                    window.location.assign(report.pathname);
                }
            } catch (nextError) {
                pendingLocateReportIdRef.current = null;
                setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.loadFeedbackFailed);
            }

            return;
        }

        showFeedbackTooltip(report);
    };

    useEffect(() => {
        const pendingReportId = pendingLocateReportIdRef.current;

        if (!pendingReportId) {
            return;
        }

        const report = reports.find((item) => item.id === pendingReportId && item.pathname === currentPathname);

        if (!report) {
            return;
        }

        pendingLocateReportIdRef.current = null;
        window.setTimeout(() => showFeedbackTooltip(report), 0);
    }, [currentPathname, reports, showFeedbackTooltip]);

    const focusSearchInput = () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
    };

    const selectAdjacentReport = (direction: "up" | "down") => {
        if (filteredReports.length === 0) {
            return;
        }

        const currentIndex = filteredReports.findIndex((report) => report.id === selectedReportId);
        let nextIndex: number;

        if (currentIndex === -1) {
            nextIndex = direction === "down" ? 0 : filteredReports.length - 1;
        } else {
            nextIndex = direction === "down" ? Math.min(currentIndex + 1, filteredReports.length - 1) : Math.max(currentIndex - 1, 0);
        }

        void locateFeedback(filteredReports[nextIndex].id);
    };

    const openReplyComposer = (report: ReportFeedback) => {
        selectReport(report.id);
        setActiveReplyReportId(report.id);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setReplyAuthorName(sessionActor?.name ?? resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfProfile?.name));
        setConfirmAuthorName(resolveOriginalFeedbackAuthorName(report));
        setShowConfirmAuthorSelect(false);
        setFocusedCaseId(resolveDefaultFocusedCaseId(report));
    };

    const activateFeedbackMarker = useCallback(
        async (report: ReportFeedback) => {
            const enrichedReport = await loadRepliesIfNeeded(report);
            await prepareFeedbackLocation(enrichedReport);
            openReplyComposer(enrichedReport);
        },
        [loadRepliesIfNeeded, openReplyComposer, prepareFeedbackLocation],
    );

    const toggleConfirmAuthorSelect = () => {
        setShowConfirmAuthorSelect((current) => !current);
    };

    const startDenyReview = (targetReplyId?: string) => {
        if (!activeReplyReport || !focusedCaseId) {
            return;
        }

        if (!ensureCanActOnFocusedCase(activeReplyReport)) {
            return;
        }

        const latestRoot = getLatestBranchRootForCase(activeReplyReport, focusedCaseId);

        if (!latestRoot) {
            setPendingComposer({
                type: "deny",
                targetReplyId: targetReplyId ?? ISSUE_ROOT_PARENT_ID,
            });
            setReplyDraft("");
            setReplySubmitAsQuestion(false);
            return;
        }

        setPendingComposer({
            type: latestRoot.status === "found_error" ? "recheck" : "deny",
            targetReplyId: latestRoot.id,
        });
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };

    const startCheckoutReview = (replyId: string) => {
        if (!activeReplyReport || !focusedCaseId || !ensureCanActOnFocusedCase(activeReplyReport)) {
            return;
        }

        setPendingComposer({ type: "checkout", targetReplyId: replyId });
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };

    const startAskQuestion = () => {
        if (!activeReplyReport || !focusedCaseId) {
            return;
        }

        if (!ensureCanActOnFocusedCase(activeReplyReport)) {
            return;
        }

        const latestRoot = getLatestBranchRootForCase(activeReplyReport, focusedCaseId);

        setReplyDraft("");

        if (!latestRoot) {
            setPendingComposer({
                type: "question",
                targetReplyId: ISSUE_ROOT_PARENT_ID,
            });
            setReplySubmitAsQuestion(true);
            return;
        }

        if (latestRoot.status === "suggested" || latestRoot.status === "found_error" || latestRoot.status === "recheck_requested") {
            setPendingComposer({
                type: "question",
                targetReplyId: latestRoot.id,
            });
            setReplySubmitAsQuestion(true);
        }
    };

    const cancelPendingComposer = () => {
        setPendingComposer(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };

    const toggleReportMode = () => {
        setShowTargetPreview(false);
        setMode((current) => (current === "report" ? "idle" : "report"));
    };

    const togglePanelTab = (nextTab: ReportPanelTab) => {
        setPanelTab((current) => {
            if (current === nextTab) {
                return null;
            }

            return nextTab;
        });
    };

    const enableIssueMode = () => {
        setShowTargetPreview(false);
        closeReplyComposer();
        stopEditing();
        setMode("view");
    };

    const openPanelTab = (nextTab: ReportPanelTab) => {
        const isClosing = panelTab === nextTab;

        setPanelTab(isClosing ? null : nextTab);

        if (!isClosing && nextTab === "feedback-list") {
            enableIssueMode();
        }
    };

    const toggleIssueMode = () => {
        setShowTargetPreview(false);
        closeReplyComposer();
        setMode((current) => (current === "view" ? "idle" : "view"));
        stopEditing();
        setSelectedReportId(null);
    };

    const toggleTargetPreview = () => {
        setShowTargetPreview((current) => {
            const next = !current;

            if (next) {
                setMode("idle");
            }

            return next;
        });
    };

    const handleOverlayMove = (event: MouseEvent<HTMLDivElement>) => {
        if (mode !== "report" || draft) {
            return;
        }

        const targetElement = findPickTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        hoveredElementRef.current = targetElement;

        if (!targetElement) {
            scheduleOverlayHoverLeave();
            return;
        }

        clearOverlayHoverLeaveTimeout();
        setHoverPointer({ clientX: event.clientX, clientY: event.clientY });
        const snapshot = toFeedbackHoverSnapshot(targetElement);
        setHoveredTarget((previous) => (isSameHoverTarget(previous, snapshot) ? previous : snapshot));
    };

    const handleOverlayContextMenu = (event: MouseEvent<HTMLDivElement>) => {
        if (mode !== "report") {
            return;
        }

        event.preventDefault();

        const targetElement = findPickTargetByPoint(overlayRef.current, event.clientX, event.clientY);

        if (!targetElement) {
            closePickTargetContextMenu();
            return;
        }

        const snapshot = toFeedbackHoverSnapshot(targetElement);

        if (!snapshot) {
            closePickTargetContextMenu();
            return;
        }

        const elementKey = getPickProbeElementKey(targetElement);

        contextMenuElementRef.current = targetElement;
        setContextMenuElementKey(elementKey);

        if (!draft) {
            selectedElementRef.current = targetElement;
            hoveredElementRef.current = targetElement;
            setSelectedTarget(snapshot);
        }

        setPickTargetContextMenu({
            clientX: event.clientX,
            clientY: event.clientY,
        });
    };

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (mode !== "report") {
            return;
        }

        closePickTargetContextMenu();
        resetPickProbeState();

        const targetElement = findPickTargetByPoint(overlayRef.current, event.clientX, event.clientY);

        if (!targetElement) {
            setErrorMessage(messages.errors.clickPickTarget);
            return;
        }

        const anchorSnapshot = resolveFeedbackDocumentAnchor(targetElement);
        const snapshot = toFeedbackHoverSnapshot(targetElement);
        const isTagged = snapshot?.isTagged ?? false;

        if (!snapshot) {
            setErrorMessage(messages.errors.clickPickTarget);
            return;
        }

        hoveredElementRef.current = targetElement;
        selectedElementRef.current = targetElement;
        draftElementRef.current = targetElement;
        setHoverPointer(null);
        setHoveredTarget(null);
        setSelectedTarget(snapshot);
        setErrorMessage("");
        setDraft({
            clientX: event.clientX,
            clientY: event.clientY,
            xRatio: clampRatio(event.clientX / window.innerWidth),
            yRatio: clampRatio(event.clientY / window.innerHeight),
            elementXRatio: clampRatio((event.clientX - snapshot.rect.left) / Math.max(snapshot.rect.width, 1)),
            elementYRatio: clampRatio((event.clientY - snapshot.rect.top) / Math.max(snapshot.rect.height, 1)),
            anchorReportId: anchorSnapshot?.id ?? null,
            anchorReportType: anchorSnapshot?.type ?? null,
            anchorXRatio: anchorSnapshot ? clampRatio((event.clientX - anchorSnapshot.rect.left) / Math.max(anchorSnapshot.rect.width, 1)) : null,
            anchorYRatio: anchorSnapshot ? clampRatio((event.clientY - anchorSnapshot.rect.top) / Math.max(anchorSnapshot.rect.height, 1)) : null,
            scrollY: window.scrollY,
            documentY: Math.round(window.scrollY + event.clientY),
            reportId: snapshot.id,
            reportType: snapshot.type,
            targetSelector: isTagged ? null : (snapshot.targetSelector ?? null),
            suggestedReportId: isTagged ? null : (snapshot.suggestedReportId ?? snapshot.id),
            cases: [createReportCase("")],
            fieldValues: createInitialFieldValues(fields),
        });
    };

    const cancelDraft = () => {
        resetPickProbeState();
        draftElementRef.current = null;
        contextMenuElementRef.current = null;
        setDraft(null);
        setSelectedTarget(null);
        setHoverPointer(null);
    };

    const updateDraftCase = (caseId: string, text: string) => {
        setDraft((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                cases: current.cases.map((item) => (item.id === caseId ? { ...item, text } : item)),
            };
        });
    };

    const appendSavedProbeSummaryAsNewDraftCase = useCallback(() => {
        if (!draft || Object.keys(savedProbeEdits).length === 0) {
            return;
        }

        const summary = formatSavedProbeEditsSummary(savedProbeEdits, messages);

        if (!summary) {
            return;
        }

        const newCase = createReportCase(summary);

        setDraft((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                cases: [...current.cases, newCase],
            };
        });
    }, [draft, messages, savedProbeEdits]);

    const addDraftCase = () => {
        setDraft((current) =>
            current
                ? {
                      ...current,
                      cases: [...current.cases, createReportCase("")],
                  }
                : current,
        );
    };

    const removeDraftCase = (caseId: string) => {
        setDraft((current) => {
            if (!current || current.cases.length <= 1) {
                return current;
            }

            return {
                ...current,
                cases: current.cases.filter((item) => item.id !== caseId),
            };
        });
    };

    const updateDraftField = (key: string, nextValue: string | boolean) => {
        setDraft((current) =>
            current
                ? {
                      ...current,
                      fieldValues: {
                          ...current.fieldValues,
                          [key]: nextValue,
                      },
                  }
                : current,
        );
    };

    const buildCreatePayloadFromDraft = (): CreateReportFeedbackPayload | null => {
        if (!draft) {
            return null;
        }

        const nextError = getFieldError(draft.cases, draft.fieldValues, fields, messages.errors);

        if (nextError) {
            setErrorMessage(nextError);
            return null;
        }

        if (!sessionActor) {
            setErrorMessage(messages.errors.authorRequired);
            return null;
        }

        const cases = draft.cases.map((item) => ({
            ...item,
            text: item.text.trim(),
            updated_at: new Date().toISOString(),
        }));

        return {
            pathname: currentPathname,
            report_id: draft.reportId,
            report_type: draft.reportType,
            ...(draft.targetSelector ? { target_selector: draft.targetSelector } : {}),
            cases,
            status: "open",
            field_values: draft.fieldValues,
            position: {
                target: {
                    x: draft.elementXRatio,
                    y: draft.elementYRatio,
                },
                viewport: {
                    x: draft.xRatio,
                    y: draft.yRatio,
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
                scrollY: draft.scrollY,
                anchor:
                    draft.anchorReportId && draft.anchorReportType && draft.anchorXRatio !== null && draft.anchorYRatio !== null
                        ? {
                              reportId: draft.anchorReportId,
                              reportType: draft.anchorReportType,
                              x: draft.anchorXRatio,
                              y: draft.anchorYRatio,
                          }
                        : null,
            },
            ...(environment ? { environment } : {}),
            ...(appVersion ? { app_version: appVersion } : {}),
            ...(sessionActor
                ? {
                      author_id: sessionActor.id,
                      author_name: sessionActor.name,
                  }
                : {}),
        };
    };

    const finalizeDraftCreate = () => {
        resetPickProbeState();
        draftElementRef.current = null;
        contextMenuElementRef.current = null;
        setDraft(null);
        setSelectedTarget(null);
        setHoveredTarget(null);
        setHoverPointer(null);
        setErrorMessage("");
        setMode("view");
    };

    const handleCreateSubmit = async () => {
        const payload = buildCreatePayloadFromDraft();

        if (!payload) {
            return;
        }

        try {
            const savedFeedback = await createFeedback(await signCreatePayload(payload));
            await notifyFeedbackCreate(eventCallbacks, savedFeedback);
            finalizeDraftCreate();
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveFeedbackFailed);
        }
    };

    const handleCreateSubmitWithGitHubIssue = async () => {
        if (!github?.onCreate || !canCreateGitHubIssueOnCreateValue || creatingGitHubIssueId || isCreating) {
            return;
        }

        const payload = buildCreatePayloadFromDraft();

        if (!payload) {
            return;
        }

        setCreatingGitHubIssueId("draft");
        setErrorMessage("");

        try {
            const savedFeedback = await createFeedback(await signCreatePayload(payload));
            await notifyFeedbackCreate(eventCallbacks, savedFeedback);

            const result = await github.onCreate(savedFeedback);
            const updatedFeedback = await applyGitHubIssueUpdate(savedFeedback, result);

            await notifyGitHubIssueCreated(eventCallbacks, {
                feedback: updatedFeedback,
                issueUrl: result.issueUrl,
            });
            finalizeDraftCreate();
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.createGitHubIssueFailed);
        } finally {
            setCreatingGitHubIssueId(null);
        }
    };

    const startEditing = (report: ReportFeedback) => {
        if (report.status === "archived") {
            setErrorMessage(messages.errors.archivedReadOnly);
            setSelectedReportId(report.id);
            return;
        }

        setEditingReportId(report.id);
        setEditableDraft({
            cases: report.cases.map((item) => ({ ...item })),
            status: report.status,
            fieldValues: createInitialFieldValues(fields, report.field_values),
        });
        setSelectedReportId(report.id);
    };

    const handleUpdateSubmit = async () => {
        if (!selectedReport || !editableDraft) {
            return;
        }

        if (selectedReport.status === "archived") {
            setErrorMessage(messages.errors.archivedNotEditable);
            return;
        }

        const nextError = getFieldError(editableDraft.cases, editableDraft.fieldValues, fields, messages.errors);

        if (nextError) {
            setErrorMessage(nextError);
            return;
        }

        try {
            const cases = editableDraft.cases.map((item) => ({
                ...item,
                text: item.text.trim(),
                updated_at: new Date().toISOString(),
            }));
            const updatedFeedback = await updateFeedback(
                selectedReport.id,
                await signUpdatePayload({
                    cases,
                    status: editableDraft.status,
                    field_values: editableDraft.fieldValues,
                }),
            );

            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);

            stopEditing();
            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.updateFeedbackFailed);
        }
    };

    const appendReply = async (report: ReportFeedback, reply: ReportReply) => {
        if (usesCreateReply) {
            await createReply(
                report.id,
                await signReplyPayload({
                    message: reply.message,
                    status: reply.status,
                    case_ids: reply.case_ids,
                    parent_reply_id: reply.parent_reply_id,
                    author_type: reply.author_type ?? "manager",
                    author_name: reply.author_name,
                }),
            );
        } else {
            const payload = await signUpdatePayload({
                replies: [...getReportReplies(report), reply],
            });
            await updateFeedback(report.id, payload);
        }

        await notifyFeedbackReply(eventCallbacks, {
            feedbackId: report.id,
            message: reply.message,
        });
    };

    const handleReplySubmit = async () => {
        if (!activeReplyReport) {
            return;
        }

        if (!replyDraft.trim()) {
            setErrorMessage(messages.errors.replyContentRequired);
            return;
        }

        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }

        const actorName = sessionActor?.name?.trim() ?? "";

        if (!actorName) {
            setErrorMessage(messages.errors.authorRequired);
            return;
        }

        const pendingType = pendingComposer?.type ?? null;
        const isCreatorSubmit = pendingType === "deny" || pendingType === "recheck" || pendingType === "question";
        const isQuestionSubmit = pendingType === "question";

        if (!canActOnCase(activeReplyReport, focusedCaseId, actorName)) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }

        const replyMessage = replyDraft.trim();
        const replyStatus = createReplyStatusForSubmit(pendingType, isQuestionSubmit);
        const parentReplyId = replyStatus === "additional_question" ? resolveParentReplyIdForCaseQuestion(activeReplyReport, focusedCaseId, pendingComposer) : null;
        const reply: ReportReply = {
            id: createReplyId(),
            message: replyMessage,
            created_at: new Date().toISOString(),
            status: replyStatus,
            case_ids: [focusedCaseId],
            ...(parentReplyId ? { parent_reply_id: parentReplyId } : {}),
            author_type: isCreatorSubmit ? "user" : "manager",
            author_name: actorName,
        };

        try {
            setIsSubmittingReply(true);

            await appendReply(activeReplyReport, reply);

            setErrorMessage("");
            setReplyDraft("");

            if (replyStatus === "additional_question") {
                setReplySubmitAsQuestion(true);

                if (pendingType === "question" && pendingComposer) {
                    setPendingComposer({
                        type: "question",
                        targetReplyId: pendingComposer.targetReplyId,
                    });
                } else {
                    setPendingComposer(null);
                }
            } else {
                setReplySubmitAsQuestion(false);
                setPendingComposer(null);
            }
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleClaimAssignee = async () => {
        if (!activeReplyReport) {
            return;
        }

        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }

        const assigneeName = sessionActor?.name?.trim() ?? "";

        if (!assigneeName) {
            setErrorMessage(messages.errors.authorRequired);
            return;
        }

        if (!canShowCaseClaimAction(activeReplyReport, focusedCaseId, assigneeName)) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }

        const reply: ReportReply = {
            id: createReplyId(),
            message: messages.thread.assigneeAssigned,
            created_at: new Date().toISOString(),
            status: "assignee_assigned",
            case_ids: [focusedCaseId],
            author_type: "manager",
            author_name: assigneeName,
        };

        try {
            setIsClaimingAssignee(true);
            await appendReply(activeReplyReport, reply);

            const nextCases = claimCaseAssignee(activeReplyReport.cases, focusedCaseId, assigneeName);

            await updateFeedback(
                activeReplyReport.id,
                await signUpdatePayload({
                    cases: nextCases,
                }),
            );

            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        } finally {
            setIsClaimingAssignee(false);
        }
    };

    const handleTransferAssignee = async () => {
        if (!activeReplyReport) {
            return;
        }

        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }

        const assigneeName = sessionActor?.name?.trim() ?? "";

        if (!assigneeName) {
            setErrorMessage(messages.errors.authorRequired);
            return;
        }

        const currentAssignee = getCaseAssigneeName(activeReplyReport, focusedCaseId);

        if (!currentAssignee || currentAssignee === assigneeName) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }

        const authorName = resolveOriginalFeedbackAuthorName(activeReplyReport);

        if (authorName && assigneeName === authorName) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }

        const reply: ReportReply = {
            id: createReplyId(),
            message: messages.thread.assigneeTransferred,
            created_at: new Date().toISOString(),
            status: "assignee_transferred",
            case_ids: [focusedCaseId],
            author_type: "manager",
            author_name: assigneeName,
        };

        try {
            setIsClaimingAssignee(true);
            await appendReply(activeReplyReport, reply);

            const nextCases = transferCaseAssignee(activeReplyReport.cases, focusedCaseId, assigneeName);

            await updateFeedback(
                activeReplyReport.id,
                await signUpdatePayload({
                    cases: nextCases,
                }),
            );

            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        } finally {
            setIsClaimingAssignee(false);
        }
    };

    const handleConfirmResolution = async () => {
        if (!activeReplyReport) {
            return;
        }

        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }

        const resolverName = sessionActor?.name?.trim() ?? "";

        if (!resolverName) {
            setErrorMessage(messages.errors.reviewerRequired);
            return;
        }

        if (!canActOnCase(activeReplyReport, focusedCaseId, resolverName)) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }

        const nextCases = buildResolvedCasesUpdate(activeReplyReport, [focusedCaseId]);

        try {
            if (usesCreateReply) {
                await createReply(
                    activeReplyReport.id,
                    await signReplyPayload({
                        message: messages.resolution.issueResolvedMessage,
                        status: "resolved",
                        case_ids: [focusedCaseId],
                        author_type: "user",
                        author_name: resolverName,
                    }),
                );
                const updatedFeedback = await updateFeedback(
                    activeReplyReport.id,
                    await signUpdatePayload({
                        cases: nextCases,
                    }),
                );

                await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            } else {
                const reply: ReportReply = {
                    id: createReplyId(),
                    message: messages.resolution.issueResolvedMessage,
                    created_at: new Date().toISOString(),
                    status: "resolved",
                    case_ids: [focusedCaseId],
                    author_type: "user",
                    author_name: resolverName,
                };
                const updatedFeedback = await updateFeedback(
                    activeReplyReport.id,
                    await signUpdatePayload({
                        cases: nextCases,
                        replies: [...getReportReplies(activeReplyReport), reply],
                    }),
                );

                await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            }

            setFocusedCaseId(resolveDefaultFocusedCaseId({ ...activeReplyReport, cases: nextCases }));
            setErrorMessage("");
            setPendingComposer(null);
            setReplyDraft("");
            setShowConfirmAuthorSelect(false);
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.confirmResolutionFailed);
        }
    };

    const handleCreateGitHubIssue = async (report: ReportFeedback) => {
        if (!github?.onCreate || !canCreateGitHubIssueFromListValue || creatingGitHubIssueId) {
            return;
        }

        if (isGitIssued(report)) {
            return;
        }

        setCreatingGitHubIssueId(report.id);
        setErrorMessage("");

        try {
            const result = await github.onCreate(report);
            const updatedFeedback = await applyGitHubIssueUpdate(report, result);

            await notifyGitHubIssueCreated(eventCallbacks, {
                feedback: updatedFeedback,
                issueUrl: result.issueUrl,
            });
            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.createGitHubIssueFailed);
        } finally {
            setCreatingGitHubIssueId(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteFeedback(id);
            await notifyFeedbackDelete(eventCallbacks, id);

            if (selectedReportId === id) {
                setSelectedReportId(null);
            }

            if (editingReportId === id) {
                stopEditing();
            }

            if (activeReplyReportId === id) {
                closeReplyComposer();
            }

            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.deleteFeedbackFailed);
        }
    };

    useReportShortcuts({
        mode,
        draft,
        editingReportId,
        panelTab,
        showTargetPreview,
        activeReplyReportId,
        pendingComposer,
        pickProbeOpen,
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        cancelDraft,
        cancelPendingComposer,
        closePickProbe,
        closeReplyComposer,
        handleCreateSubmit,
        stopEditing,
        handleUpdateSubmit,
        focusSearchInput,
        selectAdjacentReport,
    });

    return {
        panelAppearance: activePanelAppearance,
        setPanelAppearance,
        tooltipAppearance: activeTooltipAppearance,
        setTooltipAppearance,
        questionThreadDisplay,
        setQuestionThreadDisplay,
        locale,
        setLocale,
        messages,
        fields,
        authors: authorizedAuthors,
        projectId,
        environment,
        appVersion,
        currentPathname,
        showFeedbackList,
        panelTab,
        routeDetailsStats: resolvedRouteDetailsStats,
        panelCollapsed,
        setPanelCollapsed,
        onPanelBootstrap,
        canTransferFeedback,
        personalKey,
        publicKey,
        personalKeyRequired,
        personalKeyCandidates,
        authDiagnostics,
        authorSelectionLocked,
        panelView,
        completeOnboarding,
        restoreFromBackup,
        skipOnboarding,
        selfProfile,
        issuePersonalKey,
        rotatePersonalKey,
        insertPersonalKey,
        canListAllFeedback,
        onActivitySummary,
        visibleShortcutKeys,
        searchInputRef,
        resolvedPanelAppearance,
        resolvedTooltipAppearance,
        isMobileViewport,
        mode,
        showTargetPreview,
        showMarkerTargetPreview,
        setShowMarkerTargetPreview,
        toggleMarkerTargetPreview,
        markerAppearance,
        setMarkerAppearance,
        setMarkerSize,
        setMarkerShape,
        setMarkerColors,
        setMarkerColor,
        typography,
        setTypography,
        setFontSize,
        setFontFamily,
        activeMarkerTarget,
        markerPreviewTargets,
        selectableTargets,
        filters,
        setFilters,
        listScope,
        setListScope,
        reports,
        currentPageReports,
        filteredReports,
        isError,
        isFetching,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isCreating,
        isUpdating,
        isSubmittingReply,
        isClaimingAssignee,
        isDeleting,
        queryErrorMessage,
        refetch,
        errorMessage,
        setErrorMessage,
        draft,
        hoveredTarget,
        hoverPointer,
        selectedTarget,
        pickProbeOpen,
        pickProbeSupportsTextFields,
        pickProbeLayoutMode,
        pickProbeValues,
        pickProbeCompareMode,
        pickProbeHasEdits,
        pickTargetContextMenu,
        contextMenuElementKey,
        savedProbeEdits,
        savedProbeDeletions,
        hasProbeSessionChanges,
        canUndoProbeSession,
        canRedoProbeSession,
        undoProbeSessionAction,
        redoProbeSessionAction,
        savedProbeCompareMode,
        closePickProbe,
        closePickTargetContextMenu,
        handlePickTargetEdit,
        handlePickTargetDelete,
        handlePickTargetRevert,
        commitPickProbeEdits,
        revertSavedProbeEdit,
        revertAllSavedProbeEdits,
        setSavedProbeCompareMode,
        setPickProbeCompareMode,
        updatePickProbeValue,
        resetPickProbeValues,
        appendSavedProbeSummaryAsNewDraftCase,
        markers,
        selectedReport,
        editingReportId,
        editableDraft,
        setEditableDraft,
        overlayRef,
        activeReplyReportId,
        activeReplyReport,
        tooltipReport,
        tooltipAnchor,
        tooltipFieldTags,
        replyDraft,
        setReplyDraft,
        replySubmitAsQuestion,
        setReplySubmitAsQuestion,
        draftAuthorName,
        setDraftAuthorName: setDraftAuthorNameSafe,
        replyAuthorName,
        setReplyAuthorName: setReplyAuthorNameSafe,
        isPresentationMode,
        sessionActor,
        presentationViewers,
        presentationViewerId: resolvedPresentationViewerId,
        setPresentationViewerId: applyPresentationViewer,
        pendingComposer,
        startDenyReview,
        startCheckoutReview,
        startAskQuestion,
        handleClaimAssignee,
        handleTransferAssignee,
        cancelPendingComposer,
        confirmAuthorName,
        setConfirmAuthorName,
        showConfirmAuthorSelect,
        toggleConfirmAuthorSelect,
        handleConfirmResolution,
        beginCaseEdit,
        cancelCaseEdit,
        handleCaseEditSave,
        updateCaseEditDraftCase,
        addCaseEditDraftCase,
        removeCaseEditDraftCase,
        focusedCaseId,
        selectCase,
        clearFocusedCase,
        isCaseEditing,
        caseEditReportId,
        caseEditCases,
        targetStats,
        roleStatItems,
        panelRole,
        setPanelRole,
        statusText,
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        openPanelTab,
        togglePanelTab,
        selectReport,
        locateFeedback,
        focusSearchInput,
        selectAdjacentReport,
        openReplyComposer,
        activateFeedbackMarker,
        closeReplyComposer,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
        handleOverlayMove,
        handleOverlayContextMenu,
        handleOverlayClick,
        cancelDraft,
        updateDraftCase,
        addDraftCase,
        removeDraftCase,
        updateDraftField,
        handleCreateSubmit,
        startEditing,
        stopEditing,
        handleUpdateSubmit,
        handleReplySubmit,
        handleDelete,
        canCreateGitHubIssueFromList: canCreateGitHubIssueFromListValue,
        canCreateGitHubIssueOnCreate: canCreateGitHubIssueOnCreateValue,
        creatingGitHubIssueId,
        handleCreateGitHubIssue,
        handleCreateSubmitWithGitHubIssue,
        isDraftGitHubIssueSubmitting: creatingGitHubIssueId === "draft",
    };
}
