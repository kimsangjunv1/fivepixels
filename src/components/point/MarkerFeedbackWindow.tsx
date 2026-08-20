import { useCallback, useEffect, useMemo, useRef, useState, type AnimationEvent as ReactAnimationEvent, type PointerEvent as ReactPointerEvent, type ReactNode, Fragment } from "react";
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
import { createPinnedFeedbackItem, isFeedbackPinned } from "@/utils/pinned/pinnedFeedback.js";
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

type WindowMode = "normal" | "minimized" | "maximized";
type WindowSurfacePhase = "entering" | "idle" | "exiting";

const WINDOW_MARGIN = 16;
const DEFAULT_WINDOW_SIZE: BoxSize = { width: 600, height: 460 };
const MIN_WINDOW_WIDTH = 420;
const MIN_WINDOW_HEIGHT = 280;
const DEFAULT_SIDEBAR_WIDTH = 208;
const RESOLVED_STATUS_COLOR = ACCENT_COLOR.green;
const SIDEBAR_MIN_WIDTH = 150;
const RIGHT_MIN_WIDTH = 280;
const COLLAPSED_SIDEBAR_WIDTH = 46;
const MINIMIZED_WINDOW_HEIGHT = 42;
const MINIMIZED_WINDOW_WIDTH = 256;
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

function MarkerPinIcon({ pinned, className }: { pinned: boolean; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
            className={className}
            aria-hidden
        >
            <path
                d={
                    pinned
                        ? "M640-760v280l68 68q6 6 9 13.5t3 15.5v23q0 17-11.5 28.5T680-320H520v234q0 17-11.5 28.5T480-46q-17 0-28.5-11.5T440-86v-234H280q-17 0-28.5-11.5T240-360v-23q0-8 3-15.5t9-13.5l68-68v-280q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760ZM354-400h252l-46-46v-314H400v314l-46 46Zm126 0Z"
                        : "M560-760H400v87L290-783q-5-5-7.5-11t-2.5-12q0-13 9-23.5t24-10.5h327q17 0 28.5 11.5T680-800q0 16-14.5 22.5T640-760v240q0 17-11.5 28.5T600-480q-17 0-28.5-11.5T560-520v-240ZM440-80v-240H296q-25 0-40-17.5T241-377q0-11 4.5-22t14.5-21l60-60v-46L84-764q-11-11-11.5-27.5T84-820q11-11 28-11t28 11l679 679q12 12 11.5 28.5T818-84q-12 11-28 11.5T762-84L526-320h-6v240q0 17-11.5 28.5T480-40q-17 0-28.5-11.5T440-80Zm-86-320h92l-44-44-2-2-46 46Zm126-193Zm-78 149Z"
                }
            />
        </svg>
    );
}

function MinimizedCaseMarquee({ caseTexts }: { caseTexts: string[] }) {
    if (caseTexts.length === 0) {
        return null;
    }

    return (
        <div
            className="min-w-0 flex-1 overflow-hidden text-[12px] text-[var(--adaptive-black700)]"
        >
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
};

export function MarkerFeedbackWindow({ report, anchor }: MarkerFeedbackWindowProps) {
    const {
        messages,
        fields,
        authors,
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
        closeReplyComposer,
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
        pinnedFeedbackItems,
        togglePinnedFeedback,
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
        enabled: windowMode !== "maximized",
        windowRef,
    });

    const { isResizing, ghostRef, handleResizePointerDown } = useGhostCornerResize({
        enabled: windowMode === "normal",
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
        setHoveredMarkerId(null);
        closeReplyComposer();
    }, [clearHoverLeaveTimeout, closeReplyComposer, setHoveredMarkerId]);

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

    useEffect(() => {
        if (!focusedCaseId) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (closeRequestedRef.current) {
                return;
            }

            const path = event.composedPath();

            if (windowRef.current && path.includes(windowRef.current)) {
                return;
            }

            const clickedMarker = path.find((node) => node instanceof Element && node.hasAttribute("data-marker-report-id"));

            if (clickedMarker instanceof Element) {
                return;
            }

            requestClose();
        };

        window.addEventListener("pointerdown", handlePointerDown);

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [focusedCaseId, requestClose]);

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

    useEffect(() => {
        if (!isSidebarDeleteConfirming) {
            return;
        }

        const timer = window.setTimeout(() => setIsSidebarDeleteConfirming(false), 1500);

        return () => window.clearTimeout(timer);
    }, [isSidebarDeleteConfirming]);

    const isCreatorQuestionComposer = pendingComposer?.type === "question";

    const showComposer = useMemo(() => {
        if (!focusedCaseId) {
            return false;
        }

        return shouldShowCaseReplyComposer(report, focusedCaseId, pendingComposer);
    }, [focusedCaseId, pendingComposer, report]);

    const replyTargetPreview = useMemo(() => {
        if (pendingComposer?.type !== "question") {
            return null;
        }

        return resolvePendingComposerTargetPreview(report, focusedCaseId, pendingComposer);
    }, [focusedCaseId, pendingComposer, report]);

    const focusedCase = focusedCaseId ? getCaseById(report, focusedCaseId) : undefined;
    const focusedCaseAssigneeName = focusedCaseId ? getCaseAssigneeName(report, focusedCaseId) : null;
    const showAssigneeAssigned = Boolean(focusedCaseAssigneeName) || isClaimingAssignee;
    const fieldTags = useMemo(() => getFieldTags(fields, report.field_values), [fields, report.field_values]);
    const minimizedCaseTexts = useMemo(
        () =>
            getReportCases(report)
                .slice(0, 5)
                .map((caseItem) => mentionMessageToPlainText(caseItem.text, caseItem.mentions).trim())
                .filter(Boolean),
        [report],
    );

    const viewport = getViewportSize();
    const maximizedSize: BoxSize = {
        width: Math.max(MIN_WINDOW_WIDTH, viewport.width - WINDOW_MARGIN * 2),
        height: Math.max(MIN_WINDOW_HEIGHT, viewport.height - WINDOW_MARGIN * 2),
    };

    const isMinimized = windowMode === "minimized";
    const isMaximized = windowMode === "maximized";
    const effectiveSize = isMaximized ? maximizedSize : size;
    const minimizedWidth = Math.min(MINIMIZED_WINDOW_WIDTH, Math.max(0, viewport.width - WINDOW_MARGIN * 2));
    const resolvedSidebarWidth = clampSidebarWidth(sidebarWidth, effectiveSize.width);

    const initialPosition = useMemo(
        () => clampWindowPosition(anchor.left + getMarkerDotSize() / 2 - size.width / 2, anchor.top + getMarkerDotSize() / 2 - size.height / 2, size.width, size.height),
        [anchor.left, anchor.top, size.height, size.width],
    );

    const resolvedPosition = isMinimized
        ? {
              left: Math.round((viewport.width - minimizedWidth) / 2),
              top: Math.max(WINDOW_MARGIN, viewport.height - WINDOW_MARGIN - MINIMIZED_WINDOW_HEIGHT),
          }
        : isMaximized
          ? { left: WINDOW_MARGIN, top: WINDOW_MARGIN }
          : (position ?? initialPosition);
    const leftSectionClass = getLeftSectionClass(windowSurfacePhase);
    const windowAnimationClass =
        windowSurfacePhase === "exiting" ? MOTION.markerWindowExit : windowSurfacePhase === "entering" ? `${MOTION.markerWindowEnter} pointer-events-auto` : "pointer-events-auto";

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
        setWindowMode((current) => (current === "minimized" ? "normal" : "minimized"));
    };

    const handleToggleMaximize = () => {
        setWindowMode((current) => (current === "maximized" ? "normal" : "maximized"));
    };

    const handleAddCase = () => {
        beginFeedbackEdit(report);
        addDraftCase();
    };

    const isPinned = isFeedbackPinned(pinnedFeedbackItems, report.id);
    const handleTogglePin = () => {
        togglePinnedFeedback(
            createPinnedFeedbackItem(report, {
                caseId: focusedCaseId,
                summaryMore: messages.cases.summaryMore,
            }),
        );
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

    const pinButton = (
        <WindowControlButton
            onClick={handleTogglePin}
            ariaLabel={isPinned ? messages.pins.unpinAriaLabel : messages.pins.pinAriaLabel}
            className={isPinned ? "text-[var(--adaptive-blue500)]" : ""}
        >
            <MarkerPinIcon
                pinned={isPinned}
                className="h-[15px] w-[15px]"
            />
        </WindowControlButton>
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

            <button
                type="button"
                data-fivepixels-interactive=""
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleTogglePin}
                aria-pressed={isPinned}
                className={`${SIDEBAR_ACTION_CLASS} ${isPinned ? "text-[var(--adaptive-blue500)]" : ""}`}
            >
                <MarkerPinIcon
                    pinned={isPinned}
                    className="h-[15px] w-[15px] shrink-0"
                />
                <span>{isPinned ? messages.marker.unpinAction : messages.marker.pinAction}</span>
            </button>
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
                onClick={(event) => event.stopPropagation()}
                onAnimationEnd={handleWindowAnimationEnd}
                className={`fixed z-[1000001] ${windowAnimationClass}`}
                style={{
                    left: resolvedPosition.left,
                    top: resolvedPosition.top,
                    width: isMinimized ? minimizedWidth : effectiveSize.width,
                    ...(isMinimized ? null : { height: effectiveSize.height }),
                }}
            >
                {isMinimized ? (
                    <div
                        ref={surfaceRef}
                        className={`overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)] ${leftSectionClass}`}
                    >
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={handleToggleMinimize}
                            aria-label={`${messages.marker.windowRestoreAriaLabel}. ${minimizedCaseTexts.map((text, index) => `${index + 1}. ${text}`).join(", ")}`}
                            title={messages.marker.windowRestoreAriaLabel}
                            className="flex min-h-[40px] w-full items-center overflow-hidden px-[12px] text-left"
                        >
                            <MinimizedCaseMarquee caseTexts={minimizedCaseTexts} />
                        </button>
                    </div>
                ) : (
                    <div
                        ref={surfaceRef}
                        className="flex h-full w-full flex-row overflow-hidden rounded-[16px] shadow-[var(--adaptive-popup-shadow)] border border-[var(--adaptive-border-subtle)]"
                    >
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
                                {pinButton}
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
                                className="group relative w-[3px] shrink-0 cursor-col-resize touch-none self-stretch bg-[var(--adaptive-black50)] group-hover:bg-[var(--adaptive-blue500)] transition-colors"
                            >
                                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--adaptive-border-subtle)] transition-colors group-hover:bg-[var(--adaptive-blue500)] touch-none pointer-events-none" />
                            </div>
                        )}

                        {rightSection}

                        {windowMode === "normal" ? (
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
