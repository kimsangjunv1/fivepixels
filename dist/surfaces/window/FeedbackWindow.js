import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState, Fragment, } from "react";
import { getMarkerDotSize } from "../../shared/utils/marker/markerRuntime.js";
import { useDraggableWindow, clampWindowPosition } from "../../shared/hooks/useDraggableWindow.js";
import { useGhostCornerResize } from "../../shared/hooks/useGhostCornerResize.js";
import { useNativeHover } from "../../shared/hooks/useNativeHover.js";
import { useOverlayMinimizedDock } from "../../shared/hooks/useOverlayMinimizedDock.js";
import { useMinimizedDockDragReorder } from "../../shared/hooks/useMinimizedDockDragReorder.js";
import { useReportData, useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { resolvePendingComposerTargetPreview, shouldShowCaseReplyComposer } from "../../shared/utils/feedback/feedbackThread.js";
import { getCaseAssigneeName, getCaseById, getReportCases } from "../../shared/utils/report/reportCases.js";
import { getFieldTags } from "../../shared/utils/report/fields.js";
import { copyTextToClipboard } from "../../shared/utils/feedback/feedbackDataTransfer.js";
import { buildAiPromptLabels, formatFeedbackForAiPrompt } from "../../shared/utils/feedback/formatFeedbackForAiPrompt.js";
import { buildFeedbackShareUrl } from "../../shared/utils/feedback/feedbackDeepLink.js";
import { AskAiCopyDropdown } from "../../surfaces/feedback/AskAiCopyDropdown.js";
import { WindowModeControls } from "../../surfaces/window/WindowModeControls.js";
import { MinimizedDockWindowChrome } from "../../surfaces/window/MinimizedDockWindowChrome.js";
import { MinimizedWindowAliasRow } from "../../surfaces/window/MinimizedWindowAliasRow.js";
import { CheckCircleIcon, ChevronDownIcon, EditIcon, LinkIcon, SidePanelIcon, TrashIcon, AskAiIcon } from "../../shared/components/icons/Icons.js";
import { FeedbackFieldTags } from "../../surfaces/feedback/FeedbackFieldTags.js";
import { FeedbackDeleteAction } from "../../surfaces/feedback/FeedbackDeleteAction.js";
import { canDeleteFeedback } from "../../shared/utils/feedback/feedbackPermissions.js";
import { canEditReportCases } from "../../shared/utils/report/reportCases.js";
import { mentionMessageToPlainText } from "../../shared/utils/mention/elementMentions.js";
import { HoverTooltip } from "../../surfaces/tooltip/HoverTooltip.js";
import { useIntegrationLock } from "../../shared/components/ui/IntegrationLock.js";
import { CornerResizeGhost } from "../../surfaces/window/CornerResizeGhost.js";
import { WindowResizeHandles } from "../../surfaces/window/WindowResizeHandles.js";
import { MOTION } from "../../shared/constants/motionClasses.js";
import { ACCENT_COLOR } from "../../shared/constants/accentColors.js";
import { FeedbackComposer } from "../../surfaces/feedback/FeedbackComposer.js";
import { CaseAssigneeInfo } from "../../surfaces/feedback/CaseAssigneeInfo.js";
import { FeedbackThread } from "../../surfaces/feedback/FeedbackThread.js";
import { MarkerCaseSidebar } from "./MarkerCaseSidebar.js";
import { ProcessingDots } from "../../shared/components/ui/ProcessingDots.js";
import { Text } from "../../shared/components/ui/Text/index.js";
import { MARKER_MINIMIZED_WINDOW_HEIGHT, MARKER_MINIMIZED_WINDOW_WIDTH, MARKER_WINDOW_MARGIN, } from "../../shared/utils/marker/markerWindowDock.js";
import { getMarkerDockWindowId, registerOverlayMinimizedDock, unregisterOverlayMinimizedDock, } from "../../shared/utils/overlay/overlayMinimizedDockRegistry.js";
const WINDOW_MARGIN = MARKER_WINDOW_MARGIN;
const DEFAULT_WINDOW_SIZE = { width: 600, height: 460 };
const MIN_WINDOW_WIDTH = 420;
const MIN_WINDOW_HEIGHT = 280;
const DEFAULT_SIDEBAR_WIDTH = 208;
const RESOLVED_STATUS_COLOR = ACCENT_COLOR.green;
const SIDEBAR_MIN_WIDTH = 150;
const RIGHT_MIN_WIDTH = 280;
const COLLAPSED_SIDEBAR_WIDTH = 46;
const MINIMIZED_WINDOW_HEIGHT = MARKER_MINIMIZED_WINDOW_HEIGHT;
const MINIMIZED_WINDOW_WIDTH = MARKER_MINIMIZED_WINDOW_WIDTH;
const WINDOW_CLOSE_ANIMATION_MS = 220;
const LEFT_SECTION_TRANSITION = "transition-[background-color,backdrop-filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]";
const LEFT_SECTION_FLAT_CLASS = `${LEFT_SECTION_TRANSITION} bg-[var(--adaptive-black50)]`;
const LEFT_SECTION_BLUR_CLASS = `${LEFT_SECTION_TRANSITION} bg-[var(--adaptive-neutralTintOpacity900)] backdrop-blur-[20px] shadow-[inset_0_20px_0_20px_var(--adaptive-black500)]]`;
function getLeftSectionClass(phase) {
    return phase === "idle" ? LEFT_SECTION_BLUR_CLASS : LEFT_SECTION_FLAT_CLASS;
}
const HEADER_BUTTON_CLASS = "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
const SIDEBAR_ACTION_CLASS = "flex h-[32px] w-full items-center gap-[8px] rounded-[8px] px-[8px] text-left text-[13px] font-semibold text-[var(--adaptive-black700)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
function getViewportSize() {
    if (typeof window === "undefined") {
        return { width: DEFAULT_WINDOW_SIZE.width, height: DEFAULT_WINDOW_SIZE.height };
    }
    return { width: window.innerWidth, height: window.innerHeight };
}
function clampMarkerWindowSize(width, height) {
    const viewport = getViewportSize();
    const maxWidth = Math.max(MIN_WINDOW_WIDTH, viewport.width - WINDOW_MARGIN * 2);
    const maxHeight = Math.max(MIN_WINDOW_HEIGHT, viewport.height - WINDOW_MARGIN * 2);
    return {
        width: Math.min(Math.max(width, MIN_WINDOW_WIDTH), maxWidth),
        height: Math.min(Math.max(height, MIN_WINDOW_HEIGHT), maxHeight),
    };
}
function clampSidebarWidth(width, windowWidth) {
    const maxWidth = Math.max(SIDEBAR_MIN_WIDTH, windowWidth - RIGHT_MIN_WIDTH);
    return Math.min(Math.max(width, SIDEBAR_MIN_WIDTH), maxWidth);
}
function WindowControlButton({ onClick, ariaLabel, title, className = "", children }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: onClick, "aria-label": ariaLabel, title: title, className: `${HEADER_BUTTON_CLASS} ${className}`, children: children }));
}
function UnfocusedCaseSummary({ caseTexts, emptyLabel, navigateHint }) {
    return (_jsxs("div", { className: "flex max-h-full w-full max-w-[440px] flex-col items-center gap-[12px] overflow-hidden px-[28px]", children: [navigateHint ? _jsx("p", { className: "text-center text-[12px] font-medium leading-[1.4] text-[var(--adaptive-blue500)]", children: navigateHint }) : null, caseTexts.length === 0 ? (_jsx("p", { className: "text-center text-[13px] text-[var(--adaptive-black500)]", children: emptyLabel })) : (_jsx("ul", { className: "flex w-full flex-col gap-[8px] overflow-hidden", children: caseTexts.map((text, index) => (_jsxs("li", { className: "truncate text-center text-[13px] leading-[1.4] text-[var(--adaptive-black800)]", title: text, children: [_jsxs("span", { className: "mr-[6px] text-[var(--adaptive-black500)]", children: [index + 1, "."] }), text] }, `${index}-${text.slice(0, 24)}`))) }))] }));
}
function MarkerWindowShareButton({ report, messages, expanded = false }) {
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
    return expanded ? (_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: handleCopy, "aria-label": messages.marker.shareLinkAriaLabel, className: SIDEBAR_ACTION_CLASS, children: [_jsx(LinkIcon, { className: "h-[15px] w-[15px] shrink-0" }), _jsx("span", { children: copied ? messages.marker.shareLinkCopiedTitle : messages.marker.shareAction })] })) : (_jsx(WindowControlButton, { onClick: handleCopy, ariaLabel: messages.marker.shareLinkAriaLabel, title: copied ? messages.marker.shareLinkCopiedTitle : messages.marker.shareLinkTitle, children: _jsx(LinkIcon, { className: "h-[15px] w-[15px]" }) }));
}
function MarkerWindowAskAiButton({ report, fields, messages, focusedCaseId, expanded = false, }) {
    const copyPrompt = (options) => {
        const text = formatFeedbackForAiPrompt(report, fields, options, buildAiPromptLabels(messages));
        if (!text) {
            return Promise.reject(new Error("empty prompt"));
        }
        return copyTextToClipboard(text);
    };
    return (_jsx(AskAiCopyDropdown, { menuClassName: "min-w-[168px]", align: "right", items: [
            {
                id: "full-review",
                label: messages.marker.askAi.fullReview,
                onSelect: () => copyPrompt({ intent: "review", scope: "full" }),
            },
            {
                id: "full-modification",
                label: messages.marker.askAi.fullModification,
                onSelect: () => copyPrompt({ intent: "modification", scope: "full" }),
            },
            {
                id: "selected-case-review",
                label: messages.marker.askAi.selectedCaseReview,
                disabled: !focusedCaseId,
                onSelect: () => copyPrompt({ intent: "review", scope: "selectedCase", caseId: focusedCaseId ?? undefined }),
            },
        ], trigger: ({ open, copied, toggle }) => expanded ? (_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: toggle, "aria-expanded": open, "aria-haspopup": "menu", "aria-label": messages.marker.askAi.menuAriaLabel, className: SIDEBAR_ACTION_CLASS, children: [_jsx(AskAiIcon, { className: "h-[15px] w-[15px] shrink-0" }), _jsx("span", { className: "min-w-0 flex-1 truncate", children: copied ? messages.marker.askAi.copied : messages.marker.askAi.title }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 transition-transform ${open ? "rotate-180" : ""}` })] })) : (_jsx(WindowControlButton, { onClick: toggle, ariaLabel: messages.marker.askAi.ariaLabel, title: copied ? messages.marker.askAi.copied : messages.marker.askAi.title, className: open ? "text-[var(--adaptive-blue500)]" : "", children: _jsx(AskAiIcon, { className: "h-[15px] w-[15px]" }) })) }));
}
export function FeedbackWindow({ report, anchor, isFocused, embedded = false }) {
    const { messages, fields, authors, projectId } = useReportPreferences();
    const { currentPathname, pendingComposer, replyDraft, replyMentions, replyUserMentions, replyAuthorName, confirmAuthorName, showConfirmAuthorSelect, errorMessage, setErrorMessage, focusedCaseId, selectCase, closeReplyWindow, focusReplyWindow, revealOpenFeedback, minimizedReplyReportIds, setReplyWindowMinimized, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, setReplyMentions, setReplyUserMentions, setReplyAuthorName, setConfirmAuthorName, toggleConfirmAuthorSelect, startDenyReview, startCheckoutReview, startAskQuestion, sessionActor, cancelPendingComposer, beginFeedbackEdit, beginComposeNewCase, isComposingNewCase, hasNewCaseDraftSession, } = useReportSession();
    const { isUpdating, isSubmittingReply, isClaimingAssignee, handleReplySubmit, handleClaimAssignee, handleTransferAssignee, handleConfirmResolution, handleDelete, isDeleting, } = useReportData();
    const deleteLock = useIntegrationLock("deleteFeedback");
    const windowRef = useRef(null);
    const surfaceRef = useRef(null);
    const closeRequestedRef = useRef(false);
    const closeFinishedRef = useRef(false);
    const [windowMode, setWindowMode] = useState("normal");
    const [windowSurfacePhase, setWindowSurfacePhase] = useState("entering");
    const markerDockId = getMarkerDockWindowId(report.id);
    const overlayDock = useOverlayMinimizedDock({
        windowId: markerDockId,
        enabled: !embedded,
        isMinimized: windowMode === "minimized",
        onMinimizedChange: (minimized) => setWindowMode(minimized ? "minimized" : "normal"),
    });
    const dockMorph = overlayDock.dockMorph;
    const dockDrag = useMinimizedDockDragReorder({
        windowId: markerDockId,
        windowRef,
        enabled: windowMode === "minimized" && overlayDock.dockCount >= 2,
        blockDrag: dockMorph !== null,
        minimizedWidth: overlayDock.minimizedWidth,
        dockPosition: overlayDock.dockPosition,
        dockRegion: overlayDock.dockRegion,
    });
    const isDockDragging = dockDrag.isDockDragging;
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [size, setSize] = useState(DEFAULT_WINDOW_SIZE);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const [isSidebarDeleteConfirming, setIsSidebarDeleteConfirming] = useState(false);
    const splitStateRef = useRef(null);
    const splitListenersRef = useRef(null);
    const hoverRef = useNativeHover({
        onEnter: () => {
            clearHoverLeaveTimeout();
            setHoveredMarkerId(report.id);
        },
        onLeave: () => {
            scheduleHoverLeave(report.id);
        },
    });
    const bindWindowRef = useCallback((node) => {
        windowRef.current = node;
        hoverRef(node);
    }, [hoverRef]);
    const { position, setPosition, handleDragHandlePointerDown } = useDraggableWindow({
        enabled: !embedded && windowMode === "normal" && dockMorph === null,
        windowRef,
    });
    const handleResizeComplete = useCallback((rect) => {
        setSize({ width: rect.width, height: rect.height });
        setPosition(clampWindowPosition(rect.left, rect.top, rect.width, rect.height));
    }, [setPosition]);
    const { isResizing, ghostRef, createResizePointerDown } = useGhostCornerResize({
        enabled: !embedded && windowMode === "normal" && dockMorph === null,
        targetRef: windowRef,
        clampSize: clampMarkerWindowSize,
        onResizeComplete: handleResizeComplete,
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
    const handleWindowAnimationEnd = useCallback((event) => {
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
    }, [finishClose]);
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
    useEffect(() => {
        const dockMinimized = minimizedReplyReportIds.includes(report.id);
        if (dockMinimized) {
            registerOverlayMinimizedDock(markerDockId);
            return;
        }
        if (windowMode === "minimized" || dockMorph) {
            return;
        }
        unregisterOverlayMinimizedDock(markerDockId);
    }, [dockMorph, markerDockId, minimizedReplyReportIds, report.id, windowMode]);
    useEffect(() => {
        return () => {
            unregisterOverlayMinimizedDock(markerDockId);
        };
    }, [markerDockId]);
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
            return;
        }
        if (dockMinimized && windowMode !== "minimized" && dockMorph === null) {
            setWindowMode("minimized");
        }
    }, [dockMorph, minimizedReplyReportIds, report.id, windowMode]);
    const isOnFeedbackPath = report.pathname === currentPathname;
    const showFullContent = isFocused && isOnFeedbackPath;
    const isComposingCaseInThisWindow = showFullContent && isComposingNewCase;
    const isCreatorQuestionComposer = pendingComposer?.type === "question";
    const showComposer = useMemo(() => {
        if (!showFullContent) {
            return false;
        }
        if (isComposingNewCase) {
            return true;
        }
        if (!focusedCaseId) {
            return false;
        }
        return shouldShowCaseReplyComposer(report, focusedCaseId, pendingComposer);
    }, [focusedCaseId, isComposingNewCase, pendingComposer, report, showFullContent]);
    const replyTargetPreview = useMemo(() => {
        if (!showFullContent || isComposingNewCase || pendingComposer?.type !== "question") {
            return null;
        }
        return resolvePendingComposerTargetPreview(report, focusedCaseId, pendingComposer);
    }, [focusedCaseId, isComposingNewCase, pendingComposer, report, showFullContent]);
    const focusedCase = showFullContent && !isComposingNewCase && focusedCaseId ? getCaseById(report, focusedCaseId) : undefined;
    const focusedCaseAssigneeName = showFullContent && !isComposingNewCase && focusedCaseId ? getCaseAssigneeName(report, focusedCaseId) : null;
    const showAssigneeAssigned = Boolean(focusedCaseAssigneeName) || isClaimingAssignee;
    const fieldTags = useMemo(() => getFieldTags(fields, report.field_values), [fields, report.field_values]);
    const caseTexts = useMemo(() => getReportCases(report)
        .map((caseItem) => mentionMessageToPlainText(caseItem.text, caseItem.mentions).trim())
        .filter(Boolean), [report]);
    const minimizedCaseTexts = useMemo(() => caseTexts.slice(0, 5), [caseTexts]);
    const viewport = getViewportSize();
    const maximizedSize = {
        width: Math.max(MIN_WINDOW_WIDTH, viewport.width - WINDOW_MARGIN * 2),
        height: Math.max(MIN_WINDOW_HEIGHT, viewport.height - WINDOW_MARGIN * 2),
    };
    const isMinimized = windowMode === "minimized" || dockMorph?.phase === "minimizing";
    const isMaximized = windowMode === "maximized";
    const showMinimizedChrome = windowMode === "minimized" && dockMorph?.phase !== "restoring";
    const effectiveSize = isMaximized ? maximizedSize : size;
    const minimizedWidth = overlayDock.minimizedWidth;
    const resolvedSidebarWidth = clampSidebarWidth(sidebarWidth, effectiveSize.width);
    // Freeze the open position on mount so page changes (lost marker anchors) don't
    // collapse every window onto the same fallback center coordinate.
    const [seedPosition] = useState(() => clampWindowPosition(anchor.left + getMarkerDotSize() / 2 - DEFAULT_WINDOW_SIZE.width / 2, anchor.top + getMarkerDotSize() / 2 - DEFAULT_WINDOW_SIZE.height / 2, DEFAULT_WINDOW_SIZE.width, DEFAULT_WINDOW_SIZE.height));
    const restoredPosition = isMaximized ? { left: WINDOW_MARGIN, top: WINDOW_MARGIN } : (position ?? seedPosition);
    const resolvedPosition = showMinimizedChrome ? overlayDock.dockPosition : restoredPosition;
    const displayRect = embedded
        ? { left: 0, top: 0, width: "min(600px, calc(100vw - 32px))", height: DEFAULT_WINDOW_SIZE.height }
        : dockMorph ?? {
            left: showMinimizedChrome ? dockDrag.displayLeft : resolvedPosition.left,
            top: showMinimizedChrome ? dockDrag.displayTop : resolvedPosition.top,
            width: showMinimizedChrome ? minimizedWidth : effectiveSize.width,
            height: showMinimizedChrome ? MINIMIZED_WINDOW_HEIGHT : effectiveSize.height,
        };
    const layoutTransition = overlayDock.layoutTransition;
    const leftSectionClass = getLeftSectionClass(windowSurfacePhase);
    const windowAnimationClass = windowSurfacePhase === "exiting" ? MOTION.markerWindowExit : windowSurfacePhase === "entering" ? `${MOTION.markerWindowEnter} pointer-events-auto` : "pointer-events-auto";
    const handleSplitPointerDown = useCallback((event) => {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        detachSplitListeners();
        event.currentTarget.setPointerCapture(event.pointerId);
        splitStateRef.current = { startX: event.clientX, startWidth: resolvedSidebarWidth, windowWidth: effectiveSize.width };
        const handlePointerMove = (moveEvent) => {
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
    }, [detachSplitListeners, effectiveSize.width, resolvedSidebarWidth]);
    const handleToggleMinimize = () => {
        if (dockMorph) {
            return;
        }
        const viewportSize = getViewportSize();
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
            }
            else {
                focusReplyWindow(report.id);
            }
            setReplyWindowMinimized(report.id, false);
            overlayDock.restoreFromDock({
                left: currentRestoredPosition.left,
                top: currentRestoredPosition.top,
                width: currentRestoredSize.width,
                height: currentRestoredSize.height,
            });
            return;
        }
        setReplyWindowMinimized(report.id, true);
        overlayDock.minimizeToDock({
            left: currentRestoredPosition.left,
            top: currentRestoredPosition.top,
            width: currentRestoredSize.width,
            height: currentRestoredSize.height,
        });
        clearHoverLeaveTimeout();
        setHoveredMarkerId((current) => (current === report.id ? null : current));
    };
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
        beginComposeNewCase();
    };
    const handleSidebarDelete = () => {
        if (!isSidebarDeleteConfirming) {
            setIsSidebarDeleteConfirming(true);
            return;
        }
        void handleDelete(report.id).finally(() => setIsSidebarDeleteConfirming(false));
    };
    const leftControls = (_jsx(WindowModeControls, { closeAriaLabel: messages.marker.windowCloseAriaLabel, minimizeAriaLabel: isMinimized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMinimizeAriaLabel, maximizeAriaLabel: isMaximized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMaximizeAriaLabel, isMaximized: isMaximized, onClose: requestClose, onMinimize: handleToggleMinimize, onMaximize: handleToggleMaximize }));
    const sidebarToggleButton = (_jsx(WindowControlButton, { onClick: () => setIsSidebarCollapsed((current) => !current), ariaLabel: isSidebarCollapsed ? messages.marker.sidebarExpandAriaLabel : messages.marker.sidebarCollapseAriaLabel, className: isSidebarCollapsed ? "" : "text-[var(--adaptive-blue500)]", children: _jsx(SidePanelIcon, { className: "h-[16px] w-[16px]" }) }));
    const shareButton = (_jsx(MarkerWindowShareButton, { report: report, messages: messages }));
    const askAiButton = (_jsx(MarkerWindowAskAiButton, { report: report, fields: fields, messages: messages, focusedCaseId: focusedCaseId }));
    const deleteButton = canDeleteFeedback(report, sessionActor) ? (_jsx(FeedbackDeleteAction, { reportId: report.id, onDelete: handleDelete, disabled: isDeleting, locked: deleteLock.locked, lockLabel: deleteLock.tooltipLabel, messages: messages, className: `${HEADER_BUTTON_CLASS} disabled:opacity-50`, iconClassName: "h-[15px] w-[15px]" })) : null;
    const editButton = canEditReportCases(report) ? (_jsx(HoverTooltip, { label: messages.feedbackList.editTitle, children: _jsx("button", { type: "button", "data-fivepixels-interactive": "", className: HEADER_BUTTON_CLASS, "aria-label": messages.feedbackList.editAriaLabel, title: messages.feedbackList.editTitle, onPointerDown: (event) => event.stopPropagation(), onClick: () => beginFeedbackEdit(report), children: _jsx(EditIcon, { className: "h-[14px] w-[14px]" }) }) })) : null;
    const expandedSidebarActions = (_jsxs("nav", { "aria-label": messages.marker.sidebarActionsAriaLabel, className: "shrink-0 px-[6px] pb-[10px] pt-[2px]", children: [canEditReportCases(report) ? (_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: handleAddCase, className: SIDEBAR_ACTION_CLASS, children: [_jsx("span", { "aria-hidden": true, className: "inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center text-[18px] font-normal", children: "+" }), _jsx("span", { children: messages.marker.newCaseAction })] })) : null, _jsx(MarkerWindowShareButton, { report: report, messages: messages, expanded: true }), _jsx(MarkerWindowAskAiButton, { report: report, fields: fields, messages: messages, focusedCaseId: focusedCaseId, expanded: true })] }));
    const expandedSidebarDelete = canDeleteFeedback(report, sessionActor) ? (_jsx("div", { className: "mt-auto shrink-0 border-t border-[var(--adaptive-border-subtle)] p-[6px]", children: _jsxs("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: handleSidebarDelete, disabled: isDeleting, "aria-label": isSidebarDeleteConfirming ? messages.feedbackList.deleteConfirmAriaLabel : messages.feedbackList.deleteAriaLabel, className: `${SIDEBAR_ACTION_CLASS} text-rose-500 hover:text-rose-600 disabled:opacity-50`, children: [_jsx(TrashIcon, { className: "h-[15px] w-[15px] shrink-0" }), _jsx("span", { children: isSidebarDeleteConfirming ? messages.feedbackList.deleteConfirmTitle : messages.feedbackList.deleteTitle })] }) })) : null;
    const unfocusedBody = (_jsx("div", { className: "flex min-h-0 min-w-0 flex-1 items-center justify-center bg-[var(--adaptive-black50)]", children: _jsx(UnfocusedCaseSummary, { caseTexts: caseTexts, emptyLabel: messages.cases.selectToView, navigateHint: isOnFeedbackPath ? undefined : messages.marker.offscreenNavigateHint }) }));
    const rightSection = (_jsxs("div", { className: "flex min-w-0 flex-1 flex-col bg-[var(--adaptive-black50)]", children: [_jsx("header", { onPointerDown: handleDragHandlePointerDown, className: "shrink-0 cursor-move touch-none select-none border-b border-[var(--adaptive-border-subtle)] px-[16px] py-[8px]", children: isComposingCaseInThisWindow ? (_jsxs(Fragment, { children: [_jsx("p", { className: "truncate text-[15px] font-semibold leading-[1.4] text-[var(--adaptive-blue400)]", children: messages.cases.composingCaseTitle }), _jsx("p", { className: "mt-[2px] text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: messages.cases.open })] })) : focusedCase ? (_jsxs(Fragment, { children: [_jsx("p", { className: "truncate text-[15px] font-semibold leading-[1.4] text-[var(--adaptive-black900)]", title: mentionMessageToPlainText(focusedCase.text, focusedCase.mentions), children: mentionMessageToPlainText(focusedCase.text, focusedCase.mentions) }), _jsxs("div", { className: "mt-[2px] flex min-w-0 items-center justify-between gap-[8px]", children: [_jsx("div", { className: "flex min-w-0 flex-1 items-center gap-[6px]", children: focusedCase.status === "resolved" ? (_jsxs(_Fragment, { children: [_jsx(CheckCircleIcon, { className: "h-[14px] w-[14px] shrink-0", fill: RESOLVED_STATUS_COLOR }), _jsx("p", { className: "min-w-0 truncate text-[12px] font-semibold leading-[1.4]", style: { color: RESOLVED_STATUS_COLOR }, children: messages.thread.issueResolvedDivider })] })) : showAssigneeAssigned ? (_jsxs(_Fragment, { children: [_jsx(ProcessingDots, {}), _jsx(Text.Shimmer, { className: "min-w-0 truncate text-[12px] leading-[1.4]", color: {
                                                    start: "var(--adaptive-black900)",
                                                    end: "var(--adaptive-blue400)",
                                                }, duration: 5, children: messages.marker.assigneeAssigned })] })) : (_jsx("p", { className: "min-w-0 truncate text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: messages.marker.assigneeUnassigned })) }), _jsxs("div", { className: "flex min-w-0 shrink-0 items-center gap-[8px]", children: [_jsx(FeedbackFieldTags, { tags: fieldTags }), showAssigneeAssigned && focusedCase ? (_jsx(CaseAssigneeInfo, { caseItem: focusedCase, authors: authors })) : null] })] })] })) : (_jsx("p", { className: "text-[13px] text-[var(--adaptive-black500)]", children: messages.cases.selectToView })) }), _jsxs("div", { className: "flex min-h-0 flex-1 flex-col", children: [_jsx("div", { className: "min-h-0 flex-1 overflow-hidden", children: isComposingCaseInThisWindow ? (_jsx("div", { className: "h-full w-full bg-[var(--adaptive-black50)]" })) : (_jsx(FeedbackThread, { report: report, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: setConfirmAuthorName, onToggleConfirmAuthorSelect: toggleConfirmAuthorSelect, onStartDeny: startDenyReview, onStartCheckout: startCheckoutReview, onStartAskQuestion: startAskQuestion, onClaimAssignee: () => void handleClaimAssignee(), onTransferAssignee: () => void handleTransferAssignee(), onConfirm: () => void handleConfirmResolution(), isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, hideCaseSelector: true })) }), showComposer ? (_jsx("section", { className: "shrink-0 overflow-visible border-t border-[var(--adaptive-border-subtle)]", children: _jsx(FeedbackComposer, { message: replyDraft, onMessageChange: (value) => {
                                setReplyDraft(value);
                                if (errorMessage) {
                                    setErrorMessage("");
                                }
                            }, mentions: replyMentions, onMentionsChange: setReplyMentions, userMentions: replyUserMentions, onUserMentionsChange: setReplyUserMentions, enableElementMentions: true, authorName: replyAuthorName, onAuthorNameChange: setReplyAuthorName, authors: authors, fields: fields, fieldValues: report.field_values, onFieldChange: () => undefined, showTags: false, hideAuthorSelector: true, onSubmit: () => void handleReplySubmit(), isSubmitting: isSubmittingReply || isUpdating, autoFocus: isComposingCaseInThisWindow || pendingComposer !== null, placeholder: isComposingCaseInThisWindow ? messages.cases.composingCasePlaceholder : undefined, askQuestionForced: isComposingCaseInThisWindow ? false : isCreatorQuestionComposer, composerMode: isComposingCaseInThisWindow ? null : (pendingComposer?.type ?? null), onCancelComposerMode: isComposingCaseInThisWindow ? undefined : cancelPendingComposer, replyTargetPreview: isComposingCaseInThisWindow ? null : replyTargetPreview, errorMessage: errorMessage }) })) : null] })] }));
    return (_jsxs(_Fragment, { children: [!embedded && isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsxs("div", { ref: bindWindowRef, "data-fivepixels-interactive": "", "data-marker-feedback-window": report.id, "data-marker-window-focused": showFullContent ? "true" : "false", onPointerDown: handleWindowActivate, onClick: (event) => event.stopPropagation(), onAnimationEnd: handleWindowAnimationEnd, className: `${embedded ? "relative" : "fixed"} rounded-[16px] shadow-[var(--adaptive-popup-shadow)] ${windowMode === "normal" && dockMorph === null
                    ? "overflow-visible"
                    : showMinimizedChrome && dockMorph === null && !isDockDragging
                        ? ""
                        : "overflow-hidden"} ${isDockDragging ? "z-[1000003]" : showFullContent ? "z-[1000002]" : "z-[1000001]"} ${windowAnimationClass}`, style: {
                    left: displayRect.left,
                    top: displayRect.top,
                    width: displayRect.width,
                    height: displayRect.height,
                    ...(layoutTransition ? { transition: layoutTransition } : null),
                    ...(isDockDragging ? { cursor: "grabbing", transform: "scale(1.03)", willChange: "left, top, transform" } : null),
                }, children: [showMinimizedChrome ? (_jsx(MinimizedDockWindowChrome, { badgeLabel: "Route", badgeValue: report.pathname, restoreAriaLabel: `${messages.marker.windowRestoreAriaLabel}. ${report.pathname}. ${minimizedCaseTexts.map((text, index) => `${index + 1}. ${text}`).join(", ")}`, restoreTitle: messages.marker.windowRestoreAriaLabel, onRestore: handleToggleMinimize, restoreDisabled: dockMorph !== null, closeAriaLabel: messages.marker.windowCloseAriaLabel, closeTitle: messages.marker.windowCloseAriaLabel, onClose: requestClose, closeDisabled: dockMorph !== null || windowSurfacePhase === "exiting" || isDockDragging, dockCount: overlayDock.dockCount, isDockDragging: isDockDragging, onPointerDown: dockDrag.handleMinimizedDockPointerDown, onClickCapture: dockDrag.handleMinimizedDockClickCapture, surfaceClassName: leftSectionClass, children: _jsx(MinimizedWindowAliasRow, { projectId: projectId, reportId: report.id, caseTexts: minimizedCaseTexts, messages: messages, onRestore: handleToggleMinimize, restoreDisabled: dockMorph !== null }) })) : (_jsx("div", { ref: surfaceRef, className: "flex h-full w-full flex-row overflow-hidden rounded-[16px]", children: showFullContent ? (_jsxs(_Fragment, { children: [isSidebarCollapsed ? (_jsxs("div", { onPointerDown: handleDragHandlePointerDown, className: `flex shrink-0 cursor-move touch-none select-none flex-col items-center gap-[2px] py-[8px] ${leftSectionClass}`, style: { width: COLLAPSED_SIDEBAR_WIDTH }, children: [leftControls, shareButton, askAiButton, editButton, deleteButton, sidebarToggleButton] })) : (_jsxs("div", { className: `flex shrink-0 flex-col overflow-hidden ${leftSectionClass}`, style: { width: resolvedSidebarWidth }, children: [_jsxs("header", { onPointerDown: handleDragHandlePointerDown, className: "flex shrink-0 cursor-move touch-none select-none items-center justify-between gap-[8px] px-[10px] py-[8px]", children: [_jsx("div", { className: "flex items-center gap-[2px]", children: leftControls }), _jsx("div", { className: "flex items-center gap-[2px]", children: sidebarToggleButton })] }), expandedSidebarActions, _jsx(MarkerCaseSidebar, { report: report, focusedCaseId: focusedCaseId, isComposingNewCase: isComposingCaseInThisWindow, hasNewCaseDraftSession: showFullContent && hasNewCaseDraftSession, composingCaseTitle: messages.cases.composingCaseTitle, onSelectCase: selectCase, onSelectComposingCase: beginComposeNewCase }), expandedSidebarDelete] })), isSidebarCollapsed ? null : (_jsx("div", { role: "separator", "aria-orientation": "vertical", onPointerDown: handleSplitPointerDown, className: "group relative w-[3px] shrink-0 cursor-col-resize touch-none self-stretch bg-[var(--adaptive-black50)] transition-colors group-hover:bg-[var(--adaptive-blue500)]", children: _jsx("span", { className: "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 touch-none bg-[var(--adaptive-border-subtle)] transition-colors group-hover:bg-[var(--adaptive-blue500)]" }) })), rightSection] })) : (_jsxs(_Fragment, { children: [_jsx("div", { onPointerDown: handleDragHandlePointerDown, className: `flex shrink-0 cursor-move touch-none select-none flex-col items-center gap-[2px] py-[8px] ${leftSectionClass}`, style: { width: COLLAPSED_SIDEBAR_WIDTH }, children: leftControls }), unfocusedBody] })) })), !embedded && windowMode === "normal" && dockMorph === null ? (_jsx(WindowResizeHandles, { resizeWidthAriaLabel: messages.panel.resizeWidthAriaLabel, resizeHeightAriaLabel: messages.panel.resizeHeightAriaLabel, createResizePointerDown: createResizePointerDown })) : null] })] }));
}
//# sourceMappingURL=FeedbackWindow.js.map