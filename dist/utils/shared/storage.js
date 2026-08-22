import { isRemoteLoginMethod } from "../../constants/loginMethod.js";
import { createLocalStorageReportAdapter } from "../../storage/local/localStorageAdapter.js";
const REQUIRED_PERSISTENCE_HANDLER_NAMES = ["onList", "onCreate", "onUpdate"];
const PERSISTENCE_HANDLER_NAMES = [
    "onList",
    "onListAll",
    "onListReplies",
    "onCreate",
    "onCreateReply",
    "onUpdate",
    "onDelete",
];
export function hasCustomPersistenceHandlers(options) {
    return Boolean(options.onList && options.onCreate && options.onUpdate);
}
export function resolvePersistenceStatus(options) {
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
function createStorageAdapterFromHandlers(handlers) {
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
export function createUnavailableReportAdapter() {
    const unavailable = async () => {
        throw new Error("[fivepixels] Persistence API is not configured. Pass onList, onCreate, and onUpdate.");
    };
    return {
        list: async () => [],
        create: unavailable,
        update: unavailable,
    };
}
export function resolveStorageAdapter({ projectId, environment, appVersion, sync = "local", onList, onListAll, onListReplies, onCreate, onCreateReply, onUpdate, onDelete, }) {
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
                onList: onList,
                onListAll,
                onListReplies,
                onCreate: onCreate,
                onCreateReply,
                onUpdate: onUpdate,
                onDelete,
            }),
            usesLocalStorage: false,
            persistenceStatus: { mode: "API", missingHandlers: [], ignoredHandlers: [] },
        };
    }
    if (persistenceStatus.mode === "unavailable") {
        console.warn("[fivepixels] Remote sync requires onList, onCreate, and onUpdate. localStorage feedback is disabled until those handlers are provided.", persistenceStatus.missingHandlers);
        return {
            adapter: createUnavailableReportAdapter(),
            usesLocalStorage: false,
            persistenceStatus,
        };
    }
    if (persistenceStatus.mode === "conflict") {
        console.warn("[fivepixels] Custom persistence requires onList, onCreate, and onUpdate together. Falling back to localStorage.");
    }
    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
        persistenceStatus,
    };
}
//# sourceMappingURL=storage.js.map