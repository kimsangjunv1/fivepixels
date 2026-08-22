import { isRemoteLoginMethod, type FivePixelsSync } from "@/constants/loginMethod.js";
import { createLocalStorageReportAdapter } from "@/storage/local/localStorageAdapter.js";
import type { FivePixelsAdapter } from "@/types/adapter.js";
import type {
    CreateReplyPayload,
    CreateReportFeedbackPayload,
    ListRepliesParams,
    ReportCase,
    ReportFeedback,
    ReportStorageAdapter,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";

export type PersistenceStatus =
    | { mode: "localStorage"; missingHandlers: []; ignoredHandlers: [] }
    | { mode: "API"; missingHandlers: []; ignoredHandlers: [] }
    | {
          mode: "conflict";
          missingHandlers: AdapterHandlerName[];
          ignoredHandlers: AdapterHandlerName[];
      }
    | {
          mode: "unavailable";
          missingHandlers: AdapterHandlerName[];
          ignoredHandlers: AdapterHandlerName[];
      };

export type AdapterHandlerName =
    | "adapter.markers.list"
    | "adapter.feedback.create"
    | "adapter.feedback.update"
    | "adapter.cases.update"
    | "adapter.feedback.delete"
    | "adapter.replies.list"
    | "adapter.replies.create"
    | "adapter.auth.login"
    | "adapter.auth.signup"
    | "adapter.auth.artemisLogin"
    | "adapter.session.getMe"
    | "adapter.session.activitySummary"
    | "adapter.session.panelBootstrap"
    | "adapter.cases.list"
    | "adapter.cases.getTimeline"
    | "adapter.members.list"
    | "adapter.members.create"
    | "adapter.members.update"
    | "adapter.members.delete"
    | "github.onCreate";

const REQUIRED_ADAPTER_HANDLERS: AdapterHandlerName[] = [
    "adapter.markers.list",
    "adapter.feedback.create",
];

const UPDATE_ADAPTER_HANDLERS: AdapterHandlerName[] = ["adapter.feedback.update", "adapter.cases.update"];

export function hasCustomAdapter(adapter?: FivePixelsAdapter): adapter is FivePixelsAdapter {
    if (!adapter) {
        return false;
    }

    const hasRequired = Boolean(adapter.markers?.list && adapter.feedback?.create);
    const hasUpdate = Boolean(adapter.feedback?.update || adapter.cases?.update);

    return hasRequired && hasUpdate;
}

export function resolveAdapterMissingHandlers(adapter?: FivePixelsAdapter): AdapterHandlerName[] {
    const missing: AdapterHandlerName[] = [];

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

export function resolveAdapterPersistenceStatus(
    adapter: FivePixelsAdapter | undefined,
    sync: FivePixelsSync = "local",
): PersistenceStatus {
    const requiresRemotePersistence = isRemoteLoginMethod(sync);
    const missingHandlers = resolveAdapterMissingHandlers(adapter);
    const hasPartialAdapter = Boolean(
        adapter &&
            (adapter.markers?.list ||
                adapter.feedback?.create ||
                adapter.feedback?.update ||
                adapter.cases?.update ||
                adapter.replies?.list ||
                adapter.replies?.create),
    );

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

function mergeCasesIntoFeedback(feedback: ReportFeedback, cases: ReportCase[]): ReportFeedback {
    return {
        ...feedback,
        cases,
    };
}

export function createStorageAdapterFromFivePixelsAdapter(adapter: FivePixelsAdapter): ReportStorageAdapter {
    const { markers, feedback, cases, replies } = adapter;

    return {
        list: async ({ pathname }) => {
            if (!markers?.list) {
                throw new Error("[fivepixels] adapter.markers.list is required.");
            }

            return markers.list({ pathname });
        },

        create: async (payload: CreateReportFeedbackPayload) => {
            if (!feedback?.create) {
                throw new Error("[fivepixels] adapter.feedback.create is required.");
            }

            return feedback.create(payload);
        },

        update: async (id: string, payload: UpdateReportFeedbackPayload) => {
            if (feedback?.update) {
                return feedback.update(id, payload);
            }

            if (payload.cases && cases?.update) {
                const updatedCases: ReportCase[] = [];

                for (const caseItem of payload.cases) {
                    updatedCases.push(await cases.update(id, caseItem.id, caseItem));
                }

                const resolvedBase = feedback?.get
                    ? await feedback.get(id)
                    : ({
                          id,
                          cases: updatedCases,
                      } as ReportFeedback);

                return mergeCasesIntoFeedback(resolvedBase, updatedCases);
            }

            throw new Error("[fivepixels] adapter.feedback.update or adapter.cases.update is required.");
        },

        listReplies: replies?.list
            ? async (feedbackId: string, params?: ListRepliesParams) => {
                  const caseId = params?.caseId;

                  if (!caseId) {
                      throw new Error("[fivepixels] caseId is required in ListRepliesParams for adapter.replies.list.");
                  }

                  return replies.list!(feedbackId, caseId, params);
              }
            : undefined,

        createReply: replies?.create
            ? async (feedbackId: string, payload: CreateReplyPayload) => {
                  const caseId = payload.case_ids?.[0];

                  if (!caseId) {
                      throw new Error("[fivepixels] case_ids[0] is required for adapter.replies.create.");
                  }

                  return replies.create!(feedbackId, caseId, payload);
              }
            : undefined,

        remove: feedback?.delete,
    };
}

export function createUnavailableReportAdapter(): ReportStorageAdapter {
    const unavailable = async () => {
        throw new Error(
            "[fivepixels] Persistence adapter is not configured. Pass adapter.markers.list, adapter.feedback.create, and adapter.feedback.update (or adapter.cases.update).",
        );
    };

    return {
        list: async () => [],
        create: unavailable,
        update: unavailable,
    };
}

export type ResolveStorageAdapterFromAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    sync?: FivePixelsSync;
    adapter?: FivePixelsAdapter;
};

export function resolveStorageAdapterFromAdapter({
    projectId,
    environment,
    appVersion,
    sync = "local",
    adapter,
}: ResolveStorageAdapterFromAdapterOptions): {
    adapter: ReportStorageAdapter;
    usesLocalStorage: boolean;
    persistenceStatus: PersistenceStatus;
    fivePixelsAdapter?: FivePixelsAdapter;
} {
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
        console.warn(
            "[fivepixels] Remote sync requires adapter.markers.list, adapter.feedback.create, and adapter.feedback.update (or adapter.cases.update). localStorage feedback is disabled.",
            persistenceStatus.missingHandlers,
        );
        return {
            adapter: createUnavailableReportAdapter(),
            usesLocalStorage: false,
            persistenceStatus,
            fivePixelsAdapter: adapter,
        };
    }

    if (persistenceStatus.mode === "conflict") {
        console.warn(
            "[fivepixels] Incomplete adapter configuration. Falling back to localStorage.",
            persistenceStatus.missingHandlers,
        );
    }

    return {
        adapter: createLocalStorageReportAdapter({ projectId, environment, appVersion }),
        usesLocalStorage: true,
        persistenceStatus,
        fivePixelsAdapter: adapter,
    };
}

export async function hydrateFeedbackFromAdapter(
    adapter: FivePixelsAdapter,
    report: ReportFeedback,
): Promise<ReportFeedback> {
    const { feedback, cases } = adapter;
    let next = report;

    if (feedback?.getForUi) {
        next = await feedback.getForUi(report.id);
    } else if (feedback?.get) {
        next = await feedback.get(report.id);
    }

    if (cases?.list) {
        const caseItems = await cases.list(report.id);
        next = mergeCasesIntoFeedback(next, caseItems);
    }

    return next;
}

export function adapterUsesLazyCases(adapter?: FivePixelsAdapter): boolean {
    return Boolean(adapter?.feedback?.getForUi || adapter?.feedback?.get || adapter?.cases?.list);
}

export function adapterUsesLazyReplies(adapter?: FivePixelsAdapter): boolean {
    return Boolean(adapter?.replies?.list || adapter?.cases?.getTimeline);
}

export function adapterUsesCreateReply(adapter?: FivePixelsAdapter): boolean {
    return Boolean(adapter?.replies?.create);
}

export function adapterCanDelete(adapter?: FivePixelsAdapter): boolean {
    return Boolean(adapter?.feedback?.delete);
}

export function adapterCanListAll(_adapter?: FivePixelsAdapter): boolean {
    return false;
}
