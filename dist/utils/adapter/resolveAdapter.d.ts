import { type FivePixelsSync } from "../../constants/loginMethod.js";
import type { FivePixelsAdapter } from "../../types/adapter.js";
import type { ReportFeedback, ReportStorageAdapter } from "../../types/report.js";
export type PersistenceStatus = {
    mode: "localStorage";
    missingHandlers: [];
    ignoredHandlers: [];
} | {
    mode: "API";
    missingHandlers: [];
    ignoredHandlers: [];
} | {
    mode: "conflict";
    missingHandlers: AdapterHandlerName[];
    ignoredHandlers: AdapterHandlerName[];
} | {
    mode: "unavailable";
    missingHandlers: AdapterHandlerName[];
    ignoredHandlers: AdapterHandlerName[];
};
export type AdapterHandlerName = "adapter.markers.list" | "adapter.feedback.create" | "adapter.feedback.update" | "adapter.cases.update" | "adapter.feedback.delete" | "adapter.replies.list" | "adapter.replies.create" | "adapter.auth.login" | "adapter.auth.signup" | "adapter.auth.artemisLogin" | "adapter.session.getMe" | "adapter.session.activitySummary" | "adapter.session.panelBootstrap" | "adapter.cases.list" | "adapter.cases.getTimeline" | "adapter.members.list" | "adapter.members.create" | "adapter.members.update" | "adapter.members.delete" | "github.onCreate";
export declare function hasCustomAdapter(adapter?: FivePixelsAdapter): adapter is FivePixelsAdapter;
export declare function resolveAdapterMissingHandlers(adapter?: FivePixelsAdapter): AdapterHandlerName[];
export declare function resolveAdapterPersistenceStatus(adapter: FivePixelsAdapter | undefined, sync?: FivePixelsSync): PersistenceStatus;
export declare function createStorageAdapterFromFivePixelsAdapter(adapter: FivePixelsAdapter): ReportStorageAdapter;
export declare function createUnavailableReportAdapter(): ReportStorageAdapter;
export type ResolveStorageAdapterFromAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    sync?: FivePixelsSync;
    adapter?: FivePixelsAdapter;
};
export declare function resolveStorageAdapterFromAdapter({ projectId, environment, appVersion, sync, adapter, }: ResolveStorageAdapterFromAdapterOptions): {
    adapter: ReportStorageAdapter;
    usesLocalStorage: boolean;
    persistenceStatus: PersistenceStatus;
    fivePixelsAdapter?: FivePixelsAdapter;
};
export declare function hydrateFeedbackFromAdapter(adapter: FivePixelsAdapter, report: ReportFeedback): Promise<ReportFeedback>;
export declare function adapterUsesLazyCases(adapter?: FivePixelsAdapter): boolean;
export declare function adapterUsesLazyReplies(adapter?: FivePixelsAdapter): boolean;
export declare function adapterUsesCreateReply(adapter?: FivePixelsAdapter): boolean;
export declare function adapterCanDelete(adapter?: FivePixelsAdapter): boolean;
export declare function adapterCanListAll(_adapter?: FivePixelsAdapter): boolean;
//# sourceMappingURL=resolveAdapter.d.ts.map