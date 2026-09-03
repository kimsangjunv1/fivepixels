import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LockIcon } from "../../components/icons/Icons.js";
import { HoverTooltip } from "../../tooltip/HoverTooltip.js";
import { useReportPreferences } from "../../providers/reportContext.js";
import { formatIntegrationMissingHandlers } from "../../utils/integration/integrationFeatures.js";
import { getIntegrationLock } from "../../utils/integration/integrationGate.js";
export function useIntegrationLock(feature) {
    const { integrationCapabilities, messages } = useReportPreferences();
    const state = getIntegrationLock(feature, integrationCapabilities);
    const tooltipLabel = feature === "dataTransfer" && state.locked
        ? messages.panel.integrationLockDataTransfer
        : state.missingHandlers.length > 0
            ? messages.panel.integrationLockMissing(formatIntegrationMissingHandlers(state.missingHandlers))
            : messages.panel.integrationLockRequired;
    return { ...state, tooltipLabel };
}
/** Keep HoverTooltip enabled while the child control is disabled. */
export function IntegrationLockTip({ locked, label, children, className = "", showIcon = true }) {
    if (!locked) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsx(HoverTooltip, { label: label, multiline: true, className: className, children: _jsxs("span", { className: "inline-flex items-center gap-[4px]", children: [children, showIcon ? _jsx(LockIcon, { className: "h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black500)]", "aria-hidden": true }) : null] }) }));
}
export function IntegrationLockBadge({ feature, className = "" }) {
    const { locked, tooltipLabel } = useIntegrationLock(feature);
    if (!locked) {
        return null;
    }
    return (_jsx(HoverTooltip, { label: tooltipLabel, multiline: true, className: className, children: _jsx("span", { className: "inline-flex items-center justify-center text-[var(--adaptive-black500)]", "aria-label": tooltipLabel, children: _jsx(LockIcon, { className: "h-[12px] w-[12px]" }) }) }));
}
//# sourceMappingURL=IntegrationLock.js.map