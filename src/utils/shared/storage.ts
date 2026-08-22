import { isRemoteLoginMethod, type FivePixelsSync } from "@/constants/loginMethod.js";
import { createLocalStorageReportAdapter } from "@/storage/local/localStorageAdapter.js";
import type { ReportPersistenceHandlers, ReportStorageAdapter } from "@/types/report.js";

export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    sync?: FivePixelsSync;
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
      }
    | {
          /** Remote sync (`api` / `artemis`) without a complete persistence API — no localStorage fallback. */
          mode: "unavailable";
          missingHandlers: RequiredPersistenceHandlerName[];
          ignoredHandlers: PersistenceHandlerName[];
      };

export function hasCustomPersistenceHandlers(
    options: Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">,
): options is Required<Pick<ResolveStorageAdapterOptions, "onList" | "onCreate" | "onUpdate">> {
    return Boolean(options.onList && options.onCreate && options.onUpdate);
}

export function resolvePersistenceStatus(
    options: Pick<ResolveStorageAdapterOptions, PersistenceHandlerName | "sync">,
): PersistenceStatus {
    const sync = options.sync ?? "local";
    const providedHandlers = PERSISTENCE_HANDLER_NAMES.filter((name) => Boolean(options[name]));
    const missingHandlers = REQUIRED_PERSISTENCE_HANDLER_NAMES.filter((name) => !options[name]);
    const requiresRemotePersistence = isRemoteLoginMethod(sync);

    if (missingHandlers.length === 0 && providedHandlers.length > 0) {
        return { mode: "API", missingHandlers: [], ignoredHandlers: [] };
    }

    if (hasCustomPersistenceHandlers(options)) {
        return { mode: "API", missingHandlers: [], ignoredHandlers: [] };
    }

    if (requiresRemotePersistence) {
        return {
            mode: "unavailable",
            missingHandlers: [...missingHandlers],
            ignoredHandlers: providedHandlers,
        };
    }

    if (providedHandlers.length === 0) {
        return { mode: "localStorage", missingHandlers: [], ignoredHandlers: [] };
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

/** No localStorage reads — used when remote sync requires API persistence that is not wired. */
export function createUnavailableReportAdapter(): ReportStorageAdapter {
    const unavailable = async () => {
        throw new Error("[fivepixels] Persistence API is not configured. Pass onList, onCreate, and onUpdate.");
    };

    return {
        list: async () => [],
        create: unavailable,
        update: unavailable,
    };
}

export function resolveStorageAdapter({
    projectId,
    environment,
    appVersion,
    sync = "local",
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
        sync,
        onList,
        onListAll,
        onListReplies,
        onCreate,
        onCreateReply,
        onUpdate,
        onDelete,
    });

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
            persistenceStatus: { mode: "API", missingHandlers: [], ignoredHandlers: [] },
        };
    }

    if (persistenceStatus.mode === "unavailable") {
        console.warn(
            "[fivepixels] Remote sync requires onList, onCreate, and onUpdate. localStorage feedback is disabled until those handlers are provided.",
            persistenceStatus.missingHandlers,
        );
        return {
            adapter: createUnavailableReportAdapter(),
            usesLocalStorage: false,
            persistenceStatus,
        };
    }

    if (persistenceStatus.mode === "conflict") {
        console.warn(
            "[fivepixels] Custom persistence requires onList, onCreate, and onUpdate together. Falling back to localStorage.",
        );
    }

    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
        persistenceStatus,
    };
}
