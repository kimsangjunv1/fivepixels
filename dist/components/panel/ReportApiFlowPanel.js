import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useMemo, useState } from "react";
import { CopyIcon, InfoIcon } from "../../components/icons/Icons.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { PanelOptionSwitch } from "../../components/panel/PanelOptionSwitch.js";
import { ReportPanelNoticeDialog } from "../../components/panel/ReportPanelNoticeDialog.js";
import { useReport, useReportPreferences } from "../../providers/reportContext.js";
import { describeApiFlowStatus } from "../../utils/network/formatApiFlowEntry.js";
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
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    }
    catch {
        return false;
    }
}
function ApiFlowCopyButton({ copied, label, onCopy }) {
    const { messages } = useReportPreferences();
    return (_jsx(HoverTooltip, { label: copied ? messages.apiFlow.copied : messages.apiFlow.copy, children: _jsx("button", { type: "button", onClick: onCopy, "aria-label": label, className: "flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]", children: copied ? _jsx("span", { className: "text-[9px] font-semibold", children: messages.common.ok }) : _jsx(CopyIcon, { className: "h-[12px] w-[12px]" }) }) }));
}
function ApiFlowDetailSectionHeader({ label, copied, copyLabel, onCopy }) {
    return (_jsxs("div", { className: "flex items-center justify-between gap-[8px]", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: label }), _jsx(ApiFlowCopyButton, { copied: copied, label: copyLabel, onCopy: onCopy })] }));
}
function ApiFlowDetailReadOnlyBlock({ label, value }) {
    if (!value) {
        return null;
    }
    return (_jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: label }), _jsx("pre", { className: "max-h-[160px] overflow-auto rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] p-[8px] text-[11px] leading-[1.45] whitespace-pre-wrap break-all text-[var(--adaptive-black800)]", children: redactJsonLikeText(value) })] }));
}
function ApiFlowDetailBlock({ label, value, copied, copyLabel, onCopy }) {
    if (!value) {
        return null;
    }
    return (_jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsx(ApiFlowDetailSectionHeader, { label: label, copied: copied, copyLabel: copyLabel, onCopy: onCopy }), _jsx("pre", { className: "max-h-[160px] overflow-auto rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] p-[8px] text-[11px] leading-[1.45] whitespace-pre-wrap break-all text-[var(--adaptive-black800)]", children: redactJsonLikeText(value) })] }));
}
function ApiFlowListRow({ entry, selected, onSelect }) {
    const { messages } = useReportPreferences();
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;
    const tone = entry.ok
        ? selected
            ? "bg-[var(--adaptive-green50)] text-[var(--adaptive-green900)] ring-1 ring-inset ring-[var(--adaptive-green200)]"
            : "bg-[var(--adaptive-green50)] text-[var(--adaptive-green900)] hover:bg-[var(--adaptive-green100)]"
        : selected
            ? "bg-[var(--adaptive-red50)] text-[var(--adaptive-red900)] ring-1 ring-inset ring-[var(--adaptive-red200)]"
            : "bg-[var(--adaptive-red50)] text-[var(--adaptive-red900)] hover:bg-[var(--adaptive-red100)]";
    return (_jsxs("button", { type: "button", onClick: onSelect, className: `flex w-full flex-col gap-[2px] border-b border-[var(--adaptive-border-subtle)] px-[10px] py-[8px] text-left ${tone}`, children: [_jsxs("div", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsx("span", { className: "shrink-0 text-[11px] font-bold", children: entry.method }), _jsx("span", { className: "min-w-0 flex-1 truncate text-[12px] font-semibold", children: entry.pathname }), _jsx("span", { className: "shrink-0 text-[11px] font-semibold", children: statusLabel })] }), _jsxs("div", { className: "flex items-center justify-between gap-[8px] text-[10px] opacity-80", children: [_jsx("span", { className: "truncate", children: describeApiFlowStatus(entry, messages) }), _jsxs("span", { className: "shrink-0", children: [formatListTime(entry.timestamp), " \u00B7 ", entry.durationMs, "ms"] })] })] }));
}
function ApiFlowDetailPane({ entry, copiedField, onCopyField, onClose, }) {
    const { messages } = useReportPreferences();
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;
    const queryParamsValue = Object.keys(entry.queryParams).length > 0 ? JSON.stringify(entry.queryParams, null, 2) : null;
    const responseBodyValue = entry.responseBody ? redactJsonLikeText(entry.responseBody) : null;
    return (_jsxs("aside", { className: "flex min-h-0 min-w-0 flex-1 flex-col border-l border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]", children: [_jsxs("header", { className: "flex shrink-0 items-start justify-between gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("p", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: [entry.method, " ", entry.pathname] }), _jsxs("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black600)]", children: [statusLabel, " \u00B7 ", describeApiFlowStatus(entry, messages), " \u00B7 ", entry.durationMs, "ms"] })] }), _jsx("button", { type: "button", onClick: onClose, className: "shrink-0 rounded-[6px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[8px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: messages.apiFlow.closeDetail })] }), _jsxs("div", { className: "min-h-0 flex-1 space-y-[10px] overflow-y-auto px-[12px] py-[10px]", children: [_jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsx(ApiFlowDetailSectionHeader, { label: messages.apiFlow.feedbackUrl, copied: copiedField === "url", copyLabel: `${messages.apiFlow.copy} ${messages.apiFlow.feedbackUrl}`, onCopy: () => onCopyField("url", entry.url) }), _jsx("p", { className: "break-all text-[11px] text-[var(--adaptive-black800)]", children: entry.url })] }), queryParamsValue ? (_jsx(ApiFlowDetailBlock, { label: messages.apiFlow.detailQueryParams, value: queryParamsValue, copied: copiedField === "query", copyLabel: `${messages.apiFlow.copy} ${messages.apiFlow.detailQueryParams}`, onCopy: () => onCopyField("query", queryParamsValue) })) : null, _jsx(ApiFlowDetailReadOnlyBlock, { label: messages.apiFlow.detailRequestBody, value: entry.requestBody }), entry.responseBody ? (_jsx(ApiFlowDetailBlock, { label: messages.apiFlow.detailResponseBody, value: entry.responseBody, copied: copiedField === "response", copyLabel: `${messages.apiFlow.copy} ${messages.apiFlow.detailResponseBody}`, onCopy: () => onCopyField("response", responseBodyValue ?? "") })) : null, entry.errorMessage ? (_jsxs("p", { className: "text-[11px] text-[var(--adaptive-red900)]", children: [messages.apiFlow.detailError, ": ", entry.errorMessage] })) : null] })] }));
}
export function ReportApiFlowPanel() {
    const { messages } = useReportPreferences();
    const { apiFlowEntries, networkMonitorEnabled } = useReport();
    const [selectedEntryId, setSelectedEntryId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [copiedField, setCopiedField] = useState(null);
    const failureCount = useMemo(() => apiFlowEntries.filter((entry) => !entry.ok).length, [apiFlowEntries]);
    const filteredEntries = useMemo(() => {
        if (filter === "success") {
            return apiFlowEntries.filter((entry) => entry.ok);
        }
        if (filter === "failure") {
            return apiFlowEntries.filter((entry) => !entry.ok);
        }
        return apiFlowEntries;
    }, [apiFlowEntries, filter]);
    const selectedEntry = useMemo(() => (selectedEntryId ? (filteredEntries.find((entry) => entry.id === selectedEntryId) ?? null) : null), [filteredEntries, selectedEntryId]);
    const filterOptions = useMemo(() => [
        { value: "all", label: messages.apiFlow.filterAll },
        { value: "success", label: messages.apiFlow.filterSuccess },
        { value: "failure", label: messages.apiFlow.filterFailure },
    ], [messages.apiFlow.filterAll, messages.apiFlow.filterFailure, messages.apiFlow.filterSuccess]);
    const handleCopyField = async (field, text) => {
        const copied = await copyToClipboard(text);
        if (!copied) {
            setCopiedField(null);
            return;
        }
        setCopiedField(field);
        window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1400);
    };
    const list = apiFlowEntries.length === 0 ? (_jsx(ReportPanelNoticeDialog, { role: "status", title: messages.apiFlow.empty })) : filteredEntries.length === 0 ? (_jsx(ReportPanelNoticeDialog, { role: "status", title: messages.apiFlow.emptyFiltered })) : (filteredEntries.map((entry) => (_jsx(ApiFlowListRow, { entry: entry, selected: selectedEntryId === entry.id, onSelect: () => setSelectedEntryId((current) => (current === entry.id ? null : entry.id)) }, entry.id))));
    if (!networkMonitorEnabled) {
        return (_jsx("section", { className: "bg-[var(--adaptive-black50)]", children: _jsx(ReportPanelNoticeDialog, { role: "status", title: messages.apiFlow.disabled }) }));
    }
    return (_jsxs(Fragment, { children: [_jsxs("header", { className: "flex shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]", children: [_jsxs("section", { className: "flex-1 flex gap-[4px] shrink-0 items-center", children: [_jsx("span", { children: messages.apiFlow.summaryRequests(apiFlowEntries.length) }), _jsx("span", { "aria-hidden": true, children: "\u00B7" }), _jsxs("span", { className: "inline-flex items-center gap-[4px]", children: [messages.apiFlow.summaryFailures(failureCount), _jsx(HoverTooltip, { label: messages.apiFlow.description, multiline: true, children: _jsx("span", { className: "inline-flex cursor-help text-[var(--adaptive-black500)]", "aria-label": messages.apiFlow.description, children: _jsx(InfoIcon, { className: "h-[12px] w-[12px]" }) }) })] })] }), _jsx("section", { className: "min-w-0 flex-1", children: _jsx(PanelOptionSwitch, { options: filterOptions, value: filter, onChange: (next) => {
                                setFilter(next);
                                if (!selectedEntryId) {
                                    return;
                                }
                                const entry = apiFlowEntries.find((item) => item.id === selectedEntryId);
                                if (!entry) {
                                    setSelectedEntryId(null);
                                    setCopiedField(null);
                                    return;
                                }
                                if ((next === "success" && !entry.ok) || (next === "failure" && entry.ok)) {
                                    setSelectedEntryId(null);
                                    setCopiedField(null);
                                }
                            }, ariaLabel: messages.apiFlow.filterAriaLabel }) })] }), selectedEntry ? (_jsxs("div", { className: `flex overflow-hidden ${API_FLOW_BODY_HEIGHT}`, children: [_jsx("div", { className: "w-[42%] shrink-0 overflow-y-auto border-r border-[var(--adaptive-border-subtle)]", children: list }), _jsx(ApiFlowDetailPane, { entry: selectedEntry, copiedField: copiedField, onCopyField: (field, text) => void handleCopyField(field, text), onClose: () => setSelectedEntryId(null) })] })) : (_jsx("div", { className: "overflow-y-auto overscroll-contain", children: list }))] }));
}
//# sourceMappingURL=ReportApiFlowPanel.js.map