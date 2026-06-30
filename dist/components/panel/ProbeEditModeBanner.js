import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { PickTargetCompareSegment } from "../../components/overlay/PickTargetCompareSegment.js";
import { useReport } from "../../providers/reportContext.js";
function ProbeEditModeSpinner() {
    return (_jsx("span", { className: "fivepixels-spin inline-block h-[12px] w-[12px] shrink-0 rounded-full border-2 border-white/30 border-t-white", "aria-hidden": true }));
}
function ProbeEditModeDivider() {
    return _jsx("span", { className: "shrink-0 text-[11px] text-white/50", children: "|" });
}
export function ProbeEditModeBanner() {
    const { hasProbeSessionChanges, savedProbeCompareMode, setSavedProbeCompareMode, revertAllSavedProbeEdits, savedProbeEdits, messages, } = useReport();
    if (!hasProbeSessionChanges) {
        return null;
    }
    const showCompare = Object.keys(savedProbeEdits).length > 0;
    return (_jsxs("section", { className: "flex shrink-0 items-center gap-[8px] rounded-t-[12px] bg-[#f6572d] px-[10px] py-[6px] text-white", "data-fivepixels-interactive": "", children: [_jsx(ProbeEditModeSpinner, {}), _jsx("p", { className: "min-w-0 flex-1 truncate text-[11px] font-semibold leading-[1.3]", children: messages.panel.probeEditModeActive }), _jsx(ProbeEditModeDivider, {}), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => revertAllSavedProbeEdits(), className: "shrink-0 text-[11px] font-semibold text-white underline-offset-2 hover:underline", children: messages.panel.probeEditModeReset }), showCompare ? (_jsxs(_Fragment, { children: [_jsx(ProbeEditModeDivider, {}), _jsx(PickTargetCompareSegment, { mode: savedProbeCompareMode, onChange: setSavedProbeCompareMode, beforeLabel: messages.pickTarget.probeBefore, afterLabel: messages.pickTarget.probeAfter, tone: "inverse" })] })) : null] }));
}
//# sourceMappingURL=ProbeEditModeBanner.js.map