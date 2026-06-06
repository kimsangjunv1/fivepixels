import { useCallback, useRef, useState } from "react";
import { createFeedbackBackupFilename, downloadFeedbackJson, findFeedbackInsertConflicts, insertFeedbackItems, isImportProjectCompatible, parseFeedbackCommandJson, pickFeedbackJsonFile, readAllFeedback, readFeedbackJsonFile, toReportProject, upsertFeedbackItems, writeAllFeedback, } from "../utils/feedbackDataTransfer.js";
function buildCommandSuccessMessage(inserted, replaced) {
    if (replaced > 0 && inserted > 0) {
        return `${inserted}건 삽입, ${replaced}건 교체가 완료되었어요.`;
    }
    if (replaced > 0) {
        return `${replaced}건의 피드백 데이터가 교체되었어요.`;
    }
    return `${inserted}건의 피드백 데이터가 삽입되었어요.`;
}
function isJsonDragEvent(event) {
    const types = Array.from(event.dataTransfer.types);
    return types.includes("Files") || types.includes("application/json");
}
function isJsonFile(file) {
    return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}
export function usePanelFeedbackTransfer({ transferScope, canTransferFeedback, setErrorMessage, refetch, openPanelTab, onMoreMenuClose, isRecording, }) {
    const { projectId, environment, appVersion } = transferScope;
    const [isDragOver, setIsDragOver] = useState(false);
    const [pendingImport, setPendingImport] = useState(null);
    const [importStep, setImportStep] = useState("none");
    const [pendingCommand, setPendingCommand] = useState(null);
    const [commandConflicts, setCommandConflicts] = useState([]);
    const [commandStep, setCommandStep] = useState("none");
    const [commandNotice, setCommandNotice] = useState(null);
    const dragDepthRef = useRef(0);
    const closeMoreMenu = useCallback(() => {
        onMoreMenuClose?.();
    }, [onMoreMenuClose]);
    const queueImport = useCallback((payload) => {
        closeMoreMenu();
        setPendingImport(payload);
        setImportStep(isImportProjectCompatible(transferScope, payload.project) ? "confirm" : "project-mismatch");
        setErrorMessage("");
    }, [closeMoreMenu, setErrorMessage, transferScope]);
    const handleImportFile = useCallback(async (file) => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
            return;
        }
        try {
            const payload = await readFeedbackJsonFile(file);
            queueImport(payload);
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : "JSON import에 실패했어요.");
        }
    }, [canTransferFeedback, queueImport, setErrorMessage]);
    const handleExport = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
            return;
        }
        closeMoreMenu();
        const items = readAllFeedback(transferScope);
        void downloadFeedbackJson(createFeedbackBackupFilename(projectId, environment, appVersion), toReportProject(transferScope), items).then((result) => {
            if (result === "failed") {
                setErrorMessage("JSON export에 실패했어요. 브라우저 다운로드 권한을 확인해주세요.");
                return;
            }
            if (result === "cancelled") {
                return;
            }
            setErrorMessage("");
        });
    }, [canTransferFeedback, closeMoreMenu, environment, projectId, setErrorMessage, transferScope, appVersion]);
    const handleImportFromMenu = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
            return;
        }
        closeMoreMenu();
        void pickFeedbackJsonFile()
            .then((file) => {
            if (!file) {
                return;
            }
            return handleImportFile(file);
        })
            .catch((error) => {
            setErrorMessage(error instanceof Error ? error.message : "JSON import에 실패했어요.");
        });
    }, [canTransferFeedback, closeMoreMenu, handleImportFile, setErrorMessage]);
    const handleOpenCommand = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 command를 사용할 수 있어요.");
            return;
        }
        closeMoreMenu();
        setErrorMessage("");
        openPanelTab("command");
    }, [canTransferFeedback, closeMoreMenu, openPanelTab, setErrorMessage]);
    const handleCloseCommand = useCallback(() => {
        setCommandStep("none");
        setPendingCommand(null);
        setCommandConflicts([]);
        openPanelTab("command");
    }, [openPanelTab]);
    const handleCommandExecute = useCallback(async (raw) => {
        if (!canTransferFeedback) {
            throw new Error("localStorage 저장소에서만 command를 사용할 수 있어요.");
        }
        const payload = parseFeedbackCommandJson(raw);
        const conflicts = findFeedbackInsertConflicts(transferScope, payload.items);
        if (conflicts.length > 0) {
            setPendingCommand(payload);
            setCommandConflicts(conflicts);
            setCommandStep("replace-confirm");
            return { status: "pending" };
        }
        const result = insertFeedbackItems(transferScope, payload.items);
        await refetch();
        setErrorMessage("");
        return {
            status: "success",
            message: buildCommandSuccessMessage(result.inserted, result.replaced),
        };
    }, [canTransferFeedback, refetch, setErrorMessage, transferScope]);
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
                message: buildCommandSuccessMessage(result.inserted, result.replaced),
                isError: false,
            });
        })();
    }, [pendingCommand, refetch, setErrorMessage, transferScope]);
    const applyImport = useCallback(async (payload) => {
        writeAllFeedback(transferScope, payload.items);
        setPendingImport(null);
        setImportStep("none");
        await refetch();
    }, [refetch, transferScope]);
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
                    setErrorMessage("백업 export에 실패해서 import를 중단했어요.");
                }
                return;
            }
            void applyImport(pending);
        });
    }, [applyImport, environment, pendingImport, projectId, setErrorMessage, transferScope, appVersion]);
    const handleDragEnter = useCallback((event) => {
        if (isRecording || !canTransferFeedback || importStep !== "none" || commandStep !== "none") {
            return;
        }
        if (!isJsonDragEvent(event)) {
            return;
        }
        event.preventDefault();
        dragDepthRef.current += 1;
        setIsDragOver(true);
    }, [canTransferFeedback, commandStep, importStep, isRecording]);
    const handleDragLeave = useCallback((event) => {
        if (isRecording || !canTransferFeedback) {
            return;
        }
        event.preventDefault();
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) {
            setIsDragOver(false);
        }
    }, [canTransferFeedback, isRecording]);
    const handleDragOver = useCallback((event) => {
        if (isRecording || !canTransferFeedback || importStep !== "none" || commandStep !== "none") {
            return;
        }
        if (!isJsonDragEvent(event)) {
            return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    }, [canTransferFeedback, commandStep, importStep, isRecording]);
    const handleDrop = useCallback((event) => {
        if (isRecording || !canTransferFeedback || importStep !== "none" || commandStep !== "none") {
            return;
        }
        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDragOver(false);
        const file = Array.from(event.dataTransfer.files).find(isJsonFile);
        if (!file) {
            setErrorMessage("JSON 파일만 import할 수 있어요.");
            return;
        }
        void handleImportFile(file);
    }, [canTransferFeedback, commandStep, handleImportFile, importStep, isRecording, setErrorMessage]);
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
//# sourceMappingURL=usePanelFeedbackTransfer.js.map