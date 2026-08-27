import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import { getMarkerDotSize } from "../../utils/marker/markerRuntime.js";
import { useDraggableWindow, clampWindowPosition } from "../../hooks/useDraggableWindow.js";
import { useGhostCornerResize } from "../../hooks/useGhostCornerResize.js";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useReport } from "../../providers/reportContext.js";
import { resolvePendingComposerTargetPreview, shouldShowCaseReplyComposer } from "../../utils/feedback/feedbackThread.js";
import { getCaseAssigneeName, getCaseById, getReportCases } from "../../utils/report/reportCases.js";
import { getFieldTags } from "../../utils/report/fields.js";
import { copyTextToClipboard } from "../../utils/feedback/feedbackDataTransfer.js";
import { buildAiPromptLabels, formatFeedbackForAiPrompt } from "../../utils/feedback/formatFeedbackForAiPrompt.js";
import { buildFeedbackShareUrl } from "../../utils/feedback/feedbackDeepLink.js";
import { AskAiCopyDropdown } from "../../components/panel/feedback/AskAiCopyDropdown.js";
import { CloseIcon, CheckCircleIcon, ChevronDownIcon, EditIcon, LinkIcon, MaximizeIcon, MinimizeIcon, RestoreIcon, SidePanelIcon, TrashIcon, AskAiIcon } from "../../components/icons/Icons.js";
import { FeedbackFieldTags } from "../../components/panel/feedback/FeedbackFieldTags.js";
import { FeedbackDeleteAction } from "../../components/panel/feedback/FeedbackDeleteAction.js";
import { canDeleteFeedback } from "../../utils/feedback/feedbackPermissions.js";
import { canEditReportCases } from "../../utils/report/reportCases.js";
import { mentionMessageToPlainText } from "../../utils/mention/elementMentions.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { useIntegrationLock } from "../../components/ui/IntegrationLock.js";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { MOTION } from "../../constants/motionClasses.js";
import { ACCENT_COLOR } from "../../constants/accentColors.js";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
import { FeedbackComposer } from "../../components/panel/feedback/FeedbackComposer.js";
import { CaseAssigneeInfo } from "../../components/panel/feedback/CaseAssigneeInfo.js";
import { FeedbackThread } from "../../components/panel/feedback/FeedbackThread.js";
import { MarkerCaseSidebar } from "./MarkerCaseSidebar.js";
import { ProcessingDots } from "../../components/ui/ProcessingDots.js";
import { Text } from "../../components/ui/Text/index.js";
import { MARKER_MINIMIZED_WINDOW_HEIGHT, MARKER_MINIMIZED_WINDOW_WIDTH, MARKER_WINDOW_MARGIN, resolveMinimizedDockIndexFromPointer, resolveMinimizedDockPosition } from "../../utils/marker/markerWindowDock.js";
import { readMinimizedWindowAlias, writeMinimizedWindowAlias } from "../../utils/marker/minimizedWindowAlias.js";
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
function getLeftSectionClass(phase) {
    return phase === "idle" ? LEFT_SECTION_BLUR_CLASS : LEFT_SECTION_FLAT_CLASS;
}
const HEADER_BUTTON_CLASS = "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
const SIDEBAR_ACTION_CLASS = "flex h-[32px] w-full items-center gap-[8px] rounded-[8px] px-[8px] text-left text-[13px] font-semibold text-[var(--adaptive-black700)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
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
function MinimizedCaseMarquee({ caseTexts }) {
    if (caseTexts.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "min-w-0 flex-1 overflow-hidden text-[12px] text-[var(--adaptive-black700)]", children: _jsx("div", { "aria-hidden": true, className: "fivepixels-marker-window-marquee", style: { animationDuration: `${Math.max(12, caseTexts.length * 6)}s` }, children: [0, 1].map((copyIndex) => (_jsx("div", { className: "fivepixels-marker-window-marquee__copy", children: caseTexts.map((text, index) => (_jsxs("span", { className: "whitespace-nowrap", children: [_jsxs("span", { className: "mr-[4px] text-[var(--adaptive-black500)]", children: [index + 1, "."] }), text] }, `${copyIndex}-${index}`))) }, copyIndex))) }) }));
}
function MinimizedWindowAliasRow({ projectId, reportId, caseTexts, messages, onRestore, restoreDisabled = false, }) {
    const [alias, setAlias] = useState(() => readMinimizedWindowAlias(projectId, reportId));
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(alias);
    const inputRef = useRef(null);
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
        return (_jsxs("div", { className: "flex min-w-0 items-center gap-[4px]", onPointerDown: (event) => event.stopPropagation(), onClick: (event) => event.stopPropagation(), children: [_jsx("input", { ref: inputRef, type: "text", value: draft, maxLength: 40, placeholder: messages.marker.minimizedAliasPlaceholder, "aria-label": messages.marker.minimizedAliasInputAriaLabel, "data-fivepixels-interactive": "", onChange: (event) => setDraft(event.target.value), onKeyDown: (event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            commitAlias();
                        }
                        if (event.key === "Escape") {
                            event.preventDefault();
                            setDraft(alias);
                            setIsEditing(false);
                        }
                    }, onBlur: commitAlias, className: "min-w-0 flex-1 rounded-[4px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[12px] font-semibold text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" }), alias ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.marker.minimizedAliasClearAriaLabel, title: messages.marker.minimizedAliasClearAriaLabel, onMouseDown: (event) => event.preventDefault(), onClick: clearAlias, className: "inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })) : null] }));
    }
    return (_jsxs("div", { className: "flex min-w-0 items-center gap-[4px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onRestore, disabled: restoreDisabled, "aria-label": messages.marker.windowRestoreAriaLabel, className: "flex min-w-0 flex-1 items-center overflow-hidden text-left", children: alias ? (_jsx("p", { className: "min-w-0 flex-1 truncate text-[12px] font-semibold leading-[1.3] text-[var(--adaptive-black900)]", title: alias, children: alias })) : (_jsx(MinimizedCaseMarquee, { caseTexts: caseTexts })) }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.marker.minimizedAliasEditAriaLabel, title: messages.marker.minimizedAliasEditAriaLabel, onPointerDown: (event) => event.stopPropagation(), onClick: (event) => {
                    event.stopPropagation();
                    setDraft(alias);
                    setIsEditing(true);
                }, className: "inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(EditIcon, { className: "h-[12px] w-[12px]" }) })] }));
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
export function MarkerFeedbackWindow({ report, anchor, isFocused }) {
    const { messages, fields, authors, currentPathname, pendingComposer, replyDraft, replyMentions, replyAuthorName, confirmAuthorName, showConfirmAuthorSelect, errorMessage, setErrorMessage, isUpdating, isSubmittingReply, isClaimingAssignee, focusedCaseId, selectCase, closeReplyWindow, focusReplyWindow, revealOpenFeedback, minimizedReplyReportIds, setReplyWindowMinimized, reorderMinimizedReplyWindow, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, setReplyMentions, setReplyAuthorName, setConfirmAuthorName, toggleConfirmAuthorSelect, handleReplySubmit, startDenyReview, startCheckoutReview, startAskQuestion, handleClaimAssignee, handleTransferAssignee, handleConfirmResolution, handleDelete, isDeleting, sessionActor, cancelPendingComposer, beginFeedbackEdit, beginComposeNewCase, isComposingNewCase, hasNewCaseDraftSession, projectId, } = useReport();
    const deleteLock = useIntegrationLock("deleteFeedback");
    const windowRef = useRef(null);
    const surfaceRef = useRef(null);
    const closeRequestedRef = useRef(false);
    const closeFinishedRef = useRef(false);
    const [windowMode, setWindowMode] = useState("normal");
    const [windowSurfacePhase, setWindowSurfacePhase] = useState("entering");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [size, setSize] = useState(DEFAULT_WINDOW_SIZE);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const [isSidebarDeleteConfirming, setIsSidebarDeleteConfirming] = useState(false);
    const [dockMorph, setDockMorph] = useState(null);
    const [dockDrag, setDockDrag] = useState(null);
    const dockMorphTimerRef = useRef(null);
    const dockMorphFrameRef = useRef(null);
    const dockDragRef = useRef(null);
    const dockDragListenersRef = useRef(null);
    const suppressDockRestoreClickRef = useRef(false);
    const minimizedReplyReportIdsRef = useRef(minimizedReplyReportIds);
    minimizedReplyReportIdsRef.current = minimizedReplyReportIds;
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
    const minimizedWidth = Math.min(MINIMIZED_WINDOW_WIDTH, Math.max(0, viewport.width - WINDOW_MARGIN * 2));
    const resolvedSidebarWidth = clampSidebarWidth(sidebarWidth, effectiveSize.width);
    const minimizedDockIndex = Math.max(0, minimizedReplyReportIds.indexOf(report.id));
    const minimizedDockCount = Math.max(1, minimizedReplyReportIds.length);
    // Freeze the open position on mount so page changes (lost marker anchors) don't
    // collapse every window onto the same fallback center coordinate.
    const [seedPosition] = useState(() => clampWindowPosition(anchor.left + getMarkerDotSize() / 2 - DEFAULT_WINDOW_SIZE.width / 2, anchor.top + getMarkerDotSize() / 2 - DEFAULT_WINDOW_SIZE.height / 2, DEFAULT_WINDOW_SIZE.width, DEFAULT_WINDOW_SIZE.height));
    const restoredPosition = isMaximized ? { left: WINDOW_MARGIN, top: WINDOW_MARGIN } : (position ?? seedPosition);
    const dockPosition = resolveMinimizedDockPosition(minimizedDockIndex, minimizedDockCount, viewport.width, viewport.height, minimizedWidth, MINIMIZED_WINDOW_HEIGHT);
    const resolvedPosition = showMinimizedChrome ? dockPosition : restoredPosition;
    const isDockDragging = dockDrag?.active === true;
    const displayRect = dockMorph ?? {
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
    const windowAnimationClass = windowSurfacePhase === "exiting" ? MOTION.markerWindowExit : windowSurfacePhase === "entering" ? `${MOTION.markerWindowEnter} pointer-events-auto` : "pointer-events-auto";
    const runDockMorph = useCallback((phase, from, to, onComplete) => {
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
    }, [clearDockMorphTimers]);
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
            }
            else {
                focusReplyWindow(report.id);
            }
            const from = {
                left: dockPosition.left,
                top: dockPosition.top,
                width: currentMinimizedWidth,
                height: MINIMIZED_WINDOW_HEIGHT,
            };
            const to = {
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
        const nextDock = resolveMinimizedDockPosition(nextDockIndex, nextMinimizedIds.length, viewportSize.width, viewportSize.height, currentMinimizedWidth, MINIMIZED_WINDOW_HEIGHT);
        const from = {
            left: currentRestoredPosition.left,
            top: currentRestoredPosition.top,
            width: currentRestoredSize.width,
            height: currentRestoredSize.height,
        };
        const to = {
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
    const handleMinimizedDockPointerDown = useCallback((event) => {
        if (event.button !== 0 || dockMorph !== null || windowMode !== "minimized" || minimizedReplyReportIds.length < 2) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        detachDockDragListeners();
        const rect = windowRef.current?.getBoundingClientRect();
        const initial = {
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
        const handlePointerMove = (moveEvent) => {
            const state = dockDragRef.current;
            if (!state || moveEvent.pointerId !== state.pointerId) {
                return;
            }
            const distance = Math.hypot(moveEvent.clientX - state.startX, moveEvent.clientY - state.startY);
            const nextActive = state.active || distance >= MINIMIZED_DOCK_DRAG_THRESHOLD_PX;
            if (nextActive && !state.active) {
                suppressDockRestoreClickRef.current = true;
            }
            const next = {
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
        const handlePointerUp = (upEvent) => {
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
    }, [detachDockDragListeners, dockMorph, minimizedReplyReportIds.length, minimizedWidth, reorderMinimizedReplyWindow, report.id, windowMode]);
    const handleMinimizedDockClickCapture = useCallback((event) => {
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
        beginComposeNewCase();
    };
    const handleSidebarDelete = () => {
        if (!isSidebarDeleteConfirming) {
            setIsSidebarDeleteConfirming(true);
            return;
        }
        void handleDelete(report.id).finally(() => setIsSidebarDeleteConfirming(false));
    };
    const leftControls = (_jsxs(_Fragment, { children: [_jsx(WindowControlButton, { onClick: requestClose, ariaLabel: messages.marker.windowCloseAriaLabel, children: _jsx(CloseIcon, { className: "h-[15px] w-[15px]" }) }), _jsx(WindowControlButton, { onClick: handleToggleMinimize, ariaLabel: isMinimized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMinimizeAriaLabel, children: _jsx(MinimizeIcon, { className: "h-[15px] w-[15px]" }) }), _jsx(WindowControlButton, { onClick: handleToggleMaximize, ariaLabel: isMaximized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMaximizeAriaLabel, children: isMaximized ? _jsx(RestoreIcon, { className: "h-[15px] w-[15px]" }) : _jsx(MaximizeIcon, { className: "h-[15px] w-[15px]" }) })] }));
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
                            }, mentions: replyMentions, onMentionsChange: setReplyMentions, enableElementMentions: true, authorName: replyAuthorName, onAuthorNameChange: setReplyAuthorName, authors: authors, fields: fields, fieldValues: report.field_values, onFieldChange: () => undefined, showTags: false, hideAuthorSelector: true, onSubmit: () => void handleReplySubmit(), isSubmitting: isSubmittingReply || isUpdating, autoFocus: isComposingCaseInThisWindow || pendingComposer !== null, placeholder: isComposingCaseInThisWindow ? messages.cases.composingCasePlaceholder : undefined, askQuestionForced: isComposingCaseInThisWindow ? false : isCreatorQuestionComposer, composerMode: isComposingCaseInThisWindow ? null : (pendingComposer?.type ?? null), onCancelComposerMode: isComposingCaseInThisWindow ? undefined : cancelPendingComposer, replyTargetPreview: isComposingCaseInThisWindow ? null : replyTargetPreview, errorMessage: errorMessage }) })) : null] })] }));
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsx("div", { ref: bindWindowRef, "data-fivepixels-interactive": "", "data-marker-feedback-window": report.id, "data-marker-window-focused": showFullContent ? "true" : "false", onPointerDown: handleWindowActivate, onClick: (event) => event.stopPropagation(), onAnimationEnd: handleWindowAnimationEnd, className: `fixed rounded-[16px] ${showMinimizedChrome && dockMorph === null && !isDockDragging ? "" : "overflow-hidden"} ${isDockDragging ? "z-[1000003]" : showFullContent ? "z-[1000002]" : "z-[1000001]"} ${windowAnimationClass}`, style: {
                    left: displayRect.left,
                    top: displayRect.top,
                    width: displayRect.width,
                    height: displayRect.height,
                    ...(layoutTransition ? { transition: layoutTransition } : null),
                    ...(isDockDragging ? { cursor: "grabbing", transform: "scale(1.03)", willChange: "left, top, transform" } : null),
                }, children: showMinimizedChrome ? (_jsxs("div", { className: `group/min-dock relative h-full w-full ${minimizedReplyReportIds.length > 1 ? "cursor-grab" : ""} ${isDockDragging ? "cursor-grabbing" : ""}`, onPointerDown: handleMinimizedDockPointerDown, onClickCapture: handleMinimizedDockClickCapture, children: [_jsx("div", { ref: surfaceRef, className: `flex h-full w-full overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)] ${leftSectionClass}`, children: _jsxs("div", { className: "flex w-full flex-col justify-center gap-[2px] overflow-hidden px-[12px] py-[6px]", children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleToggleMinimize, disabled: dockMorph !== null, "aria-label": `${messages.marker.windowRestoreAriaLabel}. ${report.pathname}. ${minimizedCaseTexts.map((text, index) => `${index + 1}. ${text}`).join(", ")}`, title: messages.marker.windowRestoreAriaLabel, className: "flex min-w-0 items-center gap-[4px] text-left", children: [_jsx("p", { className: "shrink-0 rounded-[4px] bg-[var(--adaptive-tintOpacity300)] px-[2px] py-[2px] text-[10px]", children: "Route" }), _jsx("p", { className: "min-w-0 truncate text-[10px] font-semibold leading-none text-[var(--adaptive-accent-coral)]", children: report.pathname })] }), _jsx(MinimizedWindowAliasRow, { projectId: projectId, reportId: report.id, caseTexts: minimizedCaseTexts, messages: messages, onRestore: handleToggleMinimize, restoreDisabled: dockMorph !== null })] }) }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.marker.windowCloseAriaLabel, title: messages.marker.windowCloseAriaLabel, disabled: dockMorph !== null || windowSurfacePhase === "exiting" || isDockDragging, onPointerDown: (event) => event.stopPropagation(), onClick: (event) => {
                                event.stopPropagation();
                                requestClose();
                            }, className: `absolute right-[6px] top-[6px] z-[2] inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] text-[var(--adaptive-black700)] shadow-[var(--adaptive-popup-shadow)] transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--adaptive-black200)] hover:text-[var(--adaptive-black900)] ${dockMorph !== null || isDockDragging
                                ? "pointer-events-none scale-90 opacity-0"
                                : "pointer-events-none scale-90 opacity-0 group-hover/min-dock:pointer-events-auto group-hover/min-dock:scale-100 group-hover/min-dock:opacity-100"}`, children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })] })) : (_jsxs("div", { ref: surfaceRef, className: "flex h-full w-full flex-row overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)]", children: [showFullContent ? (_jsxs(_Fragment, { children: [isSidebarCollapsed ? (_jsxs("div", { onPointerDown: handleDragHandlePointerDown, className: `flex shrink-0 cursor-move touch-none select-none flex-col items-center gap-[2px] py-[8px] ${leftSectionClass}`, style: { width: COLLAPSED_SIDEBAR_WIDTH }, children: [leftControls, shareButton, askAiButton, editButton, deleteButton, sidebarToggleButton] })) : (_jsxs("div", { className: `flex shrink-0 flex-col overflow-hidden ${leftSectionClass}`, style: { width: resolvedSidebarWidth }, children: [_jsxs("header", { onPointerDown: handleDragHandlePointerDown, className: "flex shrink-0 cursor-move touch-none select-none items-center justify-between gap-[8px] px-[10px] py-[8px]", children: [_jsx("div", { className: "flex items-center gap-[2px]", children: leftControls }), _jsx("div", { className: "flex items-center gap-[2px]", children: sidebarToggleButton })] }), expandedSidebarActions, _jsx(MarkerCaseSidebar, { report: report, focusedCaseId: focusedCaseId, isComposingNewCase: isComposingCaseInThisWindow, hasNewCaseDraftSession: showFullContent && hasNewCaseDraftSession, composingCaseTitle: messages.cases.composingCaseTitle, onSelectCase: selectCase, onSelectComposingCase: beginComposeNewCase }), expandedSidebarDelete] })), isSidebarCollapsed ? null : (_jsx("div", { role: "separator", "aria-orientation": "vertical", onPointerDown: handleSplitPointerDown, className: "group relative w-[3px] shrink-0 cursor-col-resize touch-none self-stretch bg-[var(--adaptive-black50)] transition-colors group-hover:bg-[var(--adaptive-blue500)]", children: _jsx("span", { className: "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 touch-none bg-[var(--adaptive-border-subtle)] transition-colors group-hover:bg-[var(--adaptive-blue500)]" }) })), rightSection] })) : (_jsxs(_Fragment, { children: [_jsx("div", { onPointerDown: handleDragHandlePointerDown, className: `flex shrink-0 cursor-move touch-none select-none flex-col items-center gap-[2px] py-[8px] ${leftSectionClass}`, style: { width: COLLAPSED_SIDEBAR_WIDTH }, children: leftControls }), unfocusedBody] })), windowMode === "normal" && dockMorph === null ? (_jsx(CornerResizeHandle, { corner: "bottom-right", ariaLabel: messages.marker.resizeAriaLabel, onPointerDown: handleResizePointerDown })) : null] })) })] }));
}
//# sourceMappingURL=MarkerFeedbackWindow.js.map