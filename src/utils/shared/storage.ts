import { createLocalStorageReportAdapter } from "@/storage/local/localStorageAdapter.js";
import type { ReportPersistenceHandlers, ReportStorageAdapter } from "@/types/report.js";

export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    onList?: ReportPersistenceHandlers["onList"];
    onListAll?: ReportPersistenceHandlers["onListAll"];
    onListReplies?: ReportPersistenceHandlers["onListReplies"];
    onCreate?: ReportPersistenceHandlers["onCreate"];
    onCreateReply?: ReportPersistenceHandlers["onCreateReply"];
    onUpdate?: ReportPersistenceHandlers["onUpdate"];
    onDelete?: ReportPersistenceHandlers["onDelete"];
};

export function hasCustomPersistenceHandlers(
    options: Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">,
): options is Required<Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">> {
    return Boolean(options.onList && options.onCreate && options.onUpdate);
}

function createStorageAdapterFromHandlers(
    handlers: Required<Pick<ReportPersistenceHandlers, "onList" | "onCreate" | "onUpdate">> &
        Pick<ReportPersistenceHandlers, "onDelete" | "onListAll" | "onListReplies" | "onCreateReply">,
): ReportStorageAdapter {
    return {
        list: handlers.onList,
        listAll: handlers.onListAll,
        listReplies: handlers.onListReplies,
        create: handlers.onCreate,
        createReply: handlers.onCreateReply,
        update: handlers.onUpdate,
        remove: handlers.onDelete,
    };
}

export function resolveStorageAdapter({
    projectId,
    environment,
    appVersion,
    onList,
    onListAll,
    onListReplies,
    onCreate,
    onCreateReply,
    onUpdate,
    onDelete,
}: ResolveStorageAdapterOptions): {
    adapter: ReportStorageAdapter;
    usesLocalStorage: boolean;
} {
    const hasPartialCustom = Boolean(onList || onListAll || onListReplies || onCreate || onCreateReply || onUpdate || onDelete);

    if (hasPartialCustom && !hasCustomPersistenceHandlers({ onList, onCreate, onUpdate })) {
        console.warn(
            "[fivepixels] Custom persistence requires onList, onCreate, and onUpdate together. Falling back to localStorage.",
        );
    }

    if (hasCustomPersistenceHandlers({ onList, onCreate, onUpdate })) {
        return {
            adapter: createStorageAdapterFromHandlers({
                onList: onList!,
                onListAll,
                onListReplies,
                onCreate: onCreate!,
                onCreateReply,
                onUpdate: onUpdate!,
                onDelete,
            }),
            usesLocalStorage: false,
        };
    }

    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
    };
}
