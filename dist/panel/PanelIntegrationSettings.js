import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircleIcon } from "../components/icons/Icons.js";
import { ACCENT_COLOR } from "../constants/accentColors.js";
import { useReportPreferences } from "../providers/reportContext.js";
const CONNECTED_COLOR = ACCENT_COLOR.green;
function IntegrationStatusIndicator({ connected }) {
    if (connected) {
        return (_jsx(CheckCircleIcon, { className: "h-[12px] w-[12px] shrink-0", fill: CONNECTED_COLOR, "aria-hidden": true }));
    }
    return (_jsx("span", { "aria-hidden": true, className: "inline-flex h-[12px] w-[12px] shrink-0 rounded-full border border-[var(--adaptive-black300)]" }));
}
function ProgressBar({ value }) {
    const clamped = Math.max(0, Math.min(100, value));
    return (_jsx("div", { className: "h-[6px] w-full overflow-hidden rounded-full bg-[var(--adaptive-black200)]", children: _jsx("div", { className: "h-full rounded-full transition-[width] duration-200", style: { width: `${clamped}%`, backgroundColor: CONNECTED_COLOR } }) }));
}
function handlerLabel(messages, id) {
    return messages.settings.integrationHandler[id] ?? id;
}
function featureLabel(messages, id) {
    return messages.settings.integrationFeature[id] ?? id;
}
function groupLabel(messages, group) {
    return messages.settings.integrationGroup[group] ?? group;
}
const GROUP_ORDER = ["auth", "session", "markers", "feedback", "cases", "replies", "members", "github"];
export function PanelIntegrationSettings() {
    const { messages, adapterIntegrationStatus, integrationCapabilities } = useReportPreferences();
    if (!adapterIntegrationStatus) {
        return (_jsx("section", { className: "px-[12px] py-[12px] text-[13px] text-[var(--adaptive-black700)]", children: messages.settings.integrationLocalModeHint }));
    }
    const { connectedCount, totalCount, requiredConnectedCount, requiredTotalCount, handlers, features, isRequiredComplete } = adapterIntegrationStatus;
    const progressPercent = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0;
    return (_jsxs("div", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto pb-[12px]", children: [_jsxs("section", { className: "border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[12px]", children: [_jsxs("div", { className: "mb-[8px] flex items-baseline justify-between gap-[8px]", children: [_jsx("p", { className: "text-[13px] font-semibold text-[var(--adaptive-black900)]", children: messages.settings.integrationProgressTitle }), _jsx("p", { className: "text-[12px] font-semibold text-[var(--adaptive-black700)]", children: messages.settings.integrationProgressCount(connectedCount, totalCount) })] }), _jsx(ProgressBar, { value: progressPercent }), _jsxs("p", { className: "mt-[8px] text-[11px] text-[var(--adaptive-black600)]", children: [messages.settings.integrationRequiredProgress(requiredConnectedCount, requiredTotalCount), isRequiredComplete ? ` · ${messages.settings.integrationRequiredComplete}` : ""] }), integrationCapabilities.persistenceMode === "unavailable" ? (_jsx("p", { className: "mt-[6px] text-[11px] font-medium text-[var(--adaptive-red500)]", children: messages.settings.integrationUnavailableHint })) : null] }), GROUP_ORDER.map((group) => {
                const groupHandlers = handlers.filter((item) => item.group === group);
                if (groupHandlers.length === 0) {
                    return null;
                }
                return (_jsxs("section", { className: "border-b border-[var(--adaptive-border-subtle)]", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: groupLabel(messages, group) }), _jsx("ul", { className: "flex flex-col py-[2px]", children: groupHandlers.map((item) => (_jsxs("li", { className: "flex items-start gap-[8px] px-[12px] py-[7px] text-[12px] text-[var(--adaptive-black800)]", children: [_jsx(IntegrationStatusIndicator, { connected: item.connected }), _jsxs("span", { className: "min-w-0 flex-1 break-all leading-[1.4]", children: [_jsx("span", { className: "font-medium", children: handlerLabel(messages, item.id) }), _jsx("span", { className: "mt-[2px] block font-mono text-[10px] text-[var(--adaptive-black500)]", children: item.id }), item.required ? (_jsx("span", { className: "mt-[2px] inline-block rounded-[4px] bg-[var(--adaptive-black100)] px-[4px] py-[1px] text-[10px] font-semibold text-[var(--adaptive-black600)]", children: messages.settings.integrationRequiredBadge })) : null] })] }, item.id))) })] }, group));
            }), _jsxs("section", { className: "border-b border-[var(--adaptive-border-subtle)] last:border-b-0", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: messages.settings.integrationFeaturesTitle }), _jsx("ul", { className: "flex flex-col py-[2px]", children: features.map((item) => (_jsxs("li", { className: "flex items-center gap-[8px] px-[12px] py-[7px] text-[12px] text-[var(--adaptive-black800)]", children: [_jsx(IntegrationStatusIndicator, { connected: item.available }), _jsx("span", { className: item.available ? "text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]", children: featureLabel(messages, item.id) })] }, item.id))) })] })] }));
}
//# sourceMappingURL=PanelIntegrationSettings.js.map