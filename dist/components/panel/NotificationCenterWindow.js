import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { FloatingWindow } from "../../components/ui/FloatingWindow.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
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
export function NotificationCenterWindow() {
    const { messages, locale } = useReportPreferences();
    const { notifications, closeNotificationUi, notificationWindowPosition, setNotificationWindowPosition, markNotificationRead, markAllNotificationsRead, dismissNotification, clearNotifications, activateNotification, } = useReportSession();
    const [mode, setMode] = useState("normal");
    const handleOpen = useCallback((item) => {
        markNotificationRead(item.id);
        activateNotification(item);
    }, [activateNotification, markNotificationRead]);
    return (_jsx(FloatingWindow, { dataChrome: "notification-center", role: "dialog", ariaLabel: messages.notifications.windowAriaLabel, position: notificationWindowPosition, onPositionChange: setNotificationWindowPosition, mode: mode, onModeChange: setMode, width: 320, height: 420, minWidth: 260, minHeight: 220, resizable: true, resizeAriaLabel: messages.marker.resizeAriaLabel, contentClassName: "px-[0] pb-[0]", controls: {
            onClose: closeNotificationUi,
            closeAriaLabel: messages.marker.windowCloseAriaLabel,
            minimizeAriaLabel: messages.marker.windowMinimizeAriaLabel,
            maximizeAriaLabel: messages.marker.windowMaximizeAriaLabel,
            restoreAriaLabel: messages.marker.windowRestoreAriaLabel,
            moreAriaLabel: messages.marker.windowControlsMoreAriaLabel,
        }, title: _jsx("span", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.notifications.title }), headerRight: _jsxs("div", { className: "flex items-center gap-[4px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: markAllNotificationsRead, className: "rounded-[6px] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-tintOpacity200)]", children: messages.notifications.markAllRead }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onPointerDown: (event) => event.stopPropagation(), onClick: clearNotifications, className: "rounded-[6px] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-tintOpacity200)]", children: messages.notifications.clearAll })] }), children: _jsx("div", { className: "flex min-h-0 flex-1 flex-col overflow-hidden", children: notifications.length === 0 ? (_jsx("p", { className: "px-[12px] py-[16px] text-[12px] text-[var(--adaptive-black500)]", children: messages.notifications.empty })) : (_jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: notifications.map((item) => (_jsxs("div", { className: `flex items-start gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] ${item.read ? "bg-transparent" : "bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_14%,transparent)]"}`, children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => handleOpen(item), className: "min-w-0 flex-1 text-left", children: [_jsx("p", { className: "text-[12px] font-bold text-[var(--adaptive-black900)]", children: item.title }), _jsx("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black600)]", children: item.body }), _jsx("p", { className: "mt-[4px] text-[10px] text-[var(--adaptive-black500)]", children: formatRelativeTime(item.createdAt, locale) })] }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.notifications.dismissAriaLabel, onClick: () => dismissNotification(item.id), className: "mt-[2px] rounded-[6px] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)]", children: "\u00D7" })] }, item.id))) })) }) }));
}
//# sourceMappingURL=NotificationCenterWindow.js.map