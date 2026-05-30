import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
import { reportStyles } from "../report/styles.js";
export function ReportControlPanel() {
    const { appearance, resolvedAppearance, palette, isMobileViewport, mode, helperText, errorMessage, showTargetPreview, toggleReportMode, toggleTargetPreview, toggleViewMode, } = useReport();
    return (_jsxs("div", { style: {
            ...reportStyles.floatingPanel,
            backgroundColor: palette.panel,
            borderColor: palette.panelBorder,
            color: palette.text,
            width: isMobileViewport ? "calc(100vw - 32px)" : 320,
            boxShadow: resolvedAppearance === "dark" ? "0 18px 48px rgba(15, 23, 42, 0.42)" : "0 18px 48px rgba(15, 23, 42, 0.16)",
            backdropFilter: "blur(14px)",
        }, children: [_jsxs("div", { style: reportStyles.panelHeader, children: [_jsx("strong", { style: { fontSize: 14 }, children: "stitchable" }), _jsx("span", { style: {
                            ...reportStyles.badge,
                            backgroundColor: palette.chip,
                            color: palette.muted,
                        }, children: appearance })] }), _jsx("p", { style: { ...reportStyles.helperText, color: palette.muted }, children: helperText }), _jsxs("div", { style: reportStyles.buttonRow, children: [_jsx("button", { type: "button", onClick: toggleReportMode, style: {
                            ...reportStyles.primaryButton,
                            backgroundColor: mode === "report" ? "#ef4444" : "#2563eb",
                        }, children: mode === "report" ? "선택 중단" : "피드백 남기기" }), _jsx("button", { type: "button", onClick: toggleTargetPreview, disabled: mode !== "idle", style: {
                            ...reportStyles.secondaryButton,
                            borderColor: showTargetPreview ? "#2563eb" : palette.inputBorder,
                            color: showTargetPreview ? "#2563eb" : palette.text,
                            opacity: mode !== "idle" ? 0.5 : 1,
                        }, children: showTargetPreview ? "요소 표시 끄기" : "현재 선택 가능한 element 노출하기" }), _jsx("button", { type: "button", onClick: toggleViewMode, style: {
                            ...reportStyles.secondaryButton,
                            borderColor: palette.inputBorder,
                            color: palette.text,
                        }, children: mode === "view" ? "목록 닫기" : "피드백 보기" })] }), errorMessage ? _jsx("p", { style: { ...reportStyles.errorText, color: "#ef4444" }, children: errorMessage }) : null] }));
}
//# sourceMappingURL=ReportControlPanel.js.map