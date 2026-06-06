import { createLocalStorageReportAdapter } from "../storage/local/localStorageAdapter.js";
import type { ReportPersistenceHandlers, ReportStorageAdapter } from "../types/report.js";

export type ResolveStorageAdapterOptions = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    onList?: ReportPersistenceHandlers["onList"];
    onCreate?: ReportPersistenceHandlers["onCreate"];
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
        Pick<ReportPersistenceHandlers, "onDelete">,
): ReportStorageAdapter {
    return {
        list: handlers.onList,
        create: handlers.onCreate,
        update: handlers.onUpdate,
        remove: handlers.onDelete,
    };
}

export function resolveStorageAdapter({
    projectId,
    environment,
    appVersion,
    onList,
    onCreate,
    onUpdate,
    onDelete,
}: ResolveStorageAdapterOptions): {
    adapter: ReportStorageAdapter;
    usesLocalStorage: boolean;
} {
    const hasPartialCustom = Boolean(onList || onCreate || onUpdate || onDelete);

    if (hasPartialCustom && !hasCustomPersistenceHandlers({ onList, onCreate, onUpdate })) {
        console.warn(
            "[stitchable] Custom persistence requires onList, onCreate, and onUpdate together. Falling back to localStorage.",
        );
    }

    if (hasCustomPersistenceHandlers({ onList, onCreate, onUpdate })) {
        return {
            adapter: createStorageAdapterFromHandlers({
                onList: onList!,
                onCreate: onCreate!,
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
