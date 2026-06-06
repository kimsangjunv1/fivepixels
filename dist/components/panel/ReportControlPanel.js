import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useRef, useState } from "react";
import { panelAnchorSide, usePanelDock } from "../../hooks/usePanelDock.js";
import { useReport } from "../../providers/reportContext.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/ChevronIcon.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { PanelDockGuides } from "./PanelDockGuides.js";
import { ReportFeedbackList } from "./ReportFeedbackList.js";
import { ReportRouteDetails } from "./ReportRouteDetails.js";
import { ReportImportConfirmDialog } from "./ReportImportConfirmDialog.js";
import { PanelMoreMenu } from "./PanelMoreMenu.js";
import { LogoIcon } from "./../icons/LogoIcon.js";
import { motion } from "../motion/index.js";
import { formatStatCount } from "../../utils/formatStatCount.js";
import { panelNumericClassName } from "../../utils/panelTypography.js";
import { createFeedbackBackupFilename, downloadFeedbackJson, pickFeedbackJsonFile, readAllFeedback, readFeedbackJsonFile, writeAllFeedback } from "../../utils/feedbackDataTransfer.js";
const RECORDING_STATUS_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.95)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 4px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(0,0,0,0.75))";
function PanelCollapseTab({ collapsed, anchorSide, onClick }) {
    const hideIcon = anchorSide === "right" ? _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    const expandIcon = anchorSide === "right" ? _jsx(ChevronLeftIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" }) : _jsx(ChevronRightIcon, { className: "h-3 w-3 text-slate-500 dark:text-slate-300" });
    return (_jsx("button", { type: "button", onClick: onClick, className: "", "aria-expanded": !collapsed, "aria-label": collapsed ? "패널 펼치기" : "패널 숨기기", title: collapsed ? "패널 펼치기" : "패널 숨기기", children: collapsed ? expandIcon : hideIcon }));
}
function PanelTabButton({ label, active, onClick }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: `flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[4px] ${active ? "bg-[var(--adaptive-black100)] text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}`, children: [_jsx("p", { className: "text-[var(--adaptive-black500)] font-[500]", children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 transition-transform ${active ? "rotate-180" : ""}` })] }));
}
function EnvironmentBadge({ environment }) {
    if (!environment) {
        return null;
    }
    return (_jsxs("span", { className: "inline-flex items-center gap-[4px] rounded-full border border-[var(--adaptive-black300)] bg-[var(--adaptive-black50)] px-[4px] py-[2px]", children: [_jsx("span", { className: "text-[12px] text-[var(--adaptive-black500)]", children: environment }), _jsx("span", { className: "inline-flex h-[4px] w-[4px] rounded-full bg-[var(--adaptive-green500)]", "aria-hidden": true })] }));
}
function isJsonDragEvent(event) {
    const types = Array.from(event.dataTransfer.types);
    return types.includes("Files") || types.includes("application/json");
}
function isJsonFile(file) {
    return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}
export function ReportControlPanel() {
    const { mode, targetStats, statusText, errorMessage, environment, projectId, appVersion, showFeedbackList, showTargetPreview, isMobileViewport, panelTab, canTransferFeedback, toggleReportMode, toggleTargetPreview, toggleIssueMode, openPanelTab, setErrorMessage, refetch, } = useReport();
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [pendingImport, setPendingImport] = useState(null);
    const dragDepthRef = useRef(0);
    const isRecording = mode === "report";
    const isIssueMode = mode === "view";
    const { panelRef, panelStyle, placementCorner, isDragging, activeCorner, handleDragHandlePointerDown } = usePanelDock({
        enabled: !isMobileViewport,
        measureKey: `${panelCollapsed}-${isRecording}-${panelTab ?? "none"}-${isIssueMode}-${pendingImport ? "import" : "none"}`,
    });
    const anchorSide = panelAnchorSide(placementCorner);
    const panelLayout = placementCorner.startsWith("top") ? "size" : "position";
    const transferScope = { projectId, environment, appVersion };
    const handlePanelTabClick = (tab) => {
        openPanelTab(tab);
    };
    const queueImport = useCallback((items) => {
        setMoreMenuOpen(false);
        setPendingImport(items);
        setErrorMessage("");
    }, [setErrorMessage]);
    const handleImportFile = useCallback(async (file) => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
            return;
        }
        try {
            const items = await readFeedbackJsonFile(file);
            queueImport(items);
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
        setMoreMenuOpen(false);
        const items = readAllFeedback(transferScope);
        void downloadFeedbackJson(createFeedbackBackupFilename(projectId, environment, appVersion), items).then((result) => {
            if (result === "failed") {
                setErrorMessage("JSON export에 실패했어요. 브라우저 다운로드 권한을 확인해주세요.");
                return;
            }
            if (result === "cancelled") {
                return;
            }
            setErrorMessage("");
        });
    }, [canTransferFeedback, environment, projectId, setErrorMessage, transferScope]);
    const handleImportFromMenu = useCallback(() => {
        if (!canTransferFeedback) {
            setErrorMessage("localStorage 저장소에서만 import/export를 사용할 수 있어요.");
            return;
        }
        setMoreMenuOpen(false);
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
    }, [canTransferFeedback, handleImportFile, setErrorMessage]);
    const applyImport = useCallback(async (items) => {
        writeAllFeedback(transferScope, items);
        setPendingImport(null);
        await refetch();
    }, [refetch, transferScope]);
    const handleCancelImport = () => {
        setPendingImport(null);
    };
    const handleApplyImport = () => {
        if (!pendingImport) {
            return;
        }
        void applyImport(pendingImport);
    };
    const handleBackupAndApplyImport = () => {
        if (!pendingImport) {
            return;
        }
        const currentItems = readAllFeedback(transferScope);
        const pending = pendingImport;
        void downloadFeedbackJson(createFeedbackBackupFilename(projectId, environment, appVersion), currentItems).then((result) => {
            if (result === "cancelled" || result === "failed") {
                if (result === "failed") {
                    setErrorMessage("백업 export에 실패해서 import를 중단했어요.");
                }
                return;
            }
            void applyImport(pending);
        });
    };
    const handleDragEnter = (event) => {
        if (isRecording || !canTransferFeedback || pendingImport) {
            return;
        }
        if (!isJsonDragEvent(event)) {
            return;
        }
        event.preventDefault();
        dragDepthRef.current += 1;
        setIsDragOver(true);
    };
    const handleDragLeave = (event) => {
        if (isRecording || !canTransferFeedback) {
            return;
        }
        event.preventDefault();
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) {
            setIsDragOver(false);
        }
    };
    const handleDragOver = (event) => {
        if (isRecording || !canTransferFeedback || pendingImport) {
            return;
        }
        if (!isJsonDragEvent(event)) {
            return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };
    const handleDrop = (event) => {
        if (isRecording || !canTransferFeedback) {
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
    };
    return (_jsxs(_Fragment, { children: [_jsx(PanelDockGuides, { visible: isDragging, activeCorner: activeCorner }), isRecording && statusText ? (_jsx("div", { className: "pointer-events-none fixed bottom-[52px] left-0 right-0 z-[1000000] flex flex-col items-center gap-[4px] px-4 text-center text-white", style: { filter: RECORDING_STATUS_SHADOW }, children: statusText.split("\n").map((line, index) => (_jsx("p", { className: index === 0 ? "text-[12px] font-medium" : "text-[18px] font-bold", children: line }, `${index}-${line}`))) })) : null, _jsx(motion.div, { ref: panelRef, transition: { duration: 0.25, ease: "cubic-bezier(0.22, 1, 0.36, 1)" }, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, className: `pointer-events-auto fixed z-[1000000] overflow-hidden bg-[var(--adaptive-whiteOpacity800)] backdrop-blur-[50px] rounded-[24px] shadow-[0_0_120px_0_var(--adaptive-blackOpacity500)] flex ${isRecording ? "min-h-[40px] p-[4px]" : "max-h-[80vh] min-h-[40px w-full max-w-[375px]"}`, style: { ...panelStyle, fontSize: "14px" }, children: _jsx(motion.div, { className: "flex min-w-0 flex-1 flex-col w-full", children: isRecording ? (_jsxs("section", { className: "flex items-center justify-between gap-[16px] px-[12px] py-[8px]", children: [_jsxs("section", { className: "flex items-center gap-[4px] justify-start shrink-0", children: [_jsx(LogoIcon, { className: "w-[18px]" }), _jsx("p", { className: "text-[var(--adaptive-black900)] text-[16px]", children: "Stitchable\u00B0" })] }), _jsx("button", { type: "button", onClick: toggleReportMode, className: "flex items-center shrink-0", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: "Stop Recording..." }) })] })) : (_jsx(_Fragment, { children: !panelCollapsed ? (_jsxs("section", { className: "relative flex min-w-0 flex-1 flex-col", children: [isDragOver ? (_jsx("div", { className: "pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[12px] bg-[#dbeafe]/90 px-[16px] text-center backdrop-blur-[2px]", children: _jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-blue500)]", children: "\uC120\uD0DD\uD558\uC2E0 JSON\uC744 import \uD569\uB2C8\uB2E4" }) })) : null, _jsxs("section", { className: "flex", children: [anchorSide === "left" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null, _jsxs("div", { className: "flex flex-col gap-[8px] p-[12px] flex-1", children: [_jsxs("section", { className: "flex items-center justify-between gap-[8px]", children: [_jsxs("section", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsx(LogoIcon, { className: "w-[18px] shrink-0" }), _jsx("p", { className: "shrink-0 text-[var(--adaptive-black900)] font-[700] text-[16px]", children: "Stitchable\u00B0" }), _jsx(EnvironmentBadge, { environment: environment })] }), _jsxs("section", { className: "flex shrink-0 items-center gap-[4px]", children: [_jsx("button", { type: "button", onClick: toggleReportMode, className: "p-[4px_8px] rounded-[8px] bg-[var(--adaptive-black200)]", children: _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "RECORD" }) }), _jsx("button", { type: "button", onClick: toggleIssueMode, className: isIssueMode ? "rounded-full bg-[var(--adaptive-black300)] px-[10px] py-[4px]" : "p-[4px_8px] rounded-[8px] bg-[var(--adaptive-black200)]", "aria-pressed": isIssueMode, children: _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "ISSUE" }) }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", "aria-label": showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", title: showTargetPreview ? "X-Ray 끄기" : "X-Ray 켜기", className: showTargetPreview
                                                                        ? "rounded-full bg-[var(--adaptive-black300)] px-[10px] py-[4px]"
                                                                        : "p-[4px_8px] rounded-[8px] bg-[var(--adaptive-black200)]", "aria-pressed": showTargetPreview, children: _jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "X-RAY" }) })] })] }), _jsxs("section", { className: "flex cursor-move", onPointerDown: handleDragHandlePointerDown, "aria-label": "\uD328\uB110 \uC704\uCE58 \uBCC0\uACBD", title: "\uB4DC\uB798\uADF8\uD574\uC11C \uC704\uCE58 \uBCC0\uACBD", style: isDragging ? { opacity: 0.8 } : undefined, children: [_jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "Found" }), _jsx("p", { className: `text-[18px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.found) })] }), _jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "Group" }), _jsx("p", { className: `text-[18px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.group) })] }), _jsxs("section", { className: "flex flex-col items-start gap-[4px] flex-1", children: [_jsx("p", { className: "text-[12px] text-[var(--adaptive-black500)]", children: "Item" }), _jsx("p", { className: `text-[18px] font-semibold text-[var(--adaptive-black900)] ${panelNumericClassName}`, children: formatStatCount(targetStats.item) })] })] })] }), anchorSide === "right" ? (_jsx(PanelCollapseTab, { collapsed: panelCollapsed, anchorSide: anchorSide, onClick: () => setPanelCollapsed((current) => !current) })) : null] }), _jsxs("section", { className: "flex items-stretch border-t border-[var(--adaptive-black200)]", children: [_jsxs("div", { className: "flex min-w-0 flex-1 overflow-hidden", children: [_jsx(PanelTabButton, { label: "Page Details", active: panelTab === "route-details", onClick: () => handlePanelTabClick("route-details") }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-black200)]" }), showFeedbackList ? (_jsx(PanelTabButton, { label: "Feedback List", active: panelTab === "feedback-list", onClick: () => handlePanelTabClick("feedback-list") })) : null] }), _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-black200)]" }), _jsx(PanelMoreMenu, { open: moreMenuOpen, disabled: !canTransferFeedback, onToggle: () => setMoreMenuOpen((current) => !current), onClose: () => setMoreMenuOpen(false), onExport: handleExport, onImport: handleImportFromMenu })] }), errorMessage && !pendingImport ? _jsx("p", { className: "px-[8px] text-[12px] text-rose-700", children: errorMessage }) : null, pendingImport ? (_jsx(ReportImportConfirmDialog, { onApply: handleApplyImport, onCancel: handleCancelImport, onBackupAndApply: handleBackupAndApplyImport })) : null, panelTab === "route-details" && !pendingImport ? _jsx(ReportRouteDetails, {}) : null, panelTab === "feedback-list" && showFeedbackList && !pendingImport ? _jsx(ReportFeedbackList, {}) : null] })) : null })) }) })] }));
}
//# sourceMappingURL=ReportControlPanel.js.map