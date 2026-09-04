import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../../shared/components/icons/Icons.js";
import { MOTION } from "../../shared/constants/motionClasses.js";
import { useNotificationStackAnchor } from "../../shared/hooks/useNotificationStackAnchor.js";
import { useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { groupNotifications, isStatusNotificationId, } from "../../shared/utils/notification/notificationGroups.js";
import { PANEL_LAYER_Z_INDEX } from "../../shared/utils/overlay/floatingWindowStack.js";
import { PickTargetCompareSegment } from "../../surfaces/tooltip/PickTargetCompareSegment.js";
const STAGGER_MS = 80;
const ENTER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ENTER_DURATION_MS = 360;
const ENTER_OFFSET_PX = 28;
function formatRelativeTime(value, locale) {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) {
        return value;
    }
    const deltaMs = timestamp - Date.now();
    const absSeconds = Math.round(Math.abs(deltaMs) / 1000);
    const formatter = new Intl.RelativeTimeFormat(locale === "ko" ? "ko" : "en", { numeric: "auto" });
    if (absSeconds < 60) {
        return formatter.format(Math.sign(deltaMs) * absSeconds, "second");
    }
    const absMinutes = Math.round(absSeconds / 60);
    if (absMinutes < 60) {
        return formatter.format(Math.sign(deltaMs) * absMinutes, "minute");
    }
    const absHours = Math.round(absMinutes / 60);
    if (absHours < 24) {
        return formatter.format(Math.sign(deltaMs) * absHours, "hour");
    }
    return formatter.format(Math.sign(deltaMs) * Math.round(absHours / 24), "day");
}
function ActionChip({ label, active = false, disabled = false, onClick, children, }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": label, disabled: disabled, onClick: (event) => {
            event.stopPropagation();
            onClick();
        }, className: `inline-flex h-[26px] items-center justify-center rounded-full border px-[10px] text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${active
            ? "border-[var(--adaptive-accent-coral)] bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_18%,transparent)] text-[var(--adaptive-black900)]"
            : "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-tintOpacity200)]"}`, children: children ?? label }));
}
function NotificationCardActions({ item, messages, onAction, savedProbeCompareMode, setSavedProbeCompareMode, showCompare, }) {
    if (item.type === "element_missing" || item.type === "modal_marker") {
        const visible = item.payload.markersVisible ?? true;
        return (_jsxs("div", { className: "mt-[8px] flex flex-wrap items-center gap-[6px]", children: [_jsx(ActionChip, { label: messages.panel.detachedMarkerHide, active: !visible, onClick: () => onAction(item, "hide_markers") }), _jsx(ActionChip, { label: messages.panel.detachedMarkerShow, active: visible, onClick: () => onAction(item, "show_markers") })] }));
    }
    if (item.type === "probe_edit") {
        return (_jsxs("div", { className: "mt-[8px] flex flex-wrap items-center gap-[6px]", children: [_jsx(ActionChip, { label: messages.panel.probeEditModeReset, onClick: () => onAction(item, "probe_reset") }), _jsx(ActionChip, { label: messages.panel.probeEditModeUndo, disabled: !item.payload.canUndo, onClick: () => onAction(item, "probe_undo"), children: _jsx(ChevronLeftIcon, { className: "h-[14px] w-[14px]" }) }), _jsx(ActionChip, { label: messages.panel.probeEditModeRedo, disabled: !item.payload.canRedo, onClick: () => onAction(item, "probe_redo"), children: _jsx(ChevronRightIcon, { className: "h-[14px] w-[14px]" }) }), showCompare ? (_jsx(PickTargetCompareSegment, { mode: savedProbeCompareMode, onChange: setSavedProbeCompareMode, beforeLabel: messages.pickTarget.probeBefore, afterLabel: messages.pickTarget.probeAfter })) : null] }));
    }
    return null;
}
function NotificationCard({ item, index, entered, expandDirection, locale, messages, dismissAriaLabel, onOpen, onDismiss, onAction, stacked = false, savedProbeCompareMode, setSavedProbeCompareMode, showCompare, }) {
    const sticky = isStatusNotificationId(item.id);
    const enterOffset = expandDirection === "up" ? ENTER_OFFSET_PX : -ENTER_OFFSET_PX;
    return (_jsxs("article", { "data-fivepixels-interactive": "", className: `relative flex items-start gap-[10px] overflow-hidden rounded-[18px] border border-[var(--adaptive-border-subtle)] px-[14px] py-[12px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[16px] ${item.read
            ? "bg-[color-mix(in_srgb,var(--adaptive-black50)_88%,transparent)]"
            : "bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_14%,var(--adaptive-black50)_86%)]"}`, style: {
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0) scale(1)" : `translateY(${enterOffset}px) scale(0.96)`,
            transitionProperty: "opacity, transform",
            transitionDuration: `${ENTER_DURATION_MS}ms`,
            transitionTimingFunction: ENTER_EASE,
            transitionDelay: `${index * STAGGER_MS}ms`,
            willChange: "opacity, transform",
        }, children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onOpen(item), "aria-expanded": stacked ? false : undefined, className: "w-full text-left", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx("p", { className: "text-[13px] font-bold text-[var(--adaptive-black900)]", children: item.title }), _jsx("p", { className: "shrink-0 text-[10px] font-medium text-[var(--adaptive-black500)]", children: formatRelativeTime(item.createdAt, locale) })] }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.45] text-[var(--adaptive-black600)]", children: item.body })] }), !stacked ? (_jsx(NotificationCardActions, { item: item, messages: messages, onAction: onAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare })) : null] }), !stacked && !sticky ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": dismissAriaLabel, onClick: () => onDismiss(item.id), className: "mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })) : null] }));
}
function GroupHeader({ groupLabel, index, entered, expandDirection, messages, canCollapse, canClear, onCollapse, onClear, }) {
    const enterOffset = expandDirection === "up" ? ENTER_OFFSET_PX : -ENTER_OFFSET_PX;
    return (_jsxs("div", { className: "flex items-center justify-between gap-[8px] px-[4px]", style: {
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0) scale(1)" : `translateY(${enterOffset}px) scale(0.96)`,
            transitionProperty: "opacity, transform",
            transitionDuration: `${ENTER_DURATION_MS}ms`,
            transitionTimingFunction: ENTER_EASE,
            transitionDelay: `${index * STAGGER_MS}ms`,
        }, children: [_jsx("p", { className: "text-[12px] font-bold text-[var(--adaptive-black800)]", children: groupLabel }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [canCollapse ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onCollapse, className: "rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[10px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-tintOpacity200)]", children: messages.notifications.showLess })) : null, canClear ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.notifications.clearGroupAriaLabel, onClick: onClear, className: "flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })) : null] })] }));
}
function NotificationGroupStack({ group, groupLabel, index, entered, expanded, expandDirection, hasMultipleGroups, locale, messages, onToggle, onOpen, onDismiss, onClearGroup, onAction, savedProbeCompareMode, setSavedProbeCompareMode, showCompare, }) {
    const { items } = group;
    const latest = items[0];
    const canStack = items.length > 1;
    const clearableItems = items.filter((entry) => !isStatusNotificationId(entry.id));
    const useGroupedChrome = canStack || hasMultipleGroups;
    if (!latest) {
        return null;
    }
    if (!useGroupedChrome) {
        return (_jsx(NotificationCard, { item: latest, index: index, entered: entered, expandDirection: expandDirection, locale: locale, messages: messages, dismissAriaLabel: messages.notifications.dismissAriaLabel, onOpen: onOpen, onDismiss: onDismiss, onAction: onAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare }));
    }
    if (!canStack || expanded) {
        return (_jsxs("section", { className: "flex flex-col gap-[8px]", children: [_jsx(GroupHeader, { groupLabel: groupLabel, index: index, entered: entered, expandDirection: expandDirection, messages: messages, canCollapse: canStack, canClear: clearableItems.length > 0, onCollapse: () => onToggle(group.id), onClear: () => onClearGroup(clearableItems) }), items.map((item, itemIndex) => (_jsx(NotificationCard, { item: item, index: index + itemIndex, entered: entered, expandDirection: expandDirection, locale: locale, messages: messages, dismissAriaLabel: messages.notifications.dismissAriaLabel, onOpen: onOpen, onDismiss: onDismiss, onAction: onAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare }, item.id)))] }));
    }
    const stackDepth = Math.min(items.length - 1, 2);
    const stackGapStyle = expandDirection === "up"
        ? { marginTop: stackDepth * 6 }
        : { marginBottom: stackDepth * 6 };
    return (_jsxs("section", { className: "relative", style: stackGapStyle, children: [Array.from({ length: stackDepth }, (_, depth) => {
                const offset = (stackDepth - depth) * 6;
                const translate = expandDirection === "up" ? -offset : offset;
                return (_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-x-0 top-0 rounded-[18px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)]", style: {
                        height: "100%",
                        transform: `translateY(${translate}px) scale(${1 - (stackDepth - depth) * 0.015})`,
                        opacity: 0.55 - depth * 0.12,
                        zIndex: depth,
                    } }, `stack-${group.id}-${depth}`));
            }), _jsxs("div", { className: "relative z-[3]", children: [_jsx(NotificationCard, { item: latest, index: index, entered: entered, expandDirection: expandDirection, locale: locale, messages: messages, dismissAriaLabel: messages.notifications.dismissAriaLabel, onOpen: () => onToggle(group.id), onDismiss: onDismiss, onAction: onAction, stacked: true, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare }), _jsxs("div", { className: `pointer-events-none absolute left-[14px] z-[5] rounded-full bg-black/45 px-[8px] py-[2px] text-[10px] font-semibold text-white ${expandDirection === "up" ? "top-[10px]" : "bottom-[10px]"}`, children: [groupLabel, " \u00B7 ", messages.notifications.stackedCount(items.length)] })] })] }));
}
export function NotificationCenter({ embedded = false, open = true } = {}) {
    const { messages, locale } = useReportPreferences();
    const { notifications, markNotificationRead, dismissNotification, activateNotification, runNotificationAction, savedProbeCompareMode, setSavedProbeCompareMode, savedProbeEdits, } = useReportSession();
    const stackRef = useRef(null);
    const [entered, setEntered] = useState(false);
    const [mounted, setMounted] = useState(open);
    const [motionPhase, setMotionPhase] = useState(open ? "enter" : null);
    const [expandedGroups, setExpandedGroups] = useState(() => new Set());
    const showCompare = Object.keys(savedProbeEdits).length > 0;
    const anchor = useNotificationStackAnchor(!embedded && mounted, stackRef);
    const groups = useMemo(() => groupNotifications(notifications), [notifications]);
    const hasMultipleGroups = groups.length > 1;
    const expandDirection = embedded ? "up" : anchor.expandDirection;
    useEffect(() => {
        if (open) {
            setMounted(true);
            setMotionPhase("enter");
            return;
        }
        if (mounted) {
            setMotionPhase("exit");
        }
    }, [mounted, open]);
    useEffect(() => {
        if (!mounted || motionPhase !== "enter") {
            setEntered(false);
            return;
        }
        setEntered(false);
        const frame = window.requestAnimationFrame(() => {
            setEntered(true);
        });
        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [mounted, motionPhase]);
    const didAutoExpandMultiGroupsRef = useRef(false);
    useEffect(() => {
        if (!hasMultipleGroups) {
            didAutoExpandMultiGroupsRef.current = false;
            return;
        }
        if (didAutoExpandMultiGroupsRef.current) {
            return;
        }
        didAutoExpandMultiGroupsRef.current = true;
        setExpandedGroups(new Set(groups.filter((group) => group.items.length > 1).map((group) => group.id)));
    }, [groups, hasMultipleGroups]);
    useEffect(() => {
        setExpandedGroups((current) => {
            const next = new Set();
            for (const group of groups) {
                if (current.has(group.id) && group.items.length > 1) {
                    next.add(group.id);
                }
            }
            return next;
        });
    }, [groups]);
    const handleOpen = useCallback((item) => {
        markNotificationRead(item.id);
        activateNotification(item);
    }, [activateNotification, markNotificationRead]);
    const handleToggleGroup = useCallback((id) => {
        setExpandedGroups((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            }
            else {
                next.add(id);
            }
            return next;
        });
    }, []);
    const handleClearGroup = useCallback((items) => {
        for (const item of items) {
            dismissNotification(item.id);
        }
    }, [dismissNotification]);
    const groupLabel = useCallback((id) => (id === "system" ? messages.notifications.groupSystem : messages.notifications.groupUserAction), [messages.notifications.groupSystem, messages.notifications.groupUserAction]);
    const handleTrayAnimationEnd = useCallback((event) => {
        if (event.target !== event.currentTarget) {
            return;
        }
        if (motionPhase === "exit") {
            setMounted(false);
            setMotionPhase(null);
        }
    }, [motionPhase]);
    if (!mounted || groups.length === 0) {
        return null;
    }
    const trayMotionClass = motionPhase === "exit" ? MOTION.fadeScaleOut : MOTION.fadeScaleIn;
    return (_jsx("div", { ref: stackRef, role: "region", "aria-label": messages.notifications.windowAriaLabel, "data-chrome": "notification-stack", "data-expand-direction": expandDirection, onAnimationEnd: handleTrayAnimationEnd, className: embedded
            ? `pointer-events-none absolute inset-0 z-[20] flex items-end justify-end p-[16px] ${trayMotionClass}`
            : `pointer-events-none fixed z-[1000010] flex ${expandDirection === "up" ? "flex-col-reverse items-stretch" : "flex-col items-stretch"} ${trayMotionClass}`, style: embedded
            ? { transformOrigin: "bottom right" }
            : {
                zIndex: PANEL_LAYER_Z_INDEX + 20,
                transformOrigin: anchor.transformOrigin,
                ...anchor.style,
            }, children: _jsx("div", { className: `pointer-events-auto flex w-full max-w-[360px] gap-[12px] overflow-y-auto ${expandDirection === "up" ? "flex-col-reverse" : "flex-col"}`, children: groups.map((group, index) => (_jsx(NotificationGroupStack, { group: group, groupLabel: groupLabel(group.id), index: index, entered: entered, expanded: expandedGroups.has(group.id) || (hasMultipleGroups && group.items.length <= 1), expandDirection: expandDirection, hasMultipleGroups: hasMultipleGroups, locale: locale, messages: messages, onToggle: handleToggleGroup, onOpen: handleOpen, onDismiss: dismissNotification, onClearGroup: handleClearGroup, onAction: runNotificationAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare }, group.id))) }) }));
}
//# sourceMappingURL=NotificationCenter.js.map