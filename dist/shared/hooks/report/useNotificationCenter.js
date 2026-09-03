import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNotificationsStorageKey } from "../../../shared/constants/storageKeys.js";
import { diffNotifications } from "../../../shared/utils/notification/notificationDiff.js";
function readStoredNotifications(storageKey) {
    if (typeof window === "undefined") {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.items)) {
            return [];
        }
        return parsed.items.filter((item) => item && typeof item.id === "string");
    }
    catch {
        return [];
    }
}
function persistNotifications(storageKey, items) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify({ items }));
    }
    catch {
        // Ignore storage failures.
    }
}
export function useNotificationCenter({ projectId, messages, sessionActor, reports, allPageReports, getRepliesForReport, activeApiFailureAlert, }) {
    const actorId = sessionActor?.id ?? null;
    const storageKey = useMemo(() => getNotificationsStorageKey(projectId, actorId), [actorId, projectId]);
    const [notifications, setNotifications] = useState(() => readStoredNotifications(storageKey));
    const [notificationUiOpen, setNotificationUiOpen] = useState(false);
    const previousSnapshotRef = useRef(new Map());
    const previousApiFailureIdRef = useRef(null);
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
        const actor = {
            id: sessionActor?.id ?? null,
            name: sessionActor?.name ?? null,
        };
        const current = sourceReports.map((report) => ({
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
    const markNotificationRead = useCallback((id) => {
        setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    }, []);
    const markAllNotificationsRead = useCallback(() => {
        setNotifications((current) => current.map((item) => (item.read ? item : { ...item, read: true })));
    }, []);
    const dismissNotification = useCallback((id) => {
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
//# sourceMappingURL=useNotificationCenter.js.map