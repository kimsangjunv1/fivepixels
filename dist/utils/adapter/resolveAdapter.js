import { isRemoteLoginMethod } from "../../constants/loginMethod.js";
import { createLocalStorageReportAdapter } from "../../storage/local/localStorageAdapter.js";
export function hasCustomAdapter(adapter) {
    if (!adapter) {
        return false;
    }
    const hasRequired = Boolean(adapter.markers?.list && adapter.feedback?.create);
    const hasUpdate = Boolean(adapter.feedback?.update || adapter.cases?.update);
    return hasRequired && hasUpdate;
}
export function resolveAdapterMissingHandlers(adapter) {
    const missing = [];
    if (!adapter?.markers?.list) {
        missing.push("adapter.markers.list");
    }
    if (!adapter?.feedback?.create) {
        missing.push("adapter.feedback.create");
    }
    if (!adapter?.feedback?.update && !adapter?.cases?.update) {
        missing.push("adapter.feedback.update");
        missing.push("adapter.cases.update");
    }
    return missing;
}
export function resolveAdapterPersistenceStatus(adapter, sync = "local") {
    const requiresRemotePersistence = isRemoteLoginMethod(sync);
    const missingHandlers = resolveAdapterMissingHandlers(adapter);
    const hasPartialAdapter = Boolean(adapter &&
        (adapter.markers?.list ||
            adapter.feedback?.create ||
            adapter.feedback?.update ||
            adapter.cases?.update ||
            adapter.replies?.list ||
            adapter.replies?.create));
    if (hasCustomAdapter(adapter)) {
        return { mode: "API", missingHandlers: [], ignoredHandlers: [] };
    }
    if (requiresRemotePersistence) {
        return {
            mode: "unavailable",
            missingHandlers,
            ignoredHandlers: [],
        };
    }
    if (!hasPartialAdapter) {
        return { mode: "localStorage", missingHandlers: [], ignoredHandlers: [] };
    }
    return {
        mode: "conflict",
        missingHandlers,
        ignoredHandlers: [],
    };
}
function mergeCasesIntoFeedback(feedback, cases) {
    return {
        ...feedback,
        cases,
    };
}
export function createStorageAdapterFromFivePixelsAdapter(adapter) {
    const { markers, feedback, cases, replies } = adapter;
    return {
        list: async ({ pathname }) => {
            if (!markers?.list) {
                throw new Error("[fivepixels] adapter.markers.list is required.");
            }
            return markers.list({ pathname });
        },
        create: async (payload) => {
            if (!feedback?.create) {
                throw new Error("[fivepixels] adapter.feedback.create is required.");
            }
            return feedback.create(payload);
        },
        update: async (id, payload) => {
            if (feedback?.update) {
                return feedback.update(id, payload);
            }
            if (payload.cases && cases?.update) {
                const updatedCases = [];
                for (const caseItem of payload.cases) {
                    updatedCases.push(await cases.update(id, caseItem.id, caseItem));
                }
                const resolvedBase = feedback?.get
                    ? await feedback.get(id)
                    : {
                        id,
                        cases: updatedCases,
                    };
                return mergeCasesIntoFeedback(resolvedBase, updatedCases);
            }
            throw new Error("[fivepixels] adapter.feedback.update or adapter.cases.update is required.");
        },
        listReplies: replies?.list
            ? async (feedbackId, params) => {
                const caseId = params?.caseId;
                if (!caseId) {
                    throw new Error("[fivepixels] caseId is required in ListRepliesParams for adapter.replies.list.");
                }
                return replies.list(feedbackId, caseId, params);
            }
            : undefined,
        createReply: replies?.create
            ? async (feedbackId, payload) => {
                const caseId = payload.case_ids?.[0];
                if (!caseId) {
                    throw new Error("[fivepixels] case_ids[0] is required for adapter.replies.create.");
                }
                return replies.create(feedbackId, caseId, payload);
            }
            : undefined,
        remove: feedback?.delete,
    };
}
export function createUnavailableReportAdapter() {
    const unavailable = async () => {
        throw new Error("[fivepixels] Persistence adapter is not configured. Pass adapter.markers.list, adapter.feedback.create, and adapter.feedback.update (or adapter.cases.update).");
    };
    return {
        list: async () => [],
        create: unavailable,
        update: unavailable,
    };
}
export function resolveStorageAdapterFromAdapter({ projectId, environment, appVersion, sync = "local", adapter, }) {
    const persistenceStatus = resolveAdapterPersistenceStatus(adapter, sync);
    if (hasCustomAdapter(adapter)) {
        return {
            adapter: createStorageAdapterFromFivePixelsAdapter(adapter),
            usesLocalStorage: false,
            persistenceStatus: { mode: "API", missingHandlers: [], ignoredHandlers: [] },
            fivePixelsAdapter: adapter,
        };
    }
    if (persistenceStatus.mode === "unavailable") {
        console.warn("[fivepixels] Remote sync requires adapter.markers.list, adapter.feedback.create, and adapter.feedback.update (or adapter.cases.update). localStorage feedback is disabled.", persistenceStatus.missingHandlers);
        return {
            adapter: createUnavailableReportAdapter(),
            usesLocalStorage: false,
            persistenceStatus,
            fivePixelsAdapter: adapter,
        };
    }
    if (persistenceStatus.mode === "conflict") {
        console.warn("[fivepixels] Incomplete adapter configuration. Falling back to localStorage.", persistenceStatus.missingHandlers);
    }
    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
        persistenceStatus,
        fivePixelsAdapter: adapter,
    };
}
export async function hydrateFeedbackFromAdapter(adapter, report) {
    const { feedback, cases } = adapter;
    let next = report;
    if (feedback?.getForUi) {
        next = await feedback.getForUi(report.id);
    }
    else if (feedback?.get) {
        next = await feedback.get(report.id);
    }
    if (cases?.list) {
        const caseItems = await cases.list(report.id);
        next = mergeCasesIntoFeedback(next, caseItems);
    }
    return next;
}
export function adapterUsesLazyCases(adapter) {
    return Boolean(adapter?.feedback?.getForUi || adapter?.feedback?.get || adapter?.cases?.list);
}
export function adapterUsesLazyReplies(adapter) {
    return Boolean(adapter?.replies?.list || adapter?.cases?.getTimeline);
}
export function adapterUsesCreateReply(adapter) {
    return Boolean(adapter?.replies?.create);
}
//# sourceMappingURL=resolveAdapter.js.map