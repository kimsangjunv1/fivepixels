import { useCallback, useRef, useState, type DragEvent } from "react";
import type { ReportMessages } from "@/i18n/types.js";
import {
    createFeedbackBackupFilename,
    downloadFeedbackJson,
    findFeedbackInsertConflicts,
    insertFeedbackItems,
    isImportProjectCompatible,
    parseFeedbackCommandJson,
    pickFeedbackJsonFile,
    readAllFeedback,
    readFeedbackJsonFile,
    toReportProject,
    upsertFeedbackItems,
    writeAllFeedback,
    type FeedbackImportPayload,
    type FeedbackInsertConflict,
} from "@/utils/feedbackDataTransfer.js";

export type FeedbackTransferScope = {
    projectId: string;
    environment?: string;
    appVersion?: string;
};

export type ImportStep = "none" | "project-mismatch" | "confirm";
export type CommandStep = "none" | "replace-confirm";

function buildCommandSuccessMessage(messages: ReportMessages, inserted: number, replaced: number) {
    if (replaced > 0 && inserted > 0) {
        return messages.errors.commandSuccessInsertedReplaced(inserted, replaced);
    }

    if (replaced > 0) {
        return messages.errors.commandSuccessReplaced(replaced);
    }

    return messages.errors.commandSuccessInserted(inserted);
}

function isJsonDragEvent(event: DragEvent) {
    const types = Array.from(event.dataTransfer.types);

    return types.includes("Files") || types.includes("application/json");
}

function isJsonFile(file: File) {
    return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}

type UsePanelFeedbackTransferOptions = {
    transferScope: FeedbackTransferScope;
    canTransferFeedback: boolean;
    messages: ReportMessages;
    setErrorMessage: (message: string) => void;
    refetch: () => Promise<unknown>;
    openPanelTab: (tab: "command" | "settings") => void;
    onPanelOverlayClose?: () => void;
    isRecording: boolean;
};

export function usePanelFeedbackTransfer({
    transferScope,
    canTransferFeedback,
    messages,
    setErrorMessage,
    refetch,
    openPanelTab,
    onPanelOverlayClose,
    isRecording,
}: UsePanelFeedbackTransferOptions) {
    const { projectId, environment, appVersion } = transferScope;
    const [isDragOver, setIsDragOver] = useState(false);
    const [pendingImport, setPendingImport] = useState<FeedbackImportPayload | null>(null);
    const [importStep, setImportStep] = useState<ImportStep>("none");
    const [pendingCommand, setPendingCommand] = useState<FeedbackImportPayload | null>(null);
    const [commandConflicts, setCommandConflicts] = useState<FeedbackInsertConflict[]>([]);
    const [commandStep, setCommandStep] = useState<CommandStep>("none");
    const [commandNotice, setCommandNotice] = useState<{ message: string; isError: boolean } | null>(null);
    const dragDepthRef = useRef(0);

    const closePanelOverlay = useCallback(() => {
        onPanelOverlayClose?.();
    }, [onPanelOverlayClose]);

    const queueImport = useCallback(
        (payload: FeedbackImportPayload) => {
            closePanelOverlay();
            setPendingImport(payload);
            setImportStep(isImportProjectCompatible(transferScope, payload.project) ? "confirm" : "project-mismatch");
            setErrorMessage("");
        },
        [closePanelOverlay, setErrorMessage, transferScope],
    );

    const handleImportFile = useCallback(
        async (file: File) => {
            if (!canTransferFeedback) {
                setErrorMessage(messages.errors.localStorageTransferOnly);
                return;
            }

            try {
                const payload = await readFeedbackJsonFile(file);
                queueImport(payload);
            } catch (nextError) {
                setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.jsonImportFailed);
            }
        },
        [canTransferFeedback, messages.errors, queueImport, setErrorMessage],
    );

    const handleExport = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage(messages.errors.localStorageTransferOnly);
            return;
        }

        closePanelOverlay();
        const items = readAllFeedback(transferScope);

        void downloadFeedbackJson(createFeedbackBackupFilename(projectId, environment, appVersion), toReportProject(transferScope), items).then((result) => {
            if (result === "failed") {
                setErrorMessage(messages.errors.jsonExportFailed);
                return;
            }

            if (result === "cancelled") {
                return;
            }

            setErrorMessage("");
        });
    }, [canTransferFeedback, closePanelOverlay, environment, messages.errors, projectId, setErrorMessage, transferScope, appVersion]);

    const handleImportFromMenu = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage(messages.errors.localStorageTransferOnly);
            return;
        }

        closePanelOverlay();

        void pickFeedbackJsonFile()
            .then((file) => {
                if (!file) {
                    return;
                }

                return handleImportFile(file);
            })
            .catch((error) => {
                setErrorMessage(error instanceof Error ? error.message : messages.errors.jsonImportFailed);
            });
    }, [canTransferFeedback, closePanelOverlay, handleImportFile, messages.errors, setErrorMessage]);

    const handleOpenCommand = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage(messages.errors.localStorageCommandOnly);
            return;
        }

        closePanelOverlay();
        setErrorMessage("");
        openPanelTab("command");
    }, [canTransferFeedback, closePanelOverlay, messages.errors, openPanelTab, setErrorMessage]);

    const handleCloseCommand = useCallback(() => {
        setCommandStep("none");
        setPendingCommand(null);
        setCommandConflicts([]);
        openPanelTab("settings");
    }, [openPanelTab]);

    const handleCommandExecute = useCallback(
        async (raw: string) => {
            if (!canTransferFeedback) {
                throw new Error(messages.errors.localStorageCommandOnly);
            }

            const payload = parseFeedbackCommandJson(raw);
            const conflicts = findFeedbackInsertConflicts(transferScope, payload.items);

            if (conflicts.length > 0) {
                setPendingCommand(payload);
                setCommandConflicts(conflicts);
                setCommandStep("replace-confirm");
                return { status: "pending" as const };
            }

            const result = insertFeedbackItems(transferScope, payload.items);

            await refetch();
            setErrorMessage("");

            return {
                status: "success" as const,
                message: buildCommandSuccessMessage(messages, result.inserted, result.replaced),
            };
        },
        [canTransferFeedback, messages, refetch, setErrorMessage, transferScope],
    );

    const handleCancelCommandReplace = useCallback(() => {
        setPendingCommand(null);
        setCommandConflicts([]);
        setCommandStep("none");
    }, []);

    const handleConfirmCommandReplace = useCallback(() => {
        if (!pendingCommand) {
            return;
        }

        const payload = pendingCommand;

        void (async () => {
            const result = upsertFeedbackItems(transferScope, payload.items);

            await refetch();
            setErrorMessage("");
            setPendingCommand(null);
            setCommandConflicts([]);
            setCommandStep("none");
            setCommandNotice({
                message: buildCommandSuccessMessage(messages, result.inserted, result.replaced),
                isError: false,
            });
        })();
    }, [messages, pendingCommand, refetch, setErrorMessage, transferScope]);

    const applyImport = useCallback(
        async (payload: FeedbackImportPayload) => {
            writeAllFeedback(transferScope, payload.items);
            setPendingImport(null);
            setImportStep("none");
            await refetch();
        },
        [refetch, transferScope],
    );

    const handleCancelImport = useCallback(() => {
        setPendingImport(null);
        setImportStep("none");
    }, []);

    const handleProceedImportAfterMismatch = useCallback(() => {
        setImportStep("confirm");
    }, []);

    const handleApplyImport = useCallback(() => {
        if (!pendingImport) {
            return;
        }

        void applyImport(pendingImport);
    }, [applyImport, pendingImport]);

    const handleBackupAndApplyImport = useCallback(() => {
        if (!pendingImport) {
            return;
        }

        const currentItems = readAllFeedback(transferScope);
        const pending = pendingImport;

        void downloadFeedbackJson(createFeedbackBackupFilename(projectId, environment, appVersion), toReportProject(transferScope), currentItems).then((result) => {
            if (result === "cancelled" || result === "failed") {
                if (result === "failed") {
                    setErrorMessage(messages.errors.backupExportFailedAbortImport);
                }

                return;
            }

            void applyImport(pending);
        });
    }, [applyImport, environment, messages.errors, pendingImport, projectId, setErrorMessage, transferScope, appVersion]);

    const handleDragEnter = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            if (isRecording || !canTransferFeedback || importStep !== "none" || commandStep !== "none") {
                return;
            }

            if (!isJsonDragEvent(event)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current += 1;
            setIsDragOver(true);
        },
        [canTransferFeedback, commandStep, importStep, isRecording],
    );

    const handleDragLeave = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            if (isRecording || !canTransferFeedback) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

            if (dragDepthRef.current === 0) {
                setIsDragOver(false);
            }
        },
        [canTransferFeedback, isRecording],
    );

    const handleDragOver = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            if (isRecording || !canTransferFeedback || importStep !== "none" || commandStep !== "none") {
                return;
            }

            if (!isJsonDragEvent(event)) {
                return;
            }

            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
        },
        [canTransferFeedback, commandStep, importStep, isRecording],
    );

    const handleDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            if (isRecording || !canTransferFeedback || importStep !== "none" || commandStep !== "none") {
                return;
            }

            event.preventDefault();
            dragDepthRef.current = 0;
            setIsDragOver(false);

            const file = Array.from(event.dataTransfer.files).find(isJsonFile);

            if (!file) {
                setErrorMessage(messages.errors.jsonFileOnly);
                return;
            }

            void handleImportFile(file);
        },
        [canTransferFeedback, commandStep, handleImportFile, importStep, isRecording, messages.errors, setErrorMessage],
    );

    return {
        isDragOver,
        pendingImport,
        importStep,
        pendingCommand,
        commandConflicts,
        commandStep,
        commandNotice,
        setCommandNotice,
        handleExport,
        handleImportFromMenu,
        handleOpenCommand,
        handleCloseCommand,
        handleCommandExecute,
        handleCancelCommandReplace,
        handleConfirmCommandReplace,
        handleCancelImport,
        handleProceedImportAfterMismatch,
        handleApplyImport,
        handleBackupAndApplyImport,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
    };
}
