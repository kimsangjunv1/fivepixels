import { createLocalStorageReportAdapter } from "../../storage/local/localStorageAdapter.js";
export function hasCustomPersistenceHandlers(options) {
    return Boolean(options.onList && options.onCreate && options.onUpdate);
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
    const hasPartialCustom = Boolean(onList || onListAll || onListReplies || onCreate || onCreateReply || onUpdate || onDelete);
    if (hasPartialCustom && !hasCustomPersistenceHandlers({ onList, onCreate, onUpdate })) {
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
        };
    }
    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
    };
}
//# sourceMappingURL=storage.js.map