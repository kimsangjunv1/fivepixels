import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ApiFlowEntry } from "@/shared/types/networkMonitor.js";
import type { NotificationItem } from "@/shared/types/notification.js";
import type { ReportFeedback, ReportReply } from "@/shared/types/report.js";
import type { ReportMessages } from "@/shared/i18n/types.js";
import { getNotificationsStorageKey } from "@/shared/constants/storageKeys.js";
import { diffNotifications, type FeedbackSnapshot, type NotificationActor } from "@/shared/utils/notification/notificationDiff.js";
import { isStatusNotificationId, mergeStickyNotifications } from "@/shared/utils/notification/notificationGroups.js";

type StoredNotifications = {
    items: NotificationItem[];
};

function readStoredNotifications(storageKey: string): NotificationItem[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(storageKey);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as StoredNotifications;

        if (!Array.isArray(parsed.items)) {
            return [];
        }

        // Sticky status notifications are rebuilt from live session state.
        return parsed.items.filter((item) => item && typeof item.id === "string" && !isStatusNotificationId(item.id));
    } catch {
        return [];
    }
}

function persistNotifications(storageKey: string, items: NotificationItem[]) {
    try {
        const durable = items.filter((item) => !isStatusNotificationId(item.id));
        window.localStorage.setItem(storageKey, JSON.stringify({ items: durable } satisfies StoredNotifications));
    } catch {
        // Ignore storage failures.
    }
}

type UseNotificationCenterParams = {
    projectId?: string;
    messages: ReportMessages;
    sessionActor: NotificationActor | null;
    reports: ReportFeedback[];
    allPageReports: ReportFeedback[];
    getRepliesForReport?: (reportId: string) => ReportReply[];
    activeApiFailureAlert: ApiFlowEntry | null;
};

export function useNotificationCenter({
    projectId,
    messages,
    sessionActor,
    reports,
    allPageReports,
    getRepliesForReport,
    activeApiFailureAlert,
}: UseNotificationCenterParams) {
    const actorId = sessionActor?.id ?? null;
    const storageKey = useMemo(() => getNotificationsStorageKey(projectId, actorId), [actorId, projectId]);
    const [notifications, setNotifications] = useState<NotificationItem[]>(() => readStoredNotifications(storageKey));
    const [notificationUiOpen, setNotificationUiOpen] = useState(false);
    const previousSnapshotRef = useRef<Map<string, FeedbackSnapshot>>(new Map());
    const previousApiFailureIdRef = useRef<string | null>(null);
    const bootstrappedRef = useRef(false);
    const storageKeyRef = useRef(storageKey);

    useEffect(() => {
        if (storageKeyRef.current === storageKey) {
            return;
        }

        storageKeyRef.current = storageKey;
        bootstrappedRef.current = false;
        previousSnapshotRef.current = new Map();
        previousApiFailureIdRef.current = null;
        setNotifications(readStoredNotifications(storageKey));
    }, [storageKey]);

    useEffect(() => {
        persistNotifications(storageKey, notifications);
    }, [notifications, storageKey]);

    const sourceReports = useMemo(() => {
        if (allPageReports.length > 0) {
            return allPageReports;
        }

        return reports;
    }, [allPageReports, reports]);

    useEffect(() => {
        const actor: NotificationActor = {
            id: sessionActor?.id ?? null,
            name: sessionActor?.name ?? null,
        };

        const current: FeedbackSnapshot[] = sourceReports.map((report) => ({
            report,
            replies: getRepliesForReport?.(report.id) ?? report.replies ?? [],
        }));

        if (!bootstrappedRef.current) {
            previousSnapshotRef.current = new Map(current.map((item) => [item.report.id, item]));
            previousApiFailureIdRef.current = activeApiFailureAlert?.id ?? null;
            bootstrappedRef.current = true;
            return;
        }

        const created = diffNotifications({
            previous: previousSnapshotRef.current,
            current,
            actor,
            messages,
            apiFailure: activeApiFailureAlert,
            previousApiFailureId: previousApiFailureIdRef.current,
        });

        previousSnapshotRef.current = new Map(current.map((item) => [item.report.id, item]));
        previousApiFailureIdRef.current = activeApiFailureAlert?.id ?? null;

        if (created.length === 0) {
            return;
        }

        setNotifications((currentItems) => {
            const existingIds = new Set(currentItems.map((item) => item.id));
            const appended = created.filter((item) => !existingIds.has(item.id));

            if (appended.length === 0) {
                return currentItems;
            }

            setNotificationUiOpen(true);
            return [...appended, ...currentItems].slice(0, 100);
        });
    }, [activeApiFailureAlert, getRepliesForReport, messages, sessionActor?.id, sessionActor?.name, sourceReports]);

    const syncStickyNotifications = useCallback((stickyItems: NotificationItem[]) => {
        setNotifications((currentItems) => {
            const previousStickyIds = new Set(currentItems.filter((item) => isStatusNotificationId(item.id)).map((item) => item.id));
            const addedSticky = stickyItems.some((item) => !previousStickyIds.has(item.id));
            const next = mergeStickyNotifications(currentItems, stickyItems);

            if (addedSticky) {
                setNotificationUiOpen(true);
            }

            const unchanged =
                next.length === currentItems.length &&
                next.every((item, index) => {
                    const previous = currentItems[index];
                    return (
                        previous &&
                        previous.id === item.id &&
                        previous.title === item.title &&
                        previous.body === item.body &&
                        previous.read === item.read &&
                        previous.payload.markersVisible === item.payload.markersVisible &&
                        previous.payload.canUndo === item.payload.canUndo &&
                        previous.payload.canRedo === item.payload.canRedo
                    );
                });

            return unchanged ? currentItems : next;
        });
    }, []);

    const unreadNotificationCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

    const toggleNotificationUiOpen = useCallback(() => {
        setNotificationUiOpen((current) => !current);
    }, []);

    const closeNotificationUi = useCallback(() => {
        setNotificationUiOpen(false);
    }, []);

    const markNotificationRead = useCallback((id: string) => {
        setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    }, []);

    const markAllNotificationsRead = useCallback(() => {
        setNotifications((current) => current.map((item) => (item.read ? item : { ...item, read: true })));
    }, []);

    const dismissNotification = useCallback((id: string) => {
        if (isStatusNotificationId(id)) {
            return;
        }

        setNotifications((current) => current.filter((item) => item.id !== id));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications((current) => current.filter((item) => isStatusNotificationId(item.id)));
    }, []);

    return {
        notifications,
        unreadNotificationCount,
        notificationUiOpen,
        setNotificationUiOpen,
        toggleNotificationUiOpen,
        closeNotificationUi,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearNotifications,
        syncStickyNotifications,
    };
}
