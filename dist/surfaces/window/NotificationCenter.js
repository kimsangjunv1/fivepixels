import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../../shared/components/icons/Icons.js";
import { useNotificationStackAnchor } from "../../shared/hooks/useNotificationStackAnchor.js";
import { useReportPreferences, useReportSession } from "../../shared/providers/reportContext.js";
import { groupNotifications, isStatusNotificationId } from "../../shared/utils/notification/notificationGroups.js";
import { PANEL_LAYER_Z_INDEX } from "../../shared/utils/overlay/floatingWindowStack.js";
import { PickTargetCompareSegment } from "../../surfaces/tooltip/PickTargetCompareSegment.js";
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
function ActionChip({ label, active = false, disabled = false, onClick, children }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": label, disabled: disabled, onClick: (event) => {
            event.stopPropagation();
            onClick();
        }, className: `inline-flex items-center justify-center rounded-[8px] border px-[8px] py-[4px] text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${active
            ? "border-[var(--adaptive-accent-coral)] bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_18%,transparent)] text-[var(--adaptive-black900)]"
            : "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-tintOpacity200)]"}`, children: children ?? label }));
}
function NotificationCardActions({ item, messages, onAction, savedProbeCompareMode, setSavedProbeCompareMode, showCompare, }) {
    if (item.type === "element_missing" || item.type === "modal_marker") {
        const visible = item.payload.markersVisible ?? true;
        return (_jsxs("div", { className: "mt-[4px] flex flex-wrap items-center justify-end gap-[6px]", children: [_jsx(ActionChip, { label: messages.panel.detachedMarkerHide, active: !visible, onClick: () => onAction(item, "hide_markers") }), _jsx(ActionChip, { label: messages.panel.detachedMarkerShow, active: visible, onClick: () => onAction(item, "show_markers") })] }));
    }
    if (item.type === "probe_edit") {
        return (_jsxs("div", { className: "mt-[8px] flex flex-wrap items-center justify-between gap-[6px]", children: [_jsx("section", { className: "fle", children: showCompare ? (_jsx(PickTargetCompareSegment, { mode: savedProbeCompareMode, onChange: setSavedProbeCompareMode, beforeLabel: messages.pickTarget.probeBefore, afterLabel: messages.pickTarget.probeAfter })) : null }), _jsxs("section", { className: "flex items-center gap-[8px]", children: [_jsx(ActionChip, { label: messages.panel.probeEditModeReset, onClick: () => onAction(item, "probe_reset") }), _jsx("div", { className: "bg-[var(--adaptive-border-subtle)] h-[20px] w-[0.1px]" }), _jsxs("section", { className: "flex items-center gap-[4px]", children: [_jsx(ActionChip, { label: messages.panel.probeEditModeUndo, disabled: !item.payload.canUndo, onClick: () => onAction(item, "probe_undo"), children: _jsx(ChevronLeftIcon, { className: "h-[14px] w-[14px]" }) }), _jsx(ActionChip, { label: messages.panel.probeEditModeRedo, disabled: !item.payload.canRedo, onClick: () => onAction(item, "probe_redo"), children: _jsx(ChevronRightIcon, { className: "h-[14px] w-[14px]" }) })] })] })] }));
    }
    return null;
}
function NotificationCard({ item, locale, messages, dismissAriaLabel, onOpen, onDismiss, onAction, stacked = false, savedProbeCompareMode, setSavedProbeCompareMode, showCompare, }) {
    const sticky = isStatusNotificationId(item.id);
    return (_jsxs("article", { "data-fivepixels-interactive": "", className: "relative flex items-start gap-[4px] rounded-[16px] bg-[var(--adaptive-fillOpacity700)] px-[12px] py-[8px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[16px]", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onOpen(item), "aria-expanded": stacked ? false : undefined, className: "w-full text-left", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-black700)]", children: item.title }), _jsx("p", { className: "shrink-0 text-[12px] font-medium text-[var(--adaptive-black500)]", children: formatRelativeTime(item.createdAt, locale) })] }), _jsx("p", { className: "mt-[4px] text-[14px] leading-[1.5] text-[var(--adaptive-black500)]", children: item.body })] }), !stacked ? (_jsx(NotificationCardActions, { item: item, messages: messages, onAction: onAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare })) : null] }), !stacked && !sticky ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": dismissAriaLabel, onClick: () => onDismiss(item.id), className: "mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })) : null] }));
}
function GroupHeader({ groupLabel, messages, canCollapse, canClear, onCollapse, onClear, }) {
    return (_jsxs("div", { className: "flex items-center justify-between gap-[8px] px-[4px]", children: [_jsx("p", { className: "text-[16px] font-bold text-[var(--adaptive-black700)]", children: groupLabel }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [canCollapse ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onCollapse, className: "rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black700)] px-[8px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-black200)] hover:bg-[var(--adaptive-tintOpacity200)]", children: messages.notifications.showLess })) : null, canClear ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.notifications.clearGroupAriaLabel, onClick: onClear, className: "flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })) : null] })] }));
}
function NotificationGroupStack({ group, groupLabel, expanded, expandDirection, hasMultipleGroups, locale, messages, onToggle, onOpen, onDismiss, onClearGroup, onAction, savedProbeCompareMode, setSavedProbeCompareMode, showCompare, }) {
    const { items } = group;
    const latest = items[0];
    const canStack = items.length > 1;
    const clearableItems = items.filter((entry) => !isStatusNotificationId(entry.id));
    const useGroupedChrome = canStack || hasMultipleGroups;
    if (!latest) {
        return null;
    }
    if (!useGroupedChrome) {
        return (_jsx(NotificationCard, { item: latest, locale: locale, messages: messages, dismissAriaLabel: messages.notifications.dismissAriaLabel, onOpen: onOpen, onDismiss: onDismiss, onAction: onAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare }));
    }
    if (!canStack || expanded) {
        return (_jsxs("section", { className: "flex flex-col gap-[4px]", children: [_jsx(GroupHeader, { groupLabel: groupLabel, messages: messages, canCollapse: canStack, canClear: clearableItems.length > 0, onCollapse: () => onToggle(group.id), onClear: () => onClearGroup(clearableItems) }), items.map((item) => (_jsx(NotificationCard, { item: item, locale: locale, messages: messages, dismissAriaLabel: messages.notifications.dismissAriaLabel, onOpen: onOpen, onDismiss: onDismiss, onAction: onAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare }, item.id)))] }));
    }
    const stackDepth = Math.min(items.length - 1, 2);
    const stackGapStyle = expandDirection === "up" ? { marginTop: stackDepth * 6 } : { marginBottom: stackDepth * 6 };
    // Keep the group pill on the side opposite the panel so it is not sandwiched between panel and card.
    const badgeAboveCard = expandDirection === "up";
    return (_jsxs("section", { className: "relative flex flex-col items-center", style: stackGapStyle, children: [badgeAboveCard ? (_jsxs("div", { className: "pointer-events-none z-[5] mb-[4px] rounded-full bg-black/45 px-[8px] py-[2px] text-[12px] font-semibold text-white", children: [groupLabel, " \u00B7 ", messages.notifications.stackedCount(items.length)] })) : null, _jsxs("div", { className: "relative z-[3] w-full", children: [Array.from({ length: stackDepth }, (_, depth) => {
                        const offset = (stackDepth - depth) * 6;
                        const translate = expandDirection === "up" ? -offset : offset;
                        return (_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-x-0 top-0 rounded-[16px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)]", style: {
                                height: "100%",
                                transform: `translateY(${translate}px) scale(${1 - (stackDepth - depth) * 0.015})`,
                                opacity: 0.55 - depth * 0.12,
                                zIndex: depth,
                            } }, `stack-${group.id}-${depth}`));
                    }), _jsx(NotificationCard, { item: latest, locale: locale, messages: messages, dismissAriaLabel: messages.notifications.dismissAriaLabel, onOpen: () => onToggle(group.id), onDismiss: onDismiss, onAction: onAction, stacked: true, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare })] }), !badgeAboveCard ? (_jsxs("div", { className: "pointer-events-none z-[5] mt-[4px] rounded-full bg-black/45 px-[8px] py-[2px] text-[12px] font-semibold text-white", children: [groupLabel, " \u00B7 ", messages.notifications.stackedCount(items.length)] })) : null] }));
}
export function NotificationCenter({ embedded = false, open = true } = {}) {
    const { messages, locale } = useReportPreferences();
    const { notifications, markNotificationRead, dismissNotification, activateNotification, runNotificationAction, savedProbeCompareMode, setSavedProbeCompareMode, savedProbeEdits } = useReportSession();
    const stackRef = useRef(null);
    const [expandedGroups, setExpandedGroups] = useState(() => new Set());
    const showCompare = Object.keys(savedProbeEdits).length > 0;
    const groups = useMemo(() => groupNotifications(notifications), [notifications]);
    const hasMultipleGroups = groups.length > 1;
    // Only measure while the tray DOM exists — open+empty used to measure with a null ref and stick on fallback.
    const stackActive = !embedded && open && groups.length > 0;
    const anchor = useNotificationStackAnchor(stackActive, stackRef);
    const expandDirection = embedded ? "up" : anchor.expandDirection;
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
    if (!open || groups.length === 0) {
        return null;
    }
    return (_jsx("div", { ref: stackRef, role: "region", "aria-label": messages.notifications.windowAriaLabel, "data-chrome": "notification-stack", "data-expand-direction": expandDirection, className: embedded
            ? "pointer-events-none absolute inset-0 z-[20] flex items-end justify-end overflow-y-auto p-[16px]"
            : `pointer-events-none fixed z-[1000010] flex overflow-y-auto ${expandDirection === "up" ? "flex-col-reverse items-stretch" : "flex-col items-stretch"}`, style: embedded
            ? undefined
            : {
                zIndex: PANEL_LAYER_Z_INDEX + 20,
                visibility: anchor.ready ? "visible" : "hidden",
                ...anchor.style,
            }, children: _jsx("div", { className: `pointer-events-auto flex w-full max-w-[360px] gap-[12px] p-[8px] ${expandDirection === "up" ? "flex-col-reverse" : "flex-col"}`, children: groups.map((group) => (_jsx(NotificationGroupStack, { group: group, groupLabel: groupLabel(group.id), expanded: expandedGroups.has(group.id) || (hasMultipleGroups && group.items.length <= 1), expandDirection: expandDirection, hasMultipleGroups: hasMultipleGroups, locale: locale, messages: messages, onToggle: handleToggleGroup, onOpen: handleOpen, onDismiss: dismissNotification, onClearGroup: handleClearGroup, onAction: runNotificationAction, savedProbeCompareMode: savedProbeCompareMode, setSavedProbeCompareMode: setSavedProbeCompareMode, showCompare: showCompare }, group.id))) }) }));
}
//# sourceMappingURL=NotificationCenter.js.map