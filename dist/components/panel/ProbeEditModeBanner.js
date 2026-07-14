import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons/Icons.js";
import { PickTargetCompareSegment } from "../../components/overlay/PickTargetCompareSegment.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
function ProbeEditModeSpinner() {
    return (_jsx("span", { className: "fivepixels-spin inline-block h-[12px] w-[12px] shrink-0 rounded-full border-2 border-white/30 border-t-white", "aria-hidden": true }));
}
function ProbeEditModeDivider() {
    return _jsx("span", { className: "shrink-0 text-[11px] text-white/50", children: "|" });
}
function ProbeEditModeHistoryButton({ label, disabled, onClick, children }) {
    return (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": label, title: label, disabled: disabled, onClick: onClick, className: "inline-flex shrink-0 items-center justify-center rounded-[4px] p-[2px] text-white transition-opacity enabled:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35", children: children }));
}
export function ProbeEditModeBanner() {
    const { messages } = useReportPreferences();
    const { hasProbeSessionChanges, savedProbeCompareMode, setSavedProbeCompareMode, revertAllSavedProbeEdits, savedProbeEdits, canUndoProbeSession, canRedoProbeSession, undoProbeSessionAction, redoProbeSessionAction } = useReportSession();
    if (!hasProbeSessionChanges) {
        return null;
    }
    const showCompare = Object.keys(savedProbeEdits).length > 0;
    return (_jsxs("section", { className: "flex shrink-0 items-center gap-[8px] rounded-t-[12px] bg-[#f6572d] px-[10px] py-[6px] text-white", "data-fivepixels-interactive": "", children: [_jsx(ProbeEditModeSpinner, {}), _jsx("p", { className: "min-w-0 flex-1 truncate text-[11px] font-semibold leading-[1.3]", children: messages.panel.probeEditModeActive }), _jsx(ProbeEditModeDivider, {}), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => revertAllSavedProbeEdits(), className: "shrink-0 text-[11px] font-semibold text-white underline-offset-2 hover:underline", children: messages.panel.probeEditModeReset }), _jsx(ProbeEditModeDivider, {}), _jsxs("div", { className: "flex shrink-0 items-center gap-[2px]", children: [_jsx(ProbeEditModeHistoryButton, { label: messages.panel.probeEditModeUndo, disabled: !canUndoProbeSession, onClick: () => undoProbeSessionAction(), children: _jsx(ChevronLeftIcon, { className: "h-[14px] w-[14px]" }) }), _jsx(ProbeEditModeHistoryButton, { label: messages.panel.probeEditModeRedo, disabled: !canRedoProbeSession, onClick: () => redoProbeSessionAction(), children: _jsx(ChevronRightIcon, { className: "h-[14px] w-[14px]" }) })] }), showCompare ? (_jsxs(_Fragment, { children: [_jsx(ProbeEditModeDivider, {}), _jsx(PickTargetCompareSegment, { mode: savedProbeCompareMode, onChange: setSavedProbeCompareMode, beforeLabel: messages.pickTarget.probeBefore, afterLabel: messages.pickTarget.probeAfter, tone: "inverse" })] })) : null] }));
}
//# sourceMappingURL=ProbeEditModeBanner.js.map