import { useCallback, useState } from "react";
import { FloatingWindow, type FloatingWindowMode } from "@/components/ui/FloatingWindow.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import type { NotificationItem } from "@/types/notification.js";

function formatRelativeTime(value: string, locale: string) {
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
    const {
        notifications,
        closeNotificationUi,
        notificationWindowPosition,
        setNotificationWindowPosition,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearNotifications,
        activateNotification,
    } = useReportSession();
    const [mode, setMode] = useState<FloatingWindowMode>("normal");

    const handleOpen = useCallback(
        (item: NotificationItem) => {
            markNotificationRead(item.id);
            activateNotification(item);
        },
        [activateNotification, markNotificationRead],
    );

    return (
        <FloatingWindow
            dataChrome="notification-center"
            role="dialog"
            ariaLabel={messages.notifications.windowAriaLabel}
            position={notificationWindowPosition}
            onPositionChange={setNotificationWindowPosition}
            mode={mode}
            onModeChange={setMode}
            width={320}
            height={420}
            minWidth={260}
            minHeight={220}
            resizable
            resizeAriaLabel={messages.marker.resizeAriaLabel}
            contentClassName="px-[0] pb-[0]"
            controls={{
                onClose: closeNotificationUi,
                closeAriaLabel: messages.marker.windowCloseAriaLabel,
                minimizeAriaLabel: messages.marker.windowMinimizeAriaLabel,
                maximizeAriaLabel: messages.marker.windowMaximizeAriaLabel,
                restoreAriaLabel: messages.marker.windowRestoreAriaLabel,
                moreAriaLabel: messages.marker.windowControlsMoreAriaLabel,
            }}
            title={<span className="truncate text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.notifications.title}</span>}
            headerRight={
                <div className="flex items-center gap-[4px]">
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={markAllNotificationsRead}
                        className="rounded-[6px] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-tintOpacity200)]"
                    >
                        {messages.notifications.markAllRead}
                    </button>
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={clearNotifications}
                        className="rounded-[6px] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-tintOpacity200)]"
                    >
                        {messages.notifications.clearAll}
                    </button>
                </div>
            }
        >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {notifications.length === 0 ? (
                    <p className="px-[12px] py-[16px] text-[12px] text-[var(--adaptive-black500)]">{messages.notifications.empty}</p>
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-start gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] ${
                                    item.read ? "bg-transparent" : "bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_14%,transparent)]"
                                }`}
                            >
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    onClick={() => handleOpen(item)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{item.title}</p>
                                    <p className="mt-[2px] text-[11px] text-[var(--adaptive-black600)]">{item.body}</p>
                                    <p className="mt-[4px] text-[10px] text-[var(--adaptive-black500)]">{formatRelativeTime(item.createdAt, locale)}</p>
                                </button>
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    aria-label={messages.notifications.dismissAriaLabel}
                                    onClick={() => dismissNotification(item.id)}
                                    className="mt-[2px] rounded-[6px] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)]"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FloatingWindow>
    );
}
