import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { InfoIcon } from "../../components/icons/Icons.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { useReport, useReportPreferences } from "../../providers/reportContext.js";
import { describeApiFlowStatus, formatApiFlowEntryForCopy } from "../../utils/network/formatApiFlowEntry.js";
import { redactJsonLikeText } from "../../utils/network/redactNetworkPayload.js";
/** Shared height budget for list / split panes — keeps overflow-y-auto independent of parent flex height. */
const API_FLOW_BODY_HEIGHT = "h-[min(52dvh,calc(100svh-280px))]";
function formatListTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
function ApiFlowDetailBlock({ label, value }) {
    if (!value) {
        return null;
    }
    return (_jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: label }), _jsx("pre", { className: "max-h-[160px] overflow-auto rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] p-[8px] text-[11px] leading-[1.45] whitespace-pre-wrap break-all text-[var(--adaptive-black800)]", children: redactJsonLikeText(value) })] }));
}
function ApiFlowListRow({ entry, selected, onSelect, }) {
    const { messages } = useReportPreferences();
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;
    const tone = entry.ok
        ? selected
            ? "bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300"
            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
        : selected
            ? "bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-300"
            : "bg-rose-50 text-rose-800 hover:bg-rose-100";
    return (_jsxs("button", { type: "button", onClick: onSelect, className: `flex w-full flex-col gap-[2px] border-b border-[var(--adaptive-border-subtle)] px-[10px] py-[8px] text-left ${tone}`, children: [_jsxs("div", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsx("span", { className: "shrink-0 text-[11px] font-bold", children: entry.method }), _jsx("span", { className: "min-w-0 flex-1 truncate text-[12px] font-semibold", children: entry.pathname }), _jsx("span", { className: "shrink-0 text-[11px] font-semibold", children: statusLabel })] }), _jsxs("div", { className: "flex items-center justify-between gap-[8px] text-[10px] opacity-80", children: [_jsx("span", { className: "truncate", children: describeApiFlowStatus(entry, messages) }), _jsxs("span", { className: "shrink-0", children: [formatListTime(entry.timestamp), " \u00B7 ", entry.durationMs, "ms"] })] })] }));
}
function ApiFlowDetailPane({ entry, copied, onCopy, onAttach, onClose, }) {
    const { messages } = useReportPreferences();
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;
    return (_jsxs("aside", { className: "flex min-h-0 min-w-0 flex-1 flex-col border-l border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]", children: [_jsxs("header", { className: "flex shrink-0 items-start justify-between gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("p", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: [entry.method, " ", entry.pathname] }), _jsxs("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black600)]", children: [statusLabel, " \u00B7 ", describeApiFlowStatus(entry, messages), " \u00B7 ", entry.durationMs, "ms"] })] }), _jsx("button", { type: "button", onClick: onClose, className: "shrink-0 rounded-[6px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[8px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: messages.apiFlow.closeDetail })] }), _jsxs("div", { className: "min-h-0 flex-1 space-y-[10px] overflow-y-auto px-[12px] py-[10px]", children: [_jsxs("div", { className: "flex flex-col gap-[2px]", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: messages.apiFlow.feedbackUrl }), _jsx("p", { className: "break-all text-[11px] text-[var(--adaptive-black800)]", children: entry.url })] }), Object.keys(entry.queryParams).length > 0 ? (_jsx(ApiFlowDetailBlock, { label: messages.apiFlow.detailQueryParams, value: JSON.stringify(entry.queryParams, null, 2) })) : null, _jsx(ApiFlowDetailBlock, { label: messages.apiFlow.detailRequestBody, value: entry.requestBody }), _jsx(ApiFlowDetailBlock, { label: messages.apiFlow.detailResponseBody, value: entry.responseBody }), entry.errorMessage ? (_jsxs("p", { className: "text-[11px] text-rose-700", children: [messages.apiFlow.detailError, ": ", entry.errorMessage] })) : null] }), _jsxs("footer", { className: "flex shrink-0 items-center justify-end gap-[8px] border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]", children: [_jsx("button", { type: "button", onClick: onAttach, className: "rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: messages.apiFlow.attachToFeedback }), _jsx("button", { type: "button", onClick: onCopy, className: "rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: copied ? messages.apiFlow.copied : messages.apiFlow.copy })] })] }));
}
export function ReportApiFlowPanel() {
    const { messages } = useReportPreferences();
    const { apiFlowEntries, appendApiFlowEntryToDraftCase, networkMonitorEnabled } = useReport();
    const [selectedEntryId, setSelectedEntryId] = useState(null);
    const [copiedEntryId, setCopiedEntryId] = useState(null);
    const failureCount = useMemo(() => apiFlowEntries.filter((entry) => !entry.ok).length, [apiFlowEntries]);
    const selectedEntry = useMemo(() => (selectedEntryId ? (apiFlowEntries.find((entry) => entry.id === selectedEntryId) ?? null) : null), [apiFlowEntries, selectedEntryId]);
    const handleCopy = async (entry) => {
        try {
            await navigator.clipboard.writeText(formatApiFlowEntryForCopy(entry));
            setCopiedEntryId(entry.id);
            window.setTimeout(() => setCopiedEntryId((current) => (current === entry.id ? null : current)), 1400);
        }
        catch {
            setCopiedEntryId(null);
        }
    };
    const list = apiFlowEntries.length === 0 ? (_jsx("p", { className: "px-[12px] py-[16px] text-[12px] text-[var(--adaptive-black500)]", children: messages.apiFlow.empty })) : (apiFlowEntries.map((entry) => (_jsx(ApiFlowListRow, { entry: entry, selected: selectedEntryId === entry.id, onSelect: () => setSelectedEntryId((current) => (current === entry.id ? null : entry.id)) }, entry.id))));
    if (!networkMonitorEnabled) {
        return (_jsx("section", { className: "bg-[var(--adaptive-black50)] p-[12px]", children: _jsx("p", { className: "text-[12px] text-[var(--adaptive-black600)]", children: messages.apiFlow.disabled }) }));
    }
    return (_jsxs("section", { className: "flex flex-col bg-[var(--adaptive-black50)]", children: [_jsxs("header", { className: "flex shrink-0 items-center gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px] text-[11px] font-medium text-[var(--adaptive-black500)]", children: [_jsx("span", { children: messages.apiFlow.summaryRequests(apiFlowEntries.length) }), _jsx("span", { "aria-hidden": true, children: "\u00B7" }), _jsxs("span", { className: "inline-flex items-center gap-[4px]", children: [messages.apiFlow.summaryFailures(failureCount), _jsx(HoverTooltip, { label: messages.apiFlow.description, multiline: true, children: _jsx("span", { className: "inline-flex cursor-help text-[var(--adaptive-black500)]", "aria-label": messages.apiFlow.description, children: _jsx(InfoIcon, { className: "h-[12px] w-[12px]" }) }) })] })] }), selectedEntry ? (_jsxs("div", { className: `flex overflow-hidden ${API_FLOW_BODY_HEIGHT}`, children: [_jsx("div", { className: "w-[42%] shrink-0 overflow-y-auto border-r border-[var(--adaptive-border-subtle)]", children: list }), _jsx(ApiFlowDetailPane, { entry: selectedEntry, copied: copiedEntryId === selectedEntry.id, onCopy: () => void handleCopy(selectedEntry), onAttach: () => appendApiFlowEntryToDraftCase(selectedEntry.id), onClose: () => setSelectedEntryId(null) })] })) : (_jsx("div", { className: `overflow-y-auto overscroll-contain ${API_FLOW_BODY_HEIGHT}`, children: list }))] }));
}
//# sourceMappingURL=ReportApiFlowPanel.js.map