import { useCallback, useEffect, useState } from "react";
import { CloseIcon } from "@/shared/components/icons/Icons.js";
import { OverlayShell } from "@/shared/components/ui/OverlayShell.js";
import { useReportPreferences, useReportSession } from "@/shared/providers/reportContext.js";
import type { NotificationItem } from "@/shared/types/notification.js";
import { PANEL_LAYER_Z_INDEX } from "@/shared/utils/overlay/floatingWindowStack.js";

const STAGGER_MS = 100;
const ENTER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ENTER_DURATION_MS = 360;
const ENTER_OFFSET_PX = 28;

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

function NotificationCard({
    item,
    index,
    entered,
    locale,
    dismissAriaLabel,
    onOpen,
    onDismiss,
}: {
    item: NotificationItem;
    index: number;
    entered: boolean;
    locale: string;
    dismissAriaLabel: string;
    onOpen: (item: NotificationItem) => void;
    onDismiss: (id: string) => void;
}) {
    return (
        <article
            data-fivepixels-interactive=""
            className={`relative flex items-start gap-[10px] overflow-hidden rounded-[18px] border border-[var(--adaptive-border-subtle)] px-[14px] py-[12px] shadow-[var(--adaptive-popup-shadow)] ${
                item.read ? "bg-[var(--adaptive-black50)]" : "bg-[color-mix(in_srgb,var(--adaptive-accent-coral)_12%,var(--adaptive-black50))]"
            }`}
            style={{
                opacity: entered ? 1 : 0,
                transform: entered ? "translateY(0)" : `translateY(${ENTER_OFFSET_PX}px)`,
                transitionProperty: "opacity, transform",
                transitionDuration: `${ENTER_DURATION_MS}ms`,
                transitionTimingFunction: ENTER_EASE,
                transitionDelay: `${index * STAGGER_MS}ms`,
                willChange: "opacity, transform",
            }}
        >
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={() => onOpen(item)}
                className="min-w-0 flex-1 text-left"
            >
                <div className="flex items-start justify-between gap-[8px]">
                    <p className="text-[13px] font-bold text-[var(--adaptive-black900)]">{item.title}</p>
                    <p className="shrink-0 text-[10px] font-medium text-[var(--adaptive-black500)]">{formatRelativeTime(item.createdAt, locale)}</p>
                </div>
                <p className="mt-[4px] text-[12px] leading-[1.45] text-[var(--adaptive-black600)]">{item.body}</p>
            </button>
            <button
                type="button"
                data-fivepixels-interactive=""
                aria-label={dismissAriaLabel}
                onClick={() => onDismiss(item.id)}
                className="mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]"
            >
                <CloseIcon className="h-[12px] w-[12px]" />
            </button>
        </article>
    );
}

export function NotificationCenter() {
    const { messages, locale } = useReportPreferences();
    const {
        notifications,
        closeNotificationUi,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearNotifications,
        activateNotification,
    } = useReportSession();
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setEntered(true);
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, []);

    const handleOpen = useCallback(
        (item: NotificationItem) => {
            markNotificationRead(item.id);
            activateNotification(item);
        },
        [activateNotification, markNotificationRead],
    );

    const footerIndex = notifications.length === 0 ? 0 : notifications.length;
    const actionsIndex = footerIndex + 1;

    return (
        <OverlayShell
            shell="modal"
            open
            onClose={closeNotificationUi}
            ariaLabel={messages.notifications.windowAriaLabel}
            dataChrome="notification-center"
            zIndex={PANEL_LAYER_Z_INDEX + 10}
            backdropStyle={{
                background: "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.72) 55%, rgba(0, 0, 0, 0.92) 100%)",
            }}
            panelClassName="pointer-events-auto absolute inset-y-0 right-0 flex w-full max-w-[380px] flex-col justify-end"
        >
            <div className="flex max-h-[min(88dvh,920px)] flex-col gap-[10px] overflow-y-auto px-[16px] pb-[18px] pt-[48px]">
                    {notifications.length === 0 ? (
                        <div
                            className="rounded-[18px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[14px] py-[18px] text-center shadow-[var(--adaptive-popup-shadow)]"
                            style={{
                                opacity: entered ? 1 : 0,
                                transform: entered ? "translateY(0)" : `translateY(${ENTER_OFFSET_PX}px)`,
                                transitionProperty: "opacity, transform",
                                transitionDuration: `${ENTER_DURATION_MS}ms`,
                                transitionTimingFunction: ENTER_EASE,
                                transitionDelay: "0ms",
                            }}
                        >
                            <p className="text-[12px] text-[var(--adaptive-black500)]">{messages.notifications.empty}</p>
                        </div>
                    ) : (
                        notifications.map((item, index) => (
                            <NotificationCard
                                key={item.id}
                                item={item}
                                index={index}
                                entered={entered}
                                locale={locale}
                                dismissAriaLabel={messages.notifications.dismissAriaLabel}
                                onOpen={handleOpen}
                                onDismiss={dismissNotification}
                            />
                        ))
                    )}

                    <div
                        className="flex items-center justify-between gap-[8px] rounded-[16px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[12px] py-[10px] shadow-[var(--adaptive-popup-shadow)]"
                        style={{
                            opacity: entered ? 1 : 0,
                            transform: entered ? "translateY(0)" : `translateY(${ENTER_OFFSET_PX}px)`,
                            transitionProperty: "opacity, transform",
                            transitionDuration: `${ENTER_DURATION_MS}ms`,
                            transitionTimingFunction: ENTER_EASE,
                            transitionDelay: `${footerIndex * STAGGER_MS}ms`,
                        }}
                    >
                        <p className="text-[12px] font-bold text-[var(--adaptive-black900)]">{messages.notifications.title}</p>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            aria-label={messages.marker.windowCloseAriaLabel}
                            onClick={closeNotificationUi}
                            className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]"
                        >
                            <CloseIcon className="h-[14px] w-[14px]" />
                        </button>
                    </div>

                    <div
                        className="flex items-center justify-end gap-[6px]"
                        style={{
                            opacity: entered ? 1 : 0,
                            transform: entered ? "translateY(0)" : `translateY(${ENTER_OFFSET_PX}px)`,
                            transitionProperty: "opacity, transform",
                            transitionDuration: `${ENTER_DURATION_MS}ms`,
                            transitionTimingFunction: ENTER_EASE,
                            transitionDelay: `${actionsIndex * STAGGER_MS}ms`,
                        }}
                    >
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={markAllNotificationsRead}
                            className="rounded-[8px] px-[8px] py-[4px] text-[11px] font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            {messages.notifications.markAllRead}
                        </button>
                        <button
                            type="button"
                            data-fivepixels-interactive=""
                            onClick={clearNotifications}
                            className="rounded-[8px] px-[8px] py-[4px] text-[11px] font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            {messages.notifications.clearAll}
                        </button>
                    </div>
            </div>
        </OverlayShell>
    );
}
