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

const REQUIRED_PERSISTENCE_HANDLER_NAMES = ["onList", "onCreate", "onUpdate"] as const;
const PERSISTENCE_HANDLER_NAMES = [
    "onList",
    "onListAll",
    "onListReplies",
    "onCreate",
    "onCreateReply",
    "onUpdate",
    "onDelete",
] as const;

export type RequiredPersistenceHandlerName = (typeof REQUIRED_PERSISTENCE_HANDLER_NAMES)[number];
export type PersistenceHandlerName = (typeof PERSISTENCE_HANDLER_NAMES)[number];
export type PersistenceStatus =
    | { mode: "localStorage"; missingHandlers: []; ignoredHandlers: [] }
    | { mode: "API"; missingHandlers: []; ignoredHandlers: [] }
    | {
          mode: "conflict";
          missingHandlers: RequiredPersistenceHandlerName[];
          ignoredHandlers: PersistenceHandlerName[];
      };

export function hasCustomPersistenceHandlers(
    options: Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">,
): options is Required<Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">> {
    return Boolean(options.onList && options.onCreate && options.onUpdate);
}

export function resolvePersistenceStatus(
    options: Pick<ResolveStorageAdapterOptions, PersistenceHandlerName>,
): PersistenceStatus {
    const providedHandlers = PERSISTENCE_HANDLER_NAMES.filter((name) => Boolean(options[name]));

    if (providedHandlers.length === 0) {
        return { mode: "localStorage", missingHandlers: [], ignoredHandlers: [] };
    }

    const missingHandlers = REQUIRED_PERSISTENCE_HANDLER_NAMES.filter((name) => !options[name]);

    if (missingHandlers.length === 0) {
        return { mode: "API", missingHandlers: [], ignoredHandlers: [] };
    }

    return {
        mode: "conflict",
        missingHandlers,
        ignoredHandlers: providedHandlers,
    };
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
    persistenceStatus: PersistenceStatus;
} {
    const persistenceStatus = resolvePersistenceStatus({
        onList,
        onListAll,
        onListReplies,
        onCreate,
        onCreateReply,
        onUpdate,
        onDelete,
    });

    if (persistenceStatus.mode === "conflict") {
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
            persistenceStatus,
        };
    }

    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
        persistenceStatus,
    };
}
