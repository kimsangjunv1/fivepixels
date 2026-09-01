import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ApiFlowEntry } from "@/types/networkMonitor.js";
import type { NotificationItem } from "@/types/notification.js";
import type { ReportFeedback, ReportReply } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
import { getNotificationsStorageKey } from "@/constants/storageKeys.js";
import { diffNotifications, type FeedbackSnapshot, type NotificationActor } from "@/utils/notification/notificationDiff.js";

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

        return parsed.items.filter((item) => item && typeof item.id === "string");
    } catch {
        return [];
    }
}

function persistNotifications(storageKey: string, items: NotificationItem[]) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify({ items } satisfies StoredNotifications));
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

            return [...appended, ...currentItems].slice(0, 100);
        });
    }, [activeApiFailureAlert, getRepliesForReport, messages, sessionActor?.id, sessionActor?.name, sourceReports]);

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
        setNotifications((current) => current.filter((item) => item.id !== id));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
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
    };
}
