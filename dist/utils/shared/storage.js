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
export function resolveStorageAdapter({ projectId, environment, appVersion, onList, onListAll, onListReplies, onCreate, onCreateReply, onUpdate, onDelete, }) {
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
        console.warn("[fivepixels] Custom persistence requires onList, onCreate, and onUpdate together. Falling back to localStorage.");
    }
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
            persistenceStatus,
        };
    }
    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
        persistenceStatus,
    };
}
//# sourceMappingURL=storage.js.map