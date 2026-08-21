import { useCallback, useEffect, useMemo, useRef, useState, type AnimationEvent as ReactAnimationEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode, Fragment } from "react";
import { getMarkerDotSize } from "@/utils/marker/markerRuntime.js";
import { useDraggableWindow, clampWindowPosition } from "@/hooks/useDraggableWindow.js";
import { useGhostCornerResize, type BoxSize } from "@/hooks/useGhostCornerResize.js";
import { useNativeHover } from "@/hooks/useNativeHover.js";
import { useReport } from "@/providers/reportContext.js";
import type { Marker } from "@/types/report-ui.js";
import type { ReportFeedback } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
import { resolvePendingComposerTargetPreview, shouldShowCaseReplyComposer } from "@/utils/feedback/feedbackThread.js";
import { getCaseAssigneeName, getCaseById, getReportCases } from "@/utils/report/reportCases.js";
import { getFieldTags } from "@/utils/report/fields.js";
import { copyTextToClipboard } from "@/utils/feedback/feedbackDataTransfer.js";
import { buildFeedbackShareUrl } from "@/utils/feedback/feedbackDeepLink.js";
import { CloseIcon, CheckCircleIcon, EditIcon, LinkIcon, MaximizeIcon, MinimizeIcon, RestoreIcon, SidePanelIcon, TrashIcon } from "@/components/icons/Icons.js";
import { FeedbackFieldTags } from "@/components/panel/feedback/FeedbackFieldTags.js";
import { FeedbackDeleteAction } from "@/components/panel/feedback/FeedbackDeleteAction.js";
import { canDeleteFeedback } from "@/utils/feedback/feedbackPermissions.js";
import { canEditReportCases } from "@/utils/report/reportCases.js";
import { mentionMessageToPlainText } from "@/utils/mention/elementMentions.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { CornerResizeGhost } from "@/components/ui/CornerResizeGhost.js";
import { MOTION } from "@/constants/motionClasses.js";
import { ACCENT_COLOR } from "@/constants/accentColors.js";
import { CornerResizeHandle } from "@/components/ui/CornerResizeHandle.js";
import { FeedbackComposer } from "@/components/panel/feedback/FeedbackComposer.js";
import { CaseAssigneeInfo } from "@/components/panel/feedback/CaseAssigneeInfo.js";
import { FeedbackThread } from "@/components/panel/feedback/FeedbackThread.js";
import { MarkerCaseSidebar } from "./MarkerCaseSidebar.js";
import { ProcessingDots } from "@/components/ui/ProcessingDots.js";
import { Text } from "@/components/ui/Text/index.js";
import { MARKER_MINIMIZED_WINDOW_HEIGHT, MARKER_MINIMIZED_WINDOW_WIDTH, MARKER_WINDOW_MARGIN, resolveMinimizedDockIndexFromPointer, resolveMinimizedDockPosition } from "@/utils/marker/markerWindowDock.js";
import { readMinimizedWindowAlias, writeMinimizedWindowAlias } from "@/utils/marker/minimizedWindowAlias.js";

type WindowMode = "normal" | "minimized" | "maximized";
type WindowSurfacePhase = "entering" | "idle" | "exiting";
type DockMorphRect = {
    left: number;
    top: number;
    width: number;
    height: number;
};
type DockMorphState = (DockMorphRect & { phase: "minimizing" | "restoring" }) | null;
type DockDragState = {
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    pointerX: number;
    pointerY: number;
    active: boolean;
};

const WINDOW_MARGIN = MARKER_WINDOW_MARGIN;
const DEFAULT_WINDOW_SIZE: BoxSize = { width: 600, height: 460 };
const MIN_WINDOW_WIDTH = 420;
const MIN_WINDOW_HEIGHT = 280;
const DEFAULT_SIDEBAR_WIDTH = 208;
const RESOLVED_STATUS_COLOR = ACCENT_COLOR.green;
const SIDEBAR_MIN_WIDTH = 150;
const RIGHT_MIN_WIDTH = 280;
const COLLAPSED_SIDEBAR_WIDTH = 46;
const MINIMIZED_WINDOW_HEIGHT = MARKER_MINIMIZED_WINDOW_HEIGHT;
const MINIMIZED_WINDOW_WIDTH = MARKER_MINIMIZED_WINDOW_WIDTH;
const MINIMIZE_MORPH_MS = 420;
const MINIMIZE_MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const MINIMIZE_MORPH_TRANSITION = `left ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, top ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, width ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, height ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}`;
const MINIMIZED_DOCK_SLIDE_TRANSITION = `left ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}, top ${MINIMIZE_MORPH_MS}ms ${MINIMIZE_MORPH_EASE}`;
const MINIMIZED_DOCK_DRAG_THRESHOLD_PX = 6;
const MINIMIZED_DOCK_DRAG_LIFT_PX = 10;
const WINDOW_CLOSE_ANIMATION_MS = 220;
const LEFT_SECTION_TRANSITION = "transition-[background-color,backdrop-filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]";
const LEFT_SECTION_FLAT_CLASS = `${LEFT_SECTION_TRANSITION} bg-[var(--adaptive-black50)]`;
const LEFT_SECTION_BLUR_CLASS = `${LEFT_SECTION_TRANSITION} bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[20px] shadow-[inset_0_20px_0_20px_var(--adaptive-black500)]]`;

function getLeftSectionClass(phase: WindowSurfacePhase) {
    return phase === "idle" ? LEFT_SECTION_BLUR_CLASS : LEFT_SECTION_FLAT_CLASS;
}
const HEADER_BUTTON_CLASS =
    "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
const SIDEBAR_ACTION_CLASS =
    "flex h-[32px] w-full items-center gap-[8px] rounded-[8px] px-[8px] text-left text-[13px] font-semibold text-[var(--adaptive-black700)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";

function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getViewportSize() {
    if (typeof window === "undefined") {
        return { width: DEFAULT_WINDOW_SIZE.width, height: DEFAULT_WINDOW_SIZE.height };
    }

    return { width: window.innerWidth, height: window.innerHeight };
}

function clampMarkerWindowSize(width: number, height: number): BoxSize {
    const viewport = getViewportSize();
    const maxWidth = Math.max(MIN_WINDOW_WIDTH, viewport.width - WINDOW_MARGIN * 2);
    const maxHeight = Math.max(MIN_WINDOW_HEIGHT, viewport.height - WINDOW_MARGIN * 2);

    return {
        width: Math.min(Math.max(width, MIN_WINDOW_WIDTH), maxWidth),
        height: Math.min(Math.max(height, MIN_WINDOW_HEIGHT), maxHeight),
    };
}

function clampSidebarWidth(width: number, windowWidth: number): number {
    const maxWidth = Math.max(SIDEBAR_MIN_WIDTH, windowWidth - RIGHT_MIN_WIDTH);

    return Math.min(Math.max(width, SIDEBAR_MIN_WIDTH), maxWidth);
}

function WindowControlButton({ onClick, ariaLabel, title, className = "", children }: { onClick: () => void; ariaLabel: string; title?: string; className?: string; children: ReactNode }) {
    return (
        <button
            type="button"
            data-fivepixels-interactive=""
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClick}
            aria-label={ariaLabel}
            title={title}
            className={`${HEADER_BUTTON_CLASS} ${className}`}
        >
            {children}
        </button>
    );
}

function MinimizedCaseMarquee({ caseTexts }: { caseTexts: string[] }) {
    if (caseTexts.length === 0) {
        return null;
    }

    return (
        <div className="min-w-0 flex-1 overflow-hidden text-[12px] text-[var(--adaptive-black700)]">
            <div
                aria-hidden
                className="fivepixels-marker-window-marquee"
                style={{ animationDuration: `${Math.max(12, caseTexts.length * 6)}s` }}
            >
                {[0, 1].map((copyIndex) => (
                    <div
                        key={copyIndex}
                        className="fivepixels-marker-window-marquee__copy"
                    >
                        {caseTexts.map((text, index) => (
                            <span
                                key={`${copyIndex}-${index}`}
                                className="whitespace-nowrap"
                            >
                                <span className="mr-[4px] text-[var(--adaptive-black500)]">{index + 1}.</span>
                                {text}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function MinimizedWindowAliasRow({
    projectId,
    reportId,
    caseTexts,
    messages,
    onRestore,
    restoreDisabled = false,
}: {
    projectId: string;
    reportId: string;
    caseTexts: string[];
    messages: ReportMessages;
    onRestore: () => void;
    restoreDisabled?: boolean;
}) {
    const [alias, setAlias] = useState(() => readMinimizedWindowAlias(projectId, reportId));
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(alias);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAlias(readMinimizedWindowAlias(projectId, reportId));
    }, [projectId, reportId]);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        inputRef.current?.focus();
        inputRef.current?.select();
    }, [isEditing]);

    const commitAlias = () => {
        const next = writeMinimizedWindowAlias(projectId, reportId, draft);
        setAlias(next);
        setDraft(next);
        setIsEditing(false);
    };

    const clearAlias = () => {
        writeMinimizedWindowAlias(projectId, reportId, "");
        setAlias("");
        setDraft("");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div
                className="flex min-w-0 items-center gap-[4px]"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    maxLength={40}
                    placeholder={messages.marker.minimizedAliasPlaceholder}
                    aria-label={messages.marker.minimizedAliasInputAriaLabel}
                    data-fivepixels-interactive=""
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            commitAlias();
                        }

                        if (event.key === "Escape") {
                            event.preventDefault();
                            setDraft(alias);
                            setIsEditing(false);
                        }
                    }}
                    onBlur={commitAlias}
                    className="min-w-0 flex-1 rounded-[4px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[12px] font-semibold text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]"
                />
                {alias ? (
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        aria-label={messages.marker.minimizedAliasClearAriaLabel}
                        title={messages.marker.minimizedAliasClearAriaLabel}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={clearAlias}
                        className="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]"
                    >
                        <CloseIcon className="h-[12px] w-[12px]" />
                    </button>
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-[4px]">
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={onRestore}
                disabled={restoreDisabled}
                aria-label={messages.marker.windowRestoreAriaLabel}
                className="flex min-w-0 flex-1 items-center overflow-hidden text-left"
            >
                {alias ? (
                    <p
                        className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-[1.3] text-[var(--adaptive-black900)]"
                        title={alias}
                    >
                        {alias}
                    </p>
                ) : (
                    <MinimizedCaseMarquee caseTexts={caseTexts} />
                )}
            </button>
            <button
                type="button"
                data-fivepixels-interactive=""
                aria-label={messages.marker.minimizedAliasEditAriaLabel}
                title={messages.marker.minimizedAliasEditAriaLabel}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation();
                    setDraft(alias);
                    setIsEditing(true);
                }}
                className="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]"
            >
                <EditIcon className="h-[12px] w-[12px]" />
            </button>
        </div>
    );
}

function UnfocusedCaseSummary({ caseTexts, emptyLabel, navigateHint }: { caseTexts: string[]; emptyLabel: string; navigateHint?: string }) {
    return (
        <div className="flex max-h-full w-full max-w-[440px] flex-col items-center gap-[12px] overflow-hidden px-[28px]">
            {navigateHint ? <p className="text-center text-[12px] font-medium leading-[1.4] text-[var(--adaptive-blue500)]">{navigateHint}</p> : null}
            {caseTexts.length === 0 ? (
                <p className="text-center text-[13px] text-[var(--adaptive-black500)]">{emptyLabel}</p>
            ) : (
                <ul className="flex w-full flex-col gap-[8px] overflow-hidden">
                    {caseTexts.map((text, index) => (
                        <li
                            key={`${index}-${text.slice(0, 24)}`}
                            className="truncate text-center text-[13px] leading-[1.4] text-[var(--adaptive-black800)]"
                            title={text}
                        >
                            <span className="mr-[6px] text-[var(--adaptive-black500)]">{index + 1}.</span>
                            {text}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function MarkerWindowShareButton({ report, messages, expanded = false }: { report: ReportFeedback; messages: ReportMessages; expanded?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        void copyTextToClipboard(buildFeedbackShareUrl(report))
            .then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
            })
            .catch(() => {
                setCopied(false);
            });
    };

    return expanded ? (
        <button
            type="button"
            data-fivepixels-interactive=""
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleCopy}
            aria-label={messages.marker.shareLinkAriaLabel}
            className={SIDEBAR_ACTION_CLASS}
        >
            <LinkIcon className="h-[15px] w-[15px] shrink-0" />
            <span>{copied ? messages.marker.shareLinkCopiedTitle : messages.marker.shareAction}</span>
        </button>
    ) : (
        <WindowControlButton
            onClick={handleCopy}
            ariaLabel={messages.marker.shareLinkAriaLabel}
            title={copied ? messages.marker.shareLinkCopiedTitle : messages.marker.shareLinkTitle}
        >
            <LinkIcon className="h-[15px] w-[15px]" />
        </WindowControlButton>
    );
}

type MarkerFeedbackWindowProps = {
    report: ReportFeedback;
    anchor: Pick<Marker, "left" | "top">;
    isFocused: boolean;
};

export function MarkerFeedbackWindow({ report, anchor, isFocused }: MarkerFeedbackWindowProps) {
    const {
        messages,
        fields,
        authors,
        currentPathname,
        pendingComposer,
        replyDraft,
        replyMentions,
        replyAuthorName,
        confirmAuthorName,
        showConfirmAuthorSelect,
        errorMessage,
        setErrorMessage,
        isUpdating,
        isSubmittingReply,
        isClaimingAssignee,
        focusedCaseId,
        selectCase,
        closeReplyWindow,
        focusReplyWindow,
        revealOpenFeedback,
        minimizedReplyReportIds,
        setReplyWindowMinimized,
        reorderMinimizedReplyWindow,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
        setReplyDraft,
        setReplyMentions,
        setReplyAuthorName,
        setConfirmAuthorName,
        toggleConfirmAuthorSelect,
        handleReplySubmit,
        startDenyReview,
        startCheckoutReview,
        startAskQuestion,
        handleClaimAssignee,
        handleTransferAssignee,
        handleConfirmResolution,
        handleDelete,
        isDeleting,
        sessionActor,
        cancelPendingComposer,
        beginFeedbackEdit,
        addDraftCase,
        projectId,
    } = useReport();

    const windowRef = useRef<HTMLDivElement | null>(null);
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const closeRequestedRef = useRef(false);
    const closeFinishedRef = useRef(false);

    const [windowMode, setWindowMode] = useState<WindowMode>("normal");
    const [windowSurfacePhase, setWindowSurfacePhase] = useState<WindowSurfacePhase>("entering");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [size, setSize] = useState<BoxSize>(DEFAULT_WINDOW_SIZE);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const [isSidebarDeleteConfirming, setIsSidebarDeleteConfirming] = useState(false);
    const [dockMorph, setDockMorph] = useState<DockMorphState>(null);
    const [dockDrag, setDockDrag] = useState<DockDragState | null>(null);
    const dockMorphTimerRef = useRef<number | null>(null);
    const dockMorphFrameRef = useRef<number | null>(null);
    const dockDragRef = useRef<DockDragState | null>(null);
    const dockDragListenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);
    const suppressDockRestoreClickRef = useRef(false);
    const minimizedReplyReportIdsRef = useRef(minimizedReplyReportIds);
    minimizedReplyReportIdsRef.current = minimizedReplyReportIds;

    const splitStateRef = useRef<{ startX: number; startWidth: number; windowWidth: number } | null>(null);
    const splitListenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);

    const hoverRef = useNativeHover<HTMLDivElement>({
        onEnter: () => {
            clearHoverLeaveTimeout();
            setHoveredMarkerId(report.id);
        },
        onLeave: () => {
            scheduleHoverLeave(report.id);
        },
    });

    const bindWindowRef = useCallback(
        (node: HTMLDivElement | null) => {
            windowRef.current = node;
            hoverRef(node);
        },
        [hoverRef],
    );

    const { position, handleDragHandlePointerDown } = useDraggableWindow({
        enabled: windowMode === "normal" && dockMorph === null,
        windowRef,
    });

    const { isResizing, ghostRef, handleResizePointerDown } = useGhostCornerResize({
        enabled: windowMode === "normal" && dockMorph === null,
        targetRef: surfaceRef,
        handleCorner: "bottom-right",
        clampSize: clampMarkerWindowSize,
        onResizeComplete: setSize,
    });

    const finishClose = useCallback(() => {
        if (closeFinishedRef.current) {
            return;
        }

        closeFinishedRef.current = true;
        clearHoverLeaveTimeout();
        setHoveredMarkerId((current) => (current === report.id ? null : current));
        closeReplyWindow(report.id);
    }, [clearHoverLeaveTimeout, closeReplyWindow, report.id, setHoveredMarkerId]);

    const requestClose = useCallback(() => {
        if (closeRequestedRef.current) {
            return;
        }

        closeRequestedRef.current = true;
        setWindowSurfacePhase("exiting");
    }, []);

    const handleWindowAnimationEnd = useCallback(
        (event: ReactAnimationEvent<HTMLDivElement>) => {
            if (event.currentTarget !== event.target) {
                return;
            }

            if (event.animationName.endsWith("fivepixels-marker-window-in")) {
                setWindowSurfacePhase("idle");
                return;
            }

            if (event.animationName.endsWith("fivepixels-marker-window-out") && closeRequestedRef.current) {
                finishClose();
            }
        },
        [finishClose],
    );

    useEffect(() => {
        if (windowSurfacePhase !== "exiting") {
            return;
        }

        const fallbackId = window.setTimeout(finishClose, WINDOW_CLOSE_ANIMATION_MS + 60);

        return () => {
            window.clearTimeout(fallbackId);
        };
    }, [finishClose, windowSurfacePhase]);

    const detachSplitListeners = useCallback(() => {
        const listeners = splitListenersRef.current;

        if (!listeners) {
            return;
        }

        window.removeEventListener("pointermove", listeners.move, true);
        window.removeEventListener("pointerup", listeners.up, true);
        window.removeEventListener("pointercancel", listeners.up, true);
        splitListenersRef.current = null;
    }, []);

    useEffect(() => () => detachSplitListeners(), [detachSplitListeners]);

    const clearDockMorphTimers = useCallback(() => {
        if (dockMorphTimerRef.current !== null) {
            window.clearTimeout(dockMorphTimerRef.current);
            dockMorphTimerRef.current = null;
        }

        if (dockMorphFrameRef.current !== null) {
            window.cancelAnimationFrame(dockMorphFrameRef.current);
            dockMorphFrameRef.current = null;
        }
    }, []);

    const detachDockDragListeners = useCallback(() => {
        const listeners = dockDragListenersRef.current;

        if (!listeners) {
            return;
        }

        window.removeEventListener("pointermove", listeners.move, true);
        window.removeEventListener("pointerup", listeners.up, true);
        window.removeEventListener("pointercancel", listeners.up, true);
        dockDragListenersRef.current = null;
    }, []);

    useEffect(() => () => clearDockMorphTimers(), [clearDockMorphTimers]);
    useEffect(() => () => detachDockDragListeners(), [detachDockDragListeners]);

    useEffect(() => {
        if (!isSidebarDeleteConfirming) {
            return;
        }

        const timer = window.setTimeout(() => setIsSidebarDeleteConfirming(false), 1500);

        return () => window.clearTimeout(timer);
    }, [isSidebarDeleteConfirming]);

    useEffect(() => {
        const dockMinimized = minimizedReplyReportIds.includes(report.id);

        if (!dockMinimized && windowMode === "minimized" && dockMorph === null) {
            setWindowMode("normal");
        }
    }, [dockMorph, minimizedReplyReportIds, report.id, windowMode]);

    const isOnFeedbackPath = report.pathname === currentPathname;
    const showFullContent = isFocused && isOnFeedbackPath;
    const isCreatorQuestionComposer = pendingComposer?.type === "question";

    const showComposer = useMemo(() => {
        if (!showFullContent || !focusedCaseId) {
            return false;
        }

        return shouldShowCaseReplyComposer(report, focusedCaseId, pendingComposer);
    }, [focusedCaseId, pendingComposer, report, showFullContent]);

    const replyTargetPreview = useMemo(() => {
        if (!showFullContent || pendingComposer?.type !== "question") {
            return null;
        }

        return resolvePendingComposerTargetPreview(report, focusedCaseId, pendingComposer);
    }, [focusedCaseId, pendingComposer, report, showFullContent]);

    const focusedCase = showFullContent && focusedCaseId ? getCaseById(report, focusedCaseId) : undefined;
    const focusedCaseAssigneeName = showFullContent && focusedCaseId ? getCaseAssigneeName(report, focusedCaseId) : null;
    const showAssigneeAssigned = Boolean(focusedCaseAssigneeName) || isClaimingAssignee;
    const fieldTags = useMemo(() => getFieldTags(fields, report.field_values), [fields, report.field_values]);
    const caseTexts = useMemo(
        () =>
            getReportCases(report)
                .map((caseItem) => mentionMessageToPlainText(caseItem.text, caseItem.mentions).trim())
                .filter(Boolean),
        [report],
    );
    const minimizedCaseTexts = useMemo(() => caseTexts.slice(0, 5), [caseTexts]);

    const viewport = getViewportSize();
    const maximizedSize: BoxSize = {
        width: Math.max(MIN_WINDOW_WIDTH, viewport.width - WINDOW_MARGIN * 2),
        height: Math.max(MIN_WINDOW_HEIGHT, viewport.height - WINDOW_MARGIN * 2),
    };

    const isMinimized = windowMode === "minimized" || dockMorph?.phase === "minimizing";
    const isMaximized = windowMode === "maximized";
    const showMinimizedChrome = windowMode === "minimized" && dockMorph?.phase !== "restoring";
    const effectiveSize = isMaximized ? maximizedSize : size;
    const minimizedWidth = Math.min(MINIMIZED_WINDOW_WIDTH, Math.max(0, viewport.width - WINDOW_MARGIN * 2));
    const resolvedSidebarWidth = clampSidebarWidth(sidebarWidth, effectiveSize.width);
    const minimizedDockIndex = Math.max(0, minimizedReplyReportIds.indexOf(report.id));
    const minimizedDockCount = Math.max(1, minimizedReplyReportIds.length);

    // Freeze the open position on mount so page changes (lost marker anchors) don't
    // collapse every window onto the same fallback center coordinate.
    const [seedPosition] = useState(() =>
        clampWindowPosition(
            anchor.left + getMarkerDotSize() / 2 - DEFAULT_WINDOW_SIZE.width / 2,
            anchor.top + getMarkerDotSize() / 2 - DEFAULT_WINDOW_SIZE.height / 2,
            DEFAULT_WINDOW_SIZE.width,
            DEFAULT_WINDOW_SIZE.height,
        ),
    );

    const restoredPosition = isMaximized ? { left: WINDOW_MARGIN, top: WINDOW_MARGIN } : (position ?? seedPosition);
    const dockPosition = resolveMinimizedDockPosition(
        minimizedDockIndex,
        minimizedDockCount,
        viewport.width,
        viewport.height,
        minimizedWidth,
        MINIMIZED_WINDOW_HEIGHT,
    );
    const resolvedPosition = showMinimizedChrome ? dockPosition : restoredPosition;
    const isDockDragging = dockDrag?.active === true;
    const displayRect: DockMorphRect = dockMorph ?? {
        left: dockDrag?.active ? dockDrag.pointerX - dockDrag.offsetX : resolvedPosition.left,
        top: dockDrag?.active ? dockPosition.top - MINIMIZED_DOCK_DRAG_LIFT_PX : resolvedPosition.top,
        width: showMinimizedChrome ? minimizedWidth : effectiveSize.width,
        height: showMinimizedChrome ? MINIMIZED_WINDOW_HEIGHT : effectiveSize.height,
    };
    const layoutTransition = dockMorph
        ? MINIMIZE_MORPH_TRANSITION
        : showMinimizedChrome && !isDockDragging
          ? MINIMIZED_DOCK_SLIDE_TRANSITION
          : undefined;
    const leftSectionClass = getLeftSectionClass(windowSurfacePhase);
    const windowAnimationClass =
        windowSurfacePhase === "exiting" ? MOTION.markerWindowExit : windowSurfacePhase === "entering" ? `${MOTION.markerWindowEnter} pointer-events-auto` : "pointer-events-auto";

    const runDockMorph = useCallback(
        (phase: "minimizing" | "restoring", from: DockMorphRect, to: DockMorphRect, onComplete?: () => void) => {
            clearDockMorphTimers();

            if (prefersReducedMotion()) {
                setDockMorph(null);
                onComplete?.();
                return;
            }

            setDockMorph({ phase, ...from });

            dockMorphFrameRef.current = window.requestAnimationFrame(() => {
                dockMorphFrameRef.current = window.requestAnimationFrame(() => {
                    setDockMorph({ phase, ...to });
                    dockMorphTimerRef.current = window.setTimeout(() => {
                        setDockMorph(null);
                        onComplete?.();
                        dockMorphTimerRef.current = null;
                    }, MINIMIZE_MORPH_MS + 40);
                });
            });
        },
        [clearDockMorphTimers],
    );

    const handleSplitPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (event.button !== 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            detachSplitListeners();
            event.currentTarget.setPointerCapture(event.pointerId);

            splitStateRef.current = { startX: event.clientX, startWidth: resolvedSidebarWidth, windowWidth: effectiveSize.width };

            const handlePointerMove = (moveEvent: PointerEvent) => {
                const state = splitStateRef.current;

                if (!state) {
                    return;
                }

                setSidebarWidth(clampSidebarWidth(state.startWidth + (moveEvent.clientX - state.startX), state.windowWidth));
            };

            const handlePointerUp = () => {
                detachSplitListeners();
                splitStateRef.current = null;
            };

            splitListenersRef.current = { move: handlePointerMove, up: handlePointerUp };
            window.addEventListener("pointermove", handlePointerMove, true);
            window.addEventListener("pointerup", handlePointerUp, true);
            window.addEventListener("pointercancel", handlePointerUp, true);
        },
        [detachSplitListeners, effectiveSize.width, resolvedSidebarWidth],
    );

    const handleToggleMinimize = () => {
        if (dockMorph) {
            return;
        }

        const viewportSize = getViewportSize();
        const currentMinimizedWidth = Math.min(MINIMIZED_WINDOW_WIDTH, Math.max(0, viewportSize.width - WINDOW_MARGIN * 2));
        const currentRestoredPosition = isMaximized ? { left: WINDOW_MARGIN, top: WINDOW_MARGIN } : (position ?? seedPosition);
        const currentRestoredSize = isMaximized
            ? {
                  width: Math.max(MIN_WINDOW_WIDTH, viewportSize.width - WINDOW_MARGIN * 2),
                  height: Math.max(MIN_WINDOW_HEIGHT, viewportSize.height - WINDOW_MARGIN * 2),
              }
            : size;

        if (windowMode === "minimized") {
            if (!isOnFeedbackPath) {
                void revealOpenFeedback(report);
            } else {
                focusReplyWindow(report.id);
            }

            const from: DockMorphRect = {
                left: dockPosition.left,
                top: dockPosition.top,
                width: currentMinimizedWidth,
                height: MINIMIZED_WINDOW_HEIGHT,
            };
            const to: DockMorphRect = {
                left: currentRestoredPosition.left,
                top: currentRestoredPosition.top,
                width: currentRestoredSize.width,
                height: currentRestoredSize.height,
            };

            setWindowMode("normal");
            setReplyWindowMinimized(report.id, false);

            if (prefersReducedMotion()) {
                setDockMorph(null);
                return;
            }

            runDockMorph("restoring", from, to);
            return;
        }

        const nextMinimizedIds = minimizedReplyReportIds.includes(report.id) ? minimizedReplyReportIds : [...minimizedReplyReportIds, report.id];
        const nextDockIndex = Math.max(0, nextMinimizedIds.indexOf(report.id));
        const nextDock = resolveMinimizedDockPosition(
            nextDockIndex,
            nextMinimizedIds.length,
            viewportSize.width,
            viewportSize.height,
            currentMinimizedWidth,
            MINIMIZED_WINDOW_HEIGHT,
        );
        const from: DockMorphRect = {
            left: currentRestoredPosition.left,
            top: currentRestoredPosition.top,
            width: currentRestoredSize.width,
            height: currentRestoredSize.height,
        };
        const to: DockMorphRect = {
            left: nextDock.left,
            top: nextDock.top,
            width: currentMinimizedWidth,
            height: MINIMIZED_WINDOW_HEIGHT,
        };

        setReplyWindowMinimized(report.id, true);

        if (prefersReducedMotion()) {
            setWindowMode("minimized");
            setDockMorph(null);
            clearHoverLeaveTimeout();
            setHoveredMarkerId((current) => (current === report.id ? null : current));
            return;
        }

        runDockMorph("minimizing", from, to, () => {
            setWindowMode("minimized");
        });
        clearHoverLeaveTimeout();
        setHoveredMarkerId((current) => (current === report.id ? null : current));
    };

    const handleMinimizedDockPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (event.button !== 0 || dockMorph !== null || windowMode !== "minimized" || minimizedReplyReportIds.length < 2) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            detachDockDragListeners();

            const rect = windowRef.current?.getBoundingClientRect();
            const initial: DockDragState = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                offsetX: rect ? event.clientX - rect.left : minimizedWidth / 2,
                offsetY: rect ? event.clientY - rect.top : MINIMIZED_WINDOW_HEIGHT / 2,
                pointerX: event.clientX,
                pointerY: event.clientY,
                active: false,
            };
            dockDragRef.current = initial;
            setDockDrag(initial);

            const handlePointerMove = (moveEvent: PointerEvent) => {
                const state = dockDragRef.current;

                if (!state || moveEvent.pointerId !== state.pointerId) {
                    return;
                }

                const distance = Math.hypot(moveEvent.clientX - state.startX, moveEvent.clientY - state.startY);
                const nextActive = state.active || distance >= MINIMIZED_DOCK_DRAG_THRESHOLD_PX;

                if (nextActive && !state.active) {
                    suppressDockRestoreClickRef.current = true;
                }

                const next: DockDragState = {
                    ...state,
                    pointerX: moveEvent.clientX,
                    pointerY: moveEvent.clientY,
                    active: nextActive,
                };
                dockDragRef.current = next;
                setDockDrag(next);

                if (!nextActive) {
                    return;
                }

                const ids = minimizedReplyReportIdsRef.current;
                const fromIndex = ids.indexOf(report.id);

                if (fromIndex < 0 || ids.length < 2) {
                    return;
                }

                const viewportWidth = window.innerWidth;
                const itemWidth = Math.min(MINIMIZED_WINDOW_WIDTH, Math.max(0, viewportWidth - WINDOW_MARGIN * 2));
                const centerX = moveEvent.clientX - state.offsetX + itemWidth / 2;
                const toIndex = resolveMinimizedDockIndexFromPointer(centerX, ids.length, viewportWidth, itemWidth);

                if (toIndex !== fromIndex) {
                    reorderMinimizedReplyWindow(report.id, toIndex);
                }
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
                const state = dockDragRef.current;

                if (!state || upEvent.pointerId !== state.pointerId) {
                    return;
                }

                detachDockDragListeners();
                dockDragRef.current = null;
                setDockDrag(null);
            };

            dockDragListenersRef.current = { move: handlePointerMove, up: handlePointerUp };
            window.addEventListener("pointermove", handlePointerMove, true);
            window.addEventListener("pointerup", handlePointerUp, true);
            window.addEventListener("pointercancel", handlePointerUp, true);
        },
        [detachDockDragListeners, dockMorph, minimizedReplyReportIds.length, minimizedWidth, reorderMinimizedReplyWindow, report.id, windowMode],
    );

    const handleMinimizedDockClickCapture = useCallback((event: ReactMouseEvent<HTMLElement>) => {
        if (!suppressDockRestoreClickRef.current) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        suppressDockRestoreClickRef.current = false;
    }, []);

    const handleToggleMaximize = () => {
        if (dockMorph) {
            return;
        }

        if (!isOnFeedbackPath) {
            void revealOpenFeedback(report);
            return;
        }

        if (!isFocused) {
            focusReplyWindow(report.id);
        }

        setWindowMode((current) => (current === "maximized" ? "normal" : "maximized"));
    };

    const handleWindowActivate = () => {
        if (!isOnFeedbackPath) {
            void revealOpenFeedback(report);
            return;
        }

        if (!isFocused) {
            focusReplyWindow(report.id);
        }
    };

    const handleAddCase = () => {
        beginFeedbackEdit(report);
        addDraftCase();
    };

    const handleSidebarDelete = () => {
        if (!isSidebarDeleteConfirming) {
            setIsSidebarDeleteConfirming(true);
            return;
        }

        void handleDelete(report.id).finally(() => setIsSidebarDeleteConfirming(false));
    };

    const leftControls = (
        <>
            <WindowControlButton
                onClick={requestClose}
                ariaLabel={messages.marker.windowCloseAriaLabel}
            >
                <CloseIcon className="h-[15px] w-[15px]" />
            </WindowControlButton>
            <WindowControlButton
                onClick={handleToggleMinimize}
                ariaLabel={isMinimized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMinimizeAriaLabel}
            >
                <MinimizeIcon className="h-[15px] w-[15px]" />
            </WindowControlButton>
            <WindowControlButton
                onClick={handleToggleMaximize}
                ariaLabel={isMaximized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMaximizeAriaLabel}
            >
                {isMaximized ? <RestoreIcon className="h-[15px] w-[15px]" /> : <MaximizeIcon className="h-[15px] w-[15px]" />}
            </WindowControlButton>
        </>
    );

    const sidebarToggleButton = (
        <WindowControlButton
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            ariaLabel={isSidebarCollapsed ? messages.marker.sidebarExpandAriaLabel : messages.marker.sidebarCollapseAriaLabel}
            className={isSidebarCollapsed ? "" : "text-[var(--adaptive-blue500)]"}
        >
            <SidePanelIcon className="h-[16px] w-[16px]" />
        </WindowControlButton>
    );

    const shareButton = (
        <MarkerWindowShareButton
            report={report}
            messages={messages}
        />
    );

    const deleteButton = canDeleteFeedback(report, sessionActor) ? (
        <FeedbackDeleteAction
            reportId={report.id}
            onDelete={handleDelete}
            disabled={isDeleting}
            messages={messages}
            className={`${HEADER_BUTTON_CLASS} disabled:opacity-50`}
            iconClassName="h-[15px] w-[15px]"
        />
    ) : null;

    const editButton = canEditReportCases(report) ? (
        <HoverTooltip label={messages.feedbackList.editTitle}>
            <button
                type="button"
                data-fivepixels-interactive=""
                className={HEADER_BUTTON_CLASS}
                aria-label={messages.feedbackList.editAriaLabel}
                title={messages.feedbackList.editTitle}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => beginFeedbackEdit(report)}
            >
                <EditIcon className="h-[14px] w-[14px]" />
            </button>
        </HoverTooltip>
    ) : null;

    const expandedSidebarActions = (
        <nav
            aria-label={messages.marker.sidebarActionsAriaLabel}
            className="shrink-0 px-[6px] pb-[10px] pt-[2px]"
        >
            {canEditReportCases(report) ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={handleAddCase}
                    className={SIDEBAR_ACTION_CLASS}
                >
                    <span
                        aria-hidden
                        className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center text-[18px] font-normal"
                    >
                        +
                    </span>
                    <span>{messages.marker.newCaseAction}</span>
                </button>
            ) : null}

            <MarkerWindowShareButton
                report={report}
                messages={messages}
                expanded
            />
        </nav>
    );

    const expandedSidebarDelete = canDeleteFeedback(report, sessionActor) ? (
        <div className="mt-auto shrink-0 border-t border-[var(--adaptive-border-subtle)] p-[6px]">
            <button
                type="button"
                data-fivepixels-interactive=""
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleSidebarDelete}
                disabled={isDeleting}
                aria-label={isSidebarDeleteConfirming ? messages.feedbackList.deleteConfirmAriaLabel : messages.feedbackList.deleteAriaLabel}
                className={`${SIDEBAR_ACTION_CLASS} text-rose-500 hover:text-rose-600 disabled:opacity-50`}
            >
                <TrashIcon className="h-[15px] w-[15px] shrink-0" />
                <span>{isSidebarDeleteConfirming ? messages.feedbackList.deleteConfirmTitle : messages.feedbackList.deleteTitle}</span>
            </button>
        </div>
    ) : null;

    const unfocusedBody = (
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-[var(--adaptive-black50)]">
            <UnfocusedCaseSummary
                caseTexts={caseTexts}
                emptyLabel={messages.cases.selectToView}
                navigateHint={isOnFeedbackPath ? undefined : messages.marker.offscreenNavigateHint}
            />
        </div>
    );

    const rightSection = (
        <div className="flex min-w-0 flex-1 flex-col bg-[var(--adaptive-black50)]">
            <header
                onPointerDown={handleDragHandlePointerDown}
                className="shrink-0 cursor-move touch-none select-none border-b border-[var(--adaptive-border-subtle)] px-[16px] py-[8px]"
            >
                {focusedCase ? (
                    <Fragment>
                        <p
                            className="truncate text-[15px] font-semibold leading-[1.4] text-[var(--adaptive-black900)]"
                            title={mentionMessageToPlainText(focusedCase.text, focusedCase.mentions)}
                        >
                            {mentionMessageToPlainText(focusedCase.text, focusedCase.mentions)}
                        </p>
                        <div className="mt-[2px] flex min-w-0 items-center justify-between gap-[8px]">
                            <div className="flex min-w-0 flex-1 items-center gap-[6px]">
                                {focusedCase.status === "resolved" ? (
                                    <>
                                        <CheckCircleIcon
                                            className="h-[14px] w-[14px] shrink-0"
                                            fill={RESOLVED_STATUS_COLOR}
                                        />
                                        <p
                                            className="min-w-0 truncate text-[12px] font-semibold leading-[1.4]"
                                            style={{ color: RESOLVED_STATUS_COLOR }}
                                        >
                                            {messages.thread.issueResolvedDivider}
                                        </p>
                                    </>
                                ) : showAssigneeAssigned ? (
                                    <>
                                        <ProcessingDots />
                                        <Text.Shimmer
                                            className="min-w-0 truncate text-[12px] leading-[1.4]"
                                            color={{
                                                start: "var(--adaptive-black900)",
                                                end: "var(--adaptive-blue400)",
                                            }}
                                            duration={5}
                                        >
                                            {messages.marker.assigneeAssigned}
                                        </Text.Shimmer>
                                    </>
                                ) : (
                                    <p className="min-w-0 truncate text-[12px] leading-[1.4] text-[var(--adaptive-black500)]">{messages.marker.assigneeUnassigned}</p>
                                )}
                            </div>
                            <div className="flex min-w-0 shrink-0 items-center gap-[8px]">
                                <FeedbackFieldTags tags={fieldTags} />
                                {showAssigneeAssigned && focusedCase ? (
                                    <CaseAssigneeInfo
                                        caseItem={focusedCase}
                                        authors={authors}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </Fragment>
                ) : (
                    <p className="text-[13px] text-[var(--adaptive-black500)]">{messages.cases.selectToView}</p>
                )}
            </header>

            <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-hidden">
                    <FeedbackThread
                        report={report}
                        authors={authors}
                        pendingComposer={pendingComposer}
                        confirmAuthorName={confirmAuthorName}
                        showConfirmAuthorSelect={showConfirmAuthorSelect}
                        onConfirmAuthorNameChange={setConfirmAuthorName}
                        onToggleConfirmAuthorSelect={toggleConfirmAuthorSelect}
                        onStartDeny={startDenyReview}
                        onStartCheckout={startCheckoutReview}
                        onStartAskQuestion={startAskQuestion}
                        onClaimAssignee={() => void handleClaimAssignee()}
                        onTransferAssignee={() => void handleTransferAssignee()}
                        onConfirm={() => void handleConfirmResolution()}
                        isUpdating={isUpdating}
                        isClaimingAssignee={isClaimingAssignee}
                        hideCaseSelector
                    />
                </div>

                {showComposer ? (
                    <section className="shrink-0 overflow-visible border-t border-[var(--adaptive-border-subtle)]">
                        <FeedbackComposer
                            message={replyDraft}
                            onMessageChange={(value) => {
                                setReplyDraft(value);

                                if (errorMessage) {
                                    setErrorMessage("");
                                }
                            }}
                            mentions={replyMentions}
                            onMentionsChange={setReplyMentions}
                            enableElementMentions
                            authorName={replyAuthorName}
                            onAuthorNameChange={setReplyAuthorName}
                            authors={authors}
                            fields={fields}
                            fieldValues={report.field_values}
                            onFieldChange={() => undefined}
                            showTags={false}
                            hideAuthorSelector
                            onSubmit={() => void handleReplySubmit()}
                            isSubmitting={isSubmittingReply || isUpdating}
                            autoFocus={pendingComposer !== null}
                            askQuestionForced={isCreatorQuestionComposer}
                            composerMode={pendingComposer?.type ?? null}
                            onCancelComposerMode={cancelPendingComposer}
                            replyTargetPreview={replyTargetPreview}
                            errorMessage={errorMessage}
                        />
                    </section>
                ) : null}
            </div>
        </div>
    );

    return (
        <>
            {isResizing ? <CornerResizeGhost ghostRef={ghostRef} /> : null}

            <div
                ref={bindWindowRef}
                data-fivepixels-interactive=""
                data-marker-feedback-window={report.id}
                data-marker-window-focused={showFullContent ? "true" : "false"}
                onPointerDown={handleWindowActivate}
                onClick={(event) => event.stopPropagation()}
                onAnimationEnd={handleWindowAnimationEnd}
                className={`fixed rounded-[16px] ${showMinimizedChrome && dockMorph === null && !isDockDragging ? "" : "overflow-hidden"} ${
                    isDockDragging ? "z-[1000003]" : showFullContent ? "z-[1000002]" : "z-[1000001]"
                } ${windowAnimationClass}`}
                style={{
                    left: displayRect.left,
                    top: displayRect.top,
                    width: displayRect.width,
                    height: displayRect.height,
                    ...(layoutTransition ? { transition: layoutTransition } : null),
                    ...(isDockDragging ? { cursor: "grabbing", transform: "scale(1.03)", willChange: "left, top, transform" } : null),
                }}
            >
                {showMinimizedChrome ? (
                    <div
                        className={`group/min-dock relative h-full w-full ${minimizedReplyReportIds.length > 1 ? "cursor-grab" : ""} ${isDockDragging ? "cursor-grabbing" : ""}`}
                        onPointerDown={handleMinimizedDockPointerDown}
                        onClickCapture={handleMinimizedDockClickCapture}
                    >
                        <div
                            ref={surfaceRef}
                            className={`flex h-full w-full overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)] ${leftSectionClass}`}
                        >
                            <div className="flex w-full flex-col justify-center gap-[2px] overflow-hidden px-[12px] py-[6px]">
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    onClick={handleToggleMinimize}
                                    disabled={dockMorph !== null}
                                    aria-label={`${messages.marker.windowRestoreAriaLabel}. ${report.pathname}. ${minimizedCaseTexts.map((text, index) => `${index + 1}. ${text}`).join(", ")}`}
                                    title={messages.marker.windowRestoreAriaLabel}
                                    className="flex min-w-0 items-center gap-[4px] text-left"
                                >
                                    <p className="shrink-0 rounded-[4px] bg-[var(--adaptive-tintOpacity300)] px-[2px] py-[2px] text-[10px]">Route</p>
                                    <p className="min-w-0 truncate text-[10px] font-semibold leading-none text-[var(--adaptive-accent-coral)]">{report.pathname}</p>
                                </button>

                                <MinimizedWindowAliasRow
                                    projectId={projectId}
                                    reportId={report.id}
                                    caseTexts={minimizedCaseTexts}
                                    messages={messages}
                                    onRestore={handleToggleMinimize}
                                    restoreDisabled={dockMorph !== null}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            aria-label={messages.marker.windowCloseAriaLabel}
                            title={messages.marker.windowCloseAriaLabel}
                            disabled={dockMorph !== null || windowSurfacePhase === "exiting" || isDockDragging}
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                                event.stopPropagation();
                                requestClose();
                            }}
                            className={`absolute right-[6px] top-[6px] z-[2] inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] text-[var(--adaptive-black700)] shadow-[var(--adaptive-popup-shadow)] transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--adaptive-black200)] hover:text-[var(--adaptive-black900)] ${
                                dockMorph !== null || isDockDragging
                                    ? "pointer-events-none scale-90 opacity-0"
                                    : "pointer-events-none scale-90 opacity-0 group-hover/min-dock:pointer-events-auto group-hover/min-dock:scale-100 group-hover/min-dock:opacity-100"
                            }`}
                        >
                            <CloseIcon className="h-[12px] w-[12px]" />
                        </button>
                    </div>
                ) : (
                    <div
                        ref={surfaceRef}
                        className="flex h-full w-full flex-row overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)]"
                    >
                        {showFullContent ? (
                            <>
                                {isSidebarCollapsed ? (
                                    <div
                                        onPointerDown={handleDragHandlePointerDown}
                                        className={`flex shrink-0 cursor-move touch-none select-none flex-col items-center gap-[2px] py-[8px] ${leftSectionClass}`}
                                        style={{ width: COLLAPSED_SIDEBAR_WIDTH }}
                                    >
                                        {leftControls}
                                        {shareButton}
                                        {editButton}
                                        {deleteButton}
                                        {sidebarToggleButton}
                                    </div>
                                ) : (
                                    <div
                                        className={`flex shrink-0 flex-col overflow-hidden ${leftSectionClass}`}
                                        style={{ width: resolvedSidebarWidth }}
                                    >
                                        <header
                                            onPointerDown={handleDragHandlePointerDown}
                                            className="flex shrink-0 cursor-move touch-none select-none items-center justify-between gap-[8px] px-[10px] py-[8px]"
                                        >
                                            <div className="flex items-center gap-[2px]">{leftControls}</div>
                                            <div className="flex items-center gap-[2px]">{sidebarToggleButton}</div>
                                        </header>

                                        {expandedSidebarActions}

                                        <MarkerCaseSidebar
                                            report={report}
                                            focusedCaseId={focusedCaseId}
                                            onSelectCase={selectCase}
                                        />

                                        {expandedSidebarDelete}
                                    </div>
                                )}

                                {isSidebarCollapsed ? null : (
                                    <div
                                        role="separator"
                                        aria-orientation="vertical"
                                        onPointerDown={handleSplitPointerDown}
                                        className="group relative w-[3px] shrink-0 cursor-col-resize touch-none self-stretch bg-[var(--adaptive-black50)] transition-colors group-hover:bg-[var(--adaptive-blue500)]"
                                    >
                                        <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 touch-none bg-[var(--adaptive-border-subtle)] transition-colors group-hover:bg-[var(--adaptive-blue500)]" />
                                    </div>
                                )}

                                {rightSection}
                            </>
                        ) : (
                            <>
                                <div
                                    onPointerDown={handleDragHandlePointerDown}
                                    className={`flex shrink-0 cursor-move touch-none select-none flex-col items-center gap-[2px] py-[8px] ${leftSectionClass}`}
                                    style={{ width: COLLAPSED_SIDEBAR_WIDTH }}
                                >
                                    {leftControls}
                                </div>
                                {unfocusedBody}
                            </>
                        )}

                        {windowMode === "normal" && dockMorph === null ? (
                            <CornerResizeHandle
                                corner="bottom-right"
                                ariaLabel={messages.marker.resizeAriaLabel}
                                onPointerDown={handleResizePointerDown}
                            />
                        ) : null}
                    </div>
                )}
            </div>
        </>
    );
}
