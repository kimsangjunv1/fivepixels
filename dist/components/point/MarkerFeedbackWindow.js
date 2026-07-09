import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import { getMarkerDotSize } from "../../utils/markerRuntime.js";
import { useDraggableWindow, clampWindowPosition } from "../../hooks/useDraggableWindow.js";
import { useGhostCornerResize } from "../../hooks/useGhostCornerResize.js";
import { useNativeHover } from "../../hooks/useNativeHover.js";
import { useReport } from "../../providers/reportContext.js";
import { shouldShowCaseReplyComposer } from "../../utils/feedbackThread.js";
import { getCaseAssigneeName, getCaseById } from "../../utils/reportCases.js";
import { getFieldTags } from "../../utils/fields.js";
import { CloseIcon, MaximizeIcon, MinimizeIcon, RestoreIcon, SendIcon, SidePanelIcon } from "../../components/icons/Icons.js";
import { FeedbackFieldTags } from "../../components/panel/feedback/FeedbackFieldTags.js";
import { CornerResizeGhost } from "../../components/ui/CornerResizeGhost.js";
import { CornerResizeHandle } from "../../components/ui/CornerResizeHandle.js";
import { FeedbackComposer } from "../../components/panel/feedback/FeedbackComposer.js";
import { CaseAssigneeInfo } from "../../components/panel/feedback/CaseAssigneeInfo.js";
import { FeedbackThread } from "../../components/panel/feedback/FeedbackThread.js";
import { MarkerCaseSidebar } from "./MarkerCaseSidebar.js";
import { ProcessingDots } from "../../components/ui/ProcessingDots.js";
import { Text } from "../../components/ui/Text/index.js";
const WINDOW_MARGIN = 16;
const DEFAULT_WINDOW_SIZE = { width: 600, height: 460 };
const MIN_WINDOW_WIDTH = 420;
const MIN_WINDOW_HEIGHT = 280;
const DEFAULT_SIDEBAR_WIDTH = 208;
const SIDEBAR_MIN_WIDTH = 150;
const RIGHT_MIN_WIDTH = 280;
const COLLAPSED_SIDEBAR_WIDTH = 46;
const WINDOW_CLOSE_ANIMATION_MS = 220;
const LEFT_SECTION_TRANSITION = "transition-[background-color,backdrop-filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]";
const LEFT_SECTION_FLAT_CLASS = `${LEFT_SECTION_TRANSITION} bg-[var(--adaptive-black50)]`;
const LEFT_SECTION_BLUR_CLASS = `${LEFT_SECTION_TRANSITION} bg-[var(--adaptive-fillOpacity500)] backdrop-blur-[20px] shadow-[inset_0_20px_0_20px_var(--adaptive-black500)]]`;
function getLeftSectionClass(phase) {
    return phase === "idle" ? LEFT_SECTION_BLUR_CLASS : LEFT_SECTION_FLAT_CLASS;
}
const HEADER_BUTTON_CLASS = "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] transition-colors hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]";
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
function WindowControlButton({ onClick, ariaLabel, className = "", children }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: onClick, "aria-label": ariaLabel, className: `${HEADER_BUTTON_CLASS} ${className}`, children: children }));
}
export function MarkerFeedbackWindow({ report, anchor }) {
    const { messages, fields, authors, pendingComposer, replyDraft, replyAuthorName, confirmAuthorName, showConfirmAuthorSelect, errorMessage, setErrorMessage, isUpdating, isSubmittingReply, isClaimingAssignee, focusedCaseId, selectCase, closeReplyComposer, clearHoverLeaveTimeout, scheduleHoverLeave, setHoveredMarkerId, setReplyDraft, setReplyAuthorName, setConfirmAuthorName, toggleConfirmAuthorSelect, handleReplySubmit, startDenyReview, startCheckoutReview, startAskQuestion, handleClaimAssignee, handleTransferAssignee, handleConfirmResolution, } = useReport();
    const windowRef = useRef(null);
    const surfaceRef = useRef(null);
    const closeRequestedRef = useRef(false);
    const closeFinishedRef = useRef(false);
    const [windowMode, setWindowMode] = useState("normal");
    const [windowSurfacePhase, setWindowSurfacePhase] = useState("entering");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [size, setSize] = useState(DEFAULT_WINDOW_SIZE);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
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
    useEffect(() => {
        if (!focusedCaseId) {
            return;
        }
        const handlePointerDown = (event) => {
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
    const isCreatorQuestionComposer = pendingComposer?.type === "question";
    const showComposer = useMemo(() => {
        if (!focusedCaseId) {
            return false;
        }
        return shouldShowCaseReplyComposer(report, focusedCaseId, pendingComposer);
    }, [focusedCaseId, pendingComposer, report]);
    const focusedCase = focusedCaseId ? getCaseById(report, focusedCaseId) : undefined;
    const focusedCaseAssigneeName = focusedCaseId ? getCaseAssigneeName(report, focusedCaseId) : null;
    const showAssigneeAssigned = Boolean(focusedCaseAssigneeName) || isClaimingAssignee;
    const fieldTags = useMemo(() => getFieldTags(fields, report.field_values), [fields, report.field_values]);
    const isCaseWritingDisabled = report.status === "resolved" || report.status === "archived" || focusedCase?.status === "resolved";
    const viewport = getViewportSize();
    const maximizedSize = {
        width: Math.max(MIN_WINDOW_WIDTH, viewport.width - WINDOW_MARGIN * 2),
        height: Math.max(MIN_WINDOW_HEIGHT, viewport.height - WINDOW_MARGIN * 2),
    };
    const isMinimized = windowMode === "minimized";
    const isMaximized = windowMode === "maximized";
    const effectiveSize = isMaximized ? maximizedSize : size;
    const resolvedSidebarWidth = clampSidebarWidth(sidebarWidth, effectiveSize.width);
    const initialPosition = useMemo(() => clampWindowPosition(anchor.left + getMarkerDotSize() / 2 - size.width / 2, anchor.top + getMarkerDotSize() / 2 - size.height / 2, size.width, size.height), [anchor.left, anchor.top, size.height, size.width]);
    const resolvedPosition = isMaximized ? { left: WINDOW_MARGIN, top: WINDOW_MARGIN } : (position ?? initialPosition);
    const leftSectionClass = getLeftSectionClass(windowSurfacePhase);
    const windowAnimationClass = windowSurfacePhase === "exiting" ? "fivepixels-marker-window-exit" : windowSurfacePhase === "entering" ? "fivepixels-marker-window-enter pointer-events-auto" : "pointer-events-auto";
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
        setWindowMode((current) => (current === "minimized" ? "normal" : "minimized"));
    };
    const handleToggleMaximize = () => {
        setWindowMode((current) => (current === "maximized" ? "normal" : "maximized"));
    };
    const leftControls = (_jsxs(_Fragment, { children: [_jsx(WindowControlButton, { onClick: requestClose, ariaLabel: messages.marker.windowCloseAriaLabel, children: _jsx(CloseIcon, { className: "h-[15px] w-[15px]" }) }), _jsx(WindowControlButton, { onClick: handleToggleMinimize, ariaLabel: isMinimized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMinimizeAriaLabel, children: _jsx(MinimizeIcon, { className: "h-[15px] w-[15px]" }) }), _jsx(WindowControlButton, { onClick: handleToggleMaximize, ariaLabel: isMaximized ? messages.marker.windowRestoreAriaLabel : messages.marker.windowMaximizeAriaLabel, children: isMaximized ? _jsx(RestoreIcon, { className: "h-[15px] w-[15px]" }) : _jsx(MaximizeIcon, { className: "h-[15px] w-[15px]" }) })] }));
    const sidebarToggleButton = (_jsx(WindowControlButton, { onClick: () => setIsSidebarCollapsed((current) => !current), ariaLabel: isSidebarCollapsed ? messages.marker.sidebarExpandAriaLabel : messages.marker.sidebarCollapseAriaLabel, className: isSidebarCollapsed ? "" : "text-[var(--adaptive-blue500)]", children: _jsx(SidePanelIcon, { className: "h-[16px] w-[16px]" }) }));
    const rightSection = (_jsxs("div", { className: "flex min-w-0 flex-1 flex-col bg-[var(--adaptive-black50)]", children: [_jsx("div", { className: "shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[16px] py-[8px]", children: focusedCase ? (_jsxs(Fragment, { children: [_jsx("p", { className: `truncate text-[15px] font-semibold leading-[1.4] text-[var(--adaptive-black900)] ${focusedCase.status === "resolved" ? "text-[var(--adaptive-black500)] line-through" : ""}`, title: focusedCase.text, children: focusedCase.text }), _jsxs("div", { className: "mt-[2px] flex min-w-0 items-center justify-between gap-[8px]", children: [_jsx("div", { className: "flex min-w-0 flex-1 items-center gap-[6px]", children: showAssigneeAssigned ? (_jsxs(_Fragment, { children: [_jsx(ProcessingDots, {}), _jsx(Text.Shimmer, { className: "min-w-0 truncate text-[12px] leading-[1.4]", color: {
                                                    start: "var(--adaptive-black900)",
                                                    end: "var(--adaptive-blue400)",
                                                }, duration: 5, children: messages.marker.assigneeAssigned })] })) : (_jsx("p", { className: "min-w-0 truncate text-[12px] leading-[1.4] text-[var(--adaptive-black500)]", children: messages.marker.assigneeUnassigned })) }), _jsxs("div", { className: "flex min-w-0 shrink-0 items-center gap-[8px]", children: [_jsx(FeedbackFieldTags, { tags: fieldTags }), showAssigneeAssigned && focusedCase ? (_jsx(CaseAssigneeInfo, { caseItem: focusedCase, authors: authors })) : null] })] })] })) : (_jsx("p", { className: "text-[13px] text-[var(--adaptive-black500)]", children: messages.cases.selectToView })) }), _jsxs("div", { className: "flex min-h-0 flex-1 flex-col relative", children: [_jsx(FeedbackThread, { report: report, authors: authors, pendingComposer: pendingComposer, confirmAuthorName: confirmAuthorName, showConfirmAuthorSelect: showConfirmAuthorSelect, onConfirmAuthorNameChange: setConfirmAuthorName, onToggleConfirmAuthorSelect: toggleConfirmAuthorSelect, onStartDeny: startDenyReview, onStartCheckout: startCheckoutReview, onStartAskQuestion: startAskQuestion, onClaimAssignee: () => void handleClaimAssignee(), onTransferAssignee: () => void handleTransferAssignee(), onConfirm: () => void handleConfirmResolution(), isUpdating: isUpdating, isClaimingAssignee: isClaimingAssignee, hideCaseSelector: true }), showComposer ? (_jsx("section", { className: "relative shrink-0 overflow-visible p-[4px] absolute bottom-0 left-0 w-full", children: _jsx(FeedbackComposer, { message: replyDraft, onMessageChange: (value) => {
                                setReplyDraft(value);
                                if (errorMessage) {
                                    setErrorMessage("");
                                }
                            }, authorName: replyAuthorName, onAuthorNameChange: setReplyAuthorName, authors: authors, fields: fields, fieldValues: report.field_values, onFieldChange: () => undefined, showTags: false, hideAuthorSelector: true, onSubmit: () => void handleReplySubmit(), isSubmitting: isSubmittingReply || isUpdating, autoFocus: pendingComposer !== null, askQuestionForced: isCreatorQuestionComposer, errorMessage: errorMessage }) })) : (_jsx("div", { className: "absolute bottom-0 left-0 w-full bg-[var(--adaptive-neutralTintOpacity700)] backdrop-blur-[5px] shrink-0 border-t border-[var(--adaptive-border-subtle)] px-[14px] py-[12px]", children: _jsxs("div", { className: "flex items-center gap-[8px]", children: [_jsx("p", { className: "min-w-0 flex-1 truncate text-[14px] leading-[1.4] text-[var(--adaptive-text-muted)]", children: isCaseWritingDisabled ? messages.composer.resolvedCaseDisabled : messages.composer.placeholder }), _jsx("span", { "aria-hidden": true, className: "flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-black300)] opacity-60", children: _jsx(SendIcon, { className: "h-[16px] w-[16px] text-white" }) })] }) }))] })] }));
    return (_jsxs(_Fragment, { children: [isResizing ? _jsx(CornerResizeGhost, { ghostRef: ghostRef }) : null, _jsx("div", { ref: bindWindowRef, "data-fivepixels-interactive": "", onClick: (event) => event.stopPropagation(), onAnimationEnd: handleWindowAnimationEnd, className: `fixed z-[1000001] ${windowAnimationClass}`, style: {
                    left: resolvedPosition.left,
                    top: resolvedPosition.top,
                    width: effectiveSize.width,
                    ...(isMinimized ? null : { height: effectiveSize.height }),
                }, children: isMinimized ? (_jsxs("div", { ref: surfaceRef, className: `flex items-center justify-between gap-[8px] overflow-hidden rounded-[16px] border border-[var(--adaptive-border-subtle)] px-[10px] py-[8px] shadow-[var(--adaptive-popup-shadow)] ${leftSectionClass}`, children: [_jsx("div", { onPointerDown: handleDragHandlePointerDown, className: "flex flex-1 cursor-move touch-none select-none items-center gap-[2px]", children: leftControls }), sidebarToggleButton] })) : (_jsxs("div", { ref: surfaceRef, className: "flex h-full w-full flex-row overflow-hidden rounded-[16px] shadow-[var(--adaptive-popup-shadow)]", children: [isSidebarCollapsed ? (_jsxs("div", { onPointerDown: handleDragHandlePointerDown, className: `flex shrink-0 cursor-move touch-none select-none flex-col items-center gap-[2px] py-[8px] ${leftSectionClass}`, style: { width: COLLAPSED_SIDEBAR_WIDTH }, children: [leftControls, sidebarToggleButton] })) : (_jsxs("div", { className: `flex shrink-0 flex-col overflow-hidden ${leftSectionClass}`, style: { width: resolvedSidebarWidth }, children: [_jsxs("header", { onPointerDown: handleDragHandlePointerDown, className: "flex shrink-0 cursor-move touch-none select-none items-center justify-between gap-[8px] px-[10px] py-[8px]", children: [_jsx("div", { className: "flex items-center gap-[2px]", children: leftControls }), sidebarToggleButton] }), _jsx(MarkerCaseSidebar, { report: report, focusedCaseId: focusedCaseId, onSelectCase: selectCase })] })), isSidebarCollapsed ? null : (_jsx("div", { role: "separator", "aria-orientation": "vertical", onPointerDown: handleSplitPointerDown, className: "group relative w-[1px] shrink-0 cursor-col-resize touch-none self-stretch bg-[var(--adaptive-black50)] group-hover:bg-[var(--adaptive-blue500)] transition-colors" })), rightSection, windowMode === "normal" ? (_jsx(CornerResizeHandle, { corner: "bottom-right", ariaLabel: messages.marker.resizeAriaLabel, onPointerDown: handleResizePointerDown })) : null] })) })] }));
}
//# sourceMappingURL=MarkerFeedbackWindow.js.map