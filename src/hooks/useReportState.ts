import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureReportLocaleMessages, getReportMessages, setActiveReportMessages } from "@/i18n/index.js";
import type { DeepPartialReportMessages } from "@/i18n/types.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReportShortcuts } from "./useReportShortcuts.js";
import { useReportPersistence } from "./useReportPersistence.js";
import { useIsMobileViewport } from "./useIsMobileViewport.js";
import { useAppearancePreference } from "./useAppearancePreference.js";
import { useLocalePreference } from "./useLocalePreference.js";
import { usePersonalKey } from "./usePersonalKey.js";
import { useResolvedAppearance } from "./useResolvedAppearance.js";
import type {
    CreateReportFeedbackPayload,
    ReportAppearance,
    ReportAuthor,
    ReportEvent,
    ReportFeedback,
    ReportField,
    ReportGitHubConfig,
    ReportIdentify,
    ReportListAllParams,
    ReportListAllResult,
    ReportReply,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import type { DraftReport, EditableDraft, Marker, PendingFeedbackComposer, ReportMode, ReportPanelTab, TargetSnapshot } from "@/types/report-ui.js";
import { createReplyStatusForSubmit, getFeedbackDisplayStatus, resolveOriginalFeedbackAuthorName } from "@/utils/feedbackThread.js";
import { clampRatio, getMarkerFromReport, resolveTooltipAnchor } from "@/utils/coordinates.js";
import { getFeedbackTargetElement, isFeedbackTargetVisible, scrollToFeedbackTarget, waitForTargetRevealResync } from "@/utils/locateFeedback.js";

const MARKER_HOVER_LEAVE_MS = 250;
const OVERLAY_HOVER_LEAVE_MS = 100;
import { findTargetByPoint, getSelectableTargets, isSameHoverTarget, resolveFeedbackDocumentAnchor, toSnapshot } from "@/utils/dom.js";
import { createInitialFieldValues, getFieldError, getFieldTags } from "@/utils/fields.js";
import { createReplyId } from "@/utils/format.js";
import {
    notifyFeedbackCreate,
    notifyFeedbackDelete,
    notifyFeedbackReply,
    notifyFeedbackUpdate,
    notifyGitHubIssueCreated,
    type ReportSideEffectCallbacks,
} from "@/utils/reportCallbacks.js";
import {
    buildGitHubIssueUpdate,
    canCreateGitHubIssueFromList,
    canCreateGitHubIssueOnCreate,
    isGitIssued,
} from "@/utils/githubIntegration.js";

function resolveDefaultAuthorName(identify: ReportIdentify | undefined, authors: ReportAuthor[]) {
    if (identify?.name) {
        return identify.name;
    }

    return authors[0]?.name ?? "";
}

export type ReportStateConfig = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    appearance: ReportAppearance;
    fields: ReportField[];
    authors?: ReportAuthor[];
    requireReviewerKey?: boolean;
    shortcut?: string;
    identify?: ReportIdentify;
    onList?: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onNavigate?: (pathname: string) => void | Promise<void>;
    onRevealTarget?: (report: ReportFeedback) => boolean | Promise<boolean>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
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
};

export function useReportState({
    projectId,
    environment,
    appVersion,
    appearance,
    fields,
    authors = [],
    requireReviewerKey = false,
    shortcut: _shortcut,
    identify,
    onList,
    onListAll,
    onNavigate,
    onRevealTarget,
    onCreate,
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
}: ReportStateConfig) {
    const { appearance: activeAppearance, setAppearance } = useAppearancePreference(appearance);
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

    const resolvedAppearance = useResolvedAppearance(activeAppearance);
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
    } = useReportPersistence({
        projectId,
        environment,
        appVersion,
        fields,
        onList,
        onListAll,
        onCreate,
        onUpdate,
        onDelete,
        routeKey,
    });
    const eventCallbacks = useMemo<ReportSideEffectCallbacks>(
        () => ({
            onEvent,
            onReply,
        }),
        [onEvent, onReply],
    );
    const {
        personalKey,
        publicKey,
        personalKeyRequired,
        personalKeyPendingRegistration,
        personalKeyCandidates,
        authorizedAuthors,
        issuePersonalKey,
        rotatePersonalKey,
        insertPersonalKey,
        signPayload,
    } = usePersonalKey({
        enabled: requireReviewerKey || authors.some((author) => Boolean(author.publicKey)),
        projectId,
        environment,
        identify,
        authors,
    });
    const activeIdentify = authorizedAuthors[0] ?? (personalKeyRequired ? undefined : identify);

    const signCreatePayload = async (payload: CreateReportFeedbackPayload) => {
        const auth = await signPayload("feedback:create", payload);
        return auth ? { ...payload, auth } : payload;
    };

    const signUpdatePayload = async (payload: UpdateReportFeedbackPayload) => {
        if (personalKeyRequired) {
            throw new Error(messages.errors.personalKeyRequired);
        }

        const auth = await signPayload("feedback:update", payload);
        return auth ? { ...payload, auth } : payload;
    };

    const [mode, setMode] = useState<ReportMode>("idle");
    const [showTargetPreview, setShowTargetPreview] = useState(false);
    const [selectableTargets, setSelectableTargets] = useState<TargetSnapshot[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [draft, setDraft] = useState<DraftReport | null>(null);
    const [hoveredTarget, setHoveredTarget] = useState<TargetSnapshot | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<TargetSnapshot | null>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
    const [activeReplyReportId, setActiveReplyReportId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [draftAuthorName, setDraftAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
    const [replyAuthorName, setReplyAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
    const [pendingComposer, setPendingComposer] = useState<PendingFeedbackComposer>(null);
    const [confirmAuthorName, setConfirmAuthorName] = useState("");
    const [showConfirmAuthorSelect, setShowConfirmAuthorSelect] = useState(false);
    const pendingLocateReportIdRef = useRef<string | null>(null);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [editableDraft, setEditableDraft] = useState<EditableDraft | null>(null);
    const [panelTab, setPanelTab] = useState<ReportPanelTab | null>(null);
    const [creatingGitHubIssueId, setCreatingGitHubIssueId] = useState<string | null>(null);

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
        let resolved = 0;
        let inProgress = 0;

        for (const report of currentPageFilteredReports) {
            const status = getFeedbackDisplayStatus(report, true);

            if (status === "resolved") {
                resolved += 1;
            } else if (status === "wait_for_reply" || status === "suggested" || status === "found_error" || status === "recheck_requested") {
                inProgress += 1;
            }
        }

        const foundCount = currentPageFilteredReports.length;

        return {
            found: foundCount,
            resolved,
            inProgress,
        };
    }, [currentPageFilteredReports]);

    const statusText = useMemo(() => {
        if (mode === "report") {
            const focusTarget = selectedTarget ?? hoveredTarget;
            if (!focusTarget) {
                return "";
            }

            const typeLabel = focusTarget.type === "item" ? messages.statusText.selectedItem : messages.statusText.selectedGroup;
            return `${typeLabel}\n${focusTarget.id}`;
        }

        if (mode === "view") {
            return isFetching ? messages.statusText.loadingFeedback : messages.statusText.ready;
        }

        if (showTargetPreview) {
            return messages.statusText.showingSelectableTargets(selectableTargets.length);
        }

        if (selectableTargets.length === 0) {
            return messages.statusText.noSelectableTargets;
        }

        return messages.statusText.ready;
    }, [filteredReports.length, isFetching, hoveredTarget, messages.statusText, mode, selectableTargets.length, selectedTarget, showTargetPreview]);

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
        setDraftAuthorName(resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
        setReplyAuthorName(resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
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
    }, [currentPathname, mode]);

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
    }, [currentPageFilteredReports]);

    useEffect(() => {
        if (mode !== "view") {
            setMarkers([]);
            return;
        }

        syncMarkers();
        window.addEventListener("scroll", syncMarkers, { passive: true, capture: true });
        window.addEventListener("resize", syncMarkers);

        return () => {
            window.removeEventListener("scroll", syncMarkers, { capture: true });
            window.removeEventListener("resize", syncMarkers);
        };
    }, [mode, syncMarkers]);

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
            setHoveredTarget(toSnapshot(hoveredElementRef.current));
            setSelectedTarget(toSnapshot(selectedElementRef.current));
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
            }

            overlayHoverLeaveTimeoutRef.current = null;
        }, OVERLAY_HOVER_LEAVE_MS);
    };

    const stopEditing = () => {
        setEditingReportId(null);
        setEditableDraft(null);
    };

    const selectReport = (reportId: string) => {
        setSelectedReportId(reportId);

        if (editingReportId && editingReportId !== reportId) {
            stopEditing();
        }
    };

    const closeReplyComposer = () => {
        setActiveReplyReportId(null);
        setReplyDraft("");
        setPendingComposer(null);
        setShowConfirmAuthorSelect(false);
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
        setPendingComposer(null);
        setReplyAuthorName(resolveDefaultAuthorName(activeIdentify, authorizedAuthors));
        setConfirmAuthorName(resolveOriginalFeedbackAuthorName(report));
        setShowConfirmAuthorSelect(false);
        clearHoverLeaveTimeout();
    };

    const activateFeedbackMarker = useCallback(
        async (report: ReportFeedback) => {
            await prepareFeedbackLocation(report);
            openReplyComposer(report);
        },
        [openReplyComposer, prepareFeedbackLocation],
    );

    const toggleConfirmAuthorSelect = () => {
        setShowConfirmAuthorSelect((current) => !current);
    };

    const startDenyReview = () => {
        if (!activeReplyReport) {
            return;
        }

        const latest = activeReplyReport.replies[activeReplyReport.replies.length - 1];

        if (!latest) {
            return;
        }

        setPendingComposer({
            type: latest.status === "found_error" ? "recheck" : "deny",
            targetReplyId: latest.id,
        });
        setReplyDraft("");
    };

    const startCheckoutReview = (replyId: string) => {
        setPendingComposer({ type: "checkout", targetReplyId: replyId });
        setReplyDraft("");
    };

    const cancelPendingComposer = () => {
        setPendingComposer(null);
        setReplyDraft("");
    };

    const toggleReportMode = () => {
        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return;
        }

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
        setSelectedReportId(filteredReports[0]?.id ?? null);
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

    // overlay (target pick, create draft, edit)
    const handleOverlayMove = (event: MouseEvent<HTMLDivElement>) => {
        if (mode !== "report" || draft) {
            return;
        }

        const targetElement = findTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        hoveredElementRef.current = targetElement;

        if (!targetElement) {
            scheduleOverlayHoverLeave();
            return;
        }

        clearOverlayHoverLeaveTimeout();
        const snapshot = toSnapshot(targetElement);
        setHoveredTarget((previous) => (isSameHoverTarget(previous, snapshot) ? previous : snapshot));
    };

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (mode !== "report") {
            return;
        }

        const targetElement = findTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        const snapshot = toSnapshot(targetElement);

        if (!targetElement || !snapshot) {
            setErrorMessage(messages.errors.clickSelectableArea);
            return;
        }

        hoveredElementRef.current = targetElement;
        selectedElementRef.current = targetElement;
        setHoveredTarget(snapshot);
        setSelectedTarget(snapshot);
        setErrorMessage("");
        const anchorSnapshot = resolveFeedbackDocumentAnchor(targetElement);
        setDraft({
            clientX: event.clientX,
            clientY: event.clientY,
            xRatio: clampRatio(event.clientX / window.innerWidth),
            yRatio: clampRatio(event.clientY / window.innerHeight),
            elementXRatio: clampRatio((event.clientX - snapshot.rect.left) / Math.max(snapshot.rect.width, 1)),
            elementYRatio: clampRatio((event.clientY - snapshot.rect.top) / Math.max(snapshot.rect.height, 1)),
            anchorReportId: anchorSnapshot?.id ?? null,
            anchorReportType: anchorSnapshot?.type ?? null,
            anchorXRatio: anchorSnapshot
                ? clampRatio((event.clientX - anchorSnapshot.rect.left) / Math.max(anchorSnapshot.rect.width, 1))
                : null,
            anchorYRatio: anchorSnapshot
                ? clampRatio((event.clientY - anchorSnapshot.rect.top) / Math.max(anchorSnapshot.rect.height, 1))
                : null,
            scrollY: window.scrollY,
            documentY: Math.round(window.scrollY + event.clientY),
            reportId: snapshot.id,
            reportType: snapshot.type,
            message: "",
            fieldValues: createInitialFieldValues(fields),
        });
    };

    const cancelDraft = () => {
        setDraft(null);
        setSelectedTarget(null);
    };

    const updateDraftMessage = (nextMessage: string) => {
        setDraft((current) => (current ? { ...current, message: nextMessage } : current));
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

        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return null;
        }

        const nextError = getFieldError(draft.message, draft.fieldValues, fields, messages.errors);

        if (nextError) {
            setErrorMessage(nextError);
            return null;
        }

        return {
            pathname: currentPathname,
            report_id: draft.reportId,
            report_type: draft.reportType,
            message: draft.message.trim(),
            status: "open",
            field_values: draft.fieldValues,
            x_ratio: draft.xRatio,
            y_ratio: draft.yRatio,
            element_x_ratio: draft.elementXRatio,
            element_y_ratio: draft.elementYRatio,
            anchor_report_id: draft.anchorReportId,
            anchor_report_type: draft.anchorReportType,
            anchor_x_ratio: draft.anchorXRatio,
            anchor_y_ratio: draft.anchorYRatio,
            scroll_y: draft.scrollY,
            document_y: draft.documentY,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            design_width: window.innerWidth,
            design_height: window.innerHeight,
            ...(environment ? { environment } : {}),
            ...(appVersion ? { app_version: appVersion } : {}),
            ...(activeIdentify || draftAuthorName.trim()
                ? {
                      ...(activeIdentify ? { author_id: activeIdentify.id } : {}),
                      author_name: draftAuthorName.trim() || activeIdentify?.name,
                  }
                : {}),
        };
    };

    const finalizeDraftCreate = () => {
        setDraft(null);
        setSelectedTarget(null);
        setHoveredTarget(null);
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
            const updatedFeedback = await updateFeedback(
                savedFeedback.id,
                await signUpdatePayload(buildGitHubIssueUpdate(savedFeedback, result, messages.resolution.gitIssuedMessage)),
            );

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
            message: report.message,
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

        const nextError = getFieldError(editableDraft.message, editableDraft.fieldValues, fields, messages.errors);

        if (nextError) {
            setErrorMessage(nextError);
            return;
        }

        try {
            const updatedFeedback = await updateFeedback(selectedReport.id, await signUpdatePayload({
                message: editableDraft.message.trim(),
                status: editableDraft.status,
                field_values: editableDraft.fieldValues,
            }));

            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);

            stopEditing();
            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.updateFeedbackFailed);
        }
    };

    const appendReply = async (report: ReportFeedback, reply: ReportReply) => {
        const payload = await signUpdatePayload({
            replies: [...report.replies, reply],
        });
        await updateFeedback(report.id, payload);

        await notifyFeedbackReply(eventCallbacks, {
            feedbackId: report.id,
            message: reply.message,
        });
    };

    const handleReplySubmit = async () => {
        if (!activeReplyReport) {
            return;
        }

        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return;
        }

        if (!replyDraft.trim()) {
            setErrorMessage(messages.errors.replyContentRequired);
            return;
        }

        if (!replyAuthorName.trim()) {
            setErrorMessage(messages.errors.authorRequired);
            return;
        }

        const replyMessage = replyDraft.trim();
        const pendingType = pendingComposer?.type ?? null;
        const reply: ReportReply = {
            id: createReplyId(),
            message: replyMessage,
            created_at: new Date().toISOString(),
            status: createReplyStatusForSubmit(pendingType),
            author_type: "manager",
            author_name: replyAuthorName.trim(),
        };

        try {
            await appendReply(activeReplyReport, reply);
            setErrorMessage("");
            setReplyDraft("");
            setPendingComposer(null);
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        }
    };

    const handleConfirmResolution = async () => {
        if (!activeReplyReport) {
            return;
        }

        const resolverName = confirmAuthorName.trim() || resolveOriginalFeedbackAuthorName(activeReplyReport);

        if (!resolverName) {
            setErrorMessage(messages.errors.reviewerRequired);
            return;
        }

        const reply: ReportReply = {
            id: createReplyId(),
            message: messages.resolution.issueResolvedMessage,
            created_at: new Date().toISOString(),
            status: "resolved",
            author_type: "user",
            author_name: resolverName,
        };

        try {
            const updatedFeedback = await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                status: "resolved",
                replies: [...activeReplyReport.replies, reply],
            }));

            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);

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
            const updatedFeedback = await updateFeedback(
                report.id,
                await signUpdatePayload(buildGitHubIssueUpdate(report, result, messages.resolution.gitIssuedMessage)),
            );

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
        if (personalKeyRequired) {
            setErrorMessage(messages.errors.personalKeyRequired);
            return;
        }

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
        toggleReportMode,
        toggleTargetPreview,
        toggleIssueMode,
        cancelDraft,
        cancelPendingComposer,
        closeReplyComposer,
        handleCreateSubmit,
        stopEditing,
        handleUpdateSubmit,
        focusSearchInput,
        selectAdjacentReport,
    });

    return {
        appearance: activeAppearance,
        setAppearance,
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
        routeDetailsStats,
        canTransferFeedback,
        personalKey,
        publicKey,
        personalKeyRequired,
        personalKeyPendingRegistration,
        personalKeyCandidates,
        issuePersonalKey,
        rotatePersonalKey,
        insertPersonalKey,
        canListAllFeedback,
        visibleShortcutKeys,
        searchInputRef,
        resolvedAppearance,
        isMobileViewport,
        mode,
        showTargetPreview,
        selectableTargets,
        filters,
        setFilters,
        listScope,
        setListScope,
        reports,
        filteredReports,
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
        errorMessage,
        setErrorMessage,
        draft,
        hoveredTarget,
        selectedTarget,
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
        draftAuthorName,
        setDraftAuthorName,
        replyAuthorName,
        setReplyAuthorName,
        pendingComposer,
        startDenyReview,
        startCheckoutReview,
        cancelPendingComposer,
        confirmAuthorName,
        setConfirmAuthorName,
        showConfirmAuthorSelect,
        toggleConfirmAuthorSelect,
        handleConfirmResolution,
        targetStats,
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
        handleOverlayClick,
        cancelDraft,
        updateDraftMessage,
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
