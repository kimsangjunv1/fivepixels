import { Fragment, useMemo, useState } from "react";
import type { ApiFlowEntry } from "@/types/networkMonitor.js";
import { InfoIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { useReport, useReportPreferences } from "@/providers/reportContext.js";
import { describeApiFlowStatus, formatApiFlowEntryForCopy } from "@/utils/network/formatApiFlowEntry.js";
import { redactJsonLikeText } from "@/utils/network/redactNetworkPayload.js";

/** Shared height budget for list / split panes — keeps overflow-y-auto independent of parent flex height. */
const API_FLOW_BODY_HEIGHT = "h-[min(52dvh,calc(100svh-280px))]";
// const API_FLOW_BODY_HEIGHT = "h-[min(52dvh,calc(100svh-280px))]";

function formatListTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function ApiFlowDetailBlock({ label, value }: { label: string; value: string | null }) {
    if (!value) {
        return null;
    }

    return (
        <div className="flex flex-col gap-[4px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{label}</p>
            <pre className="max-h-[160px] overflow-auto rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] p-[8px] text-[11px] leading-[1.45] whitespace-pre-wrap break-all text-[var(--adaptive-black800)]">
                {redactJsonLikeText(value)}
            </pre>
        </div>
    );
}

function ApiFlowListRow({ entry, selected, onSelect }: { entry: ApiFlowEntry; selected: boolean; onSelect: () => void }) {
    const { messages } = useReportPreferences();
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;
    const tone = entry.ok
        ? selected
            ? "bg-[var(--adaptive-green50)] text-[var(--adaptive-green900)] ring-1 ring-inset ring-[var(--adaptive-green200)]"
            : "bg-[var(--adaptive-green50)] text-[var(--adaptive-green900)] hover:bg-[var(--adaptive-green100)]"
        : selected
          ? "bg-[var(--adaptive-red50)] text-[var(--adaptive-red900)] ring-1 ring-inset ring-[var(--adaptive-red200)]"
          : "bg-[var(--adaptive-red50)] text-[var(--adaptive-red900)] hover:bg-[var(--adaptive-red100)]";

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`flex w-full flex-col gap-[2px] border-b border-[var(--adaptive-border-subtle)] px-[10px] py-[8px] text-left ${tone}`}
        >
            <div className="flex min-w-0 items-center gap-[6px]">
                <span className="shrink-0 text-[11px] font-bold">{entry.method}</span>
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{entry.pathname}</span>
                <span className="shrink-0 text-[11px] font-semibold">{statusLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-[8px] text-[10px] opacity-80">
                <span className="truncate">{describeApiFlowStatus(entry, messages)}</span>
                <span className="shrink-0">
                    {formatListTime(entry.timestamp)} · {entry.durationMs}ms
                </span>
            </div>
        </button>
    );
}

function ApiFlowDetailPane({ entry, copied, onCopy, onAttach, onClose }: { entry: ApiFlowEntry; copied: boolean; onCopy: () => void; onAttach: () => void; onClose: () => void }) {
    const { messages } = useReportPreferences();
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;

    return (
        <aside className="flex min-h-0 min-w-0 flex-1 flex-col border-l border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]">
            <header className="flex shrink-0 items-start justify-between gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-[var(--adaptive-black900)]">
                        {entry.method} {entry.pathname}
                    </p>
                    <p className="mt-[2px] text-[11px] text-[var(--adaptive-black600)]">
                        {statusLabel} · {describeApiFlowStatus(entry, messages)} · {entry.durationMs}ms
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-[6px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[8px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                >
                    {messages.apiFlow.closeDetail}
                </button>
            </header>

            <div className="min-h-0 flex-1 space-y-[10px] overflow-y-auto px-[12px] py-[10px]">
                <div className="flex flex-col gap-[2px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{messages.apiFlow.feedbackUrl}</p>
                    <p className="break-all text-[11px] text-[var(--adaptive-black800)]">{entry.url}</p>
                </div>

                {Object.keys(entry.queryParams).length > 0 ? (
                    <ApiFlowDetailBlock
                        label={messages.apiFlow.detailQueryParams}
                        value={JSON.stringify(entry.queryParams, null, 2)}
                    />
                ) : null}

                <ApiFlowDetailBlock
                    label={messages.apiFlow.detailRequestBody}
                    value={entry.requestBody}
                />
                <ApiFlowDetailBlock
                    label={messages.apiFlow.detailResponseBody}
                    value={entry.responseBody}
                />

                {entry.errorMessage ? (
                    <p className="text-[11px] text-[var(--adaptive-red900)]">
                        {messages.apiFlow.detailError}: {entry.errorMessage}
                    </p>
                ) : null}
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-[8px] border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                <button
                    type="button"
                    onClick={onAttach}
                    className="rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                >
                    {messages.apiFlow.attachToFeedback}
                </button>
                <button
                    type="button"
                    onClick={onCopy}
                    className="rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                >
                    {copied ? messages.apiFlow.copied : messages.apiFlow.copy}
                </button>
            </footer>
        </aside>
    );
}

export function ReportApiFlowPanel() {
    const { messages } = useReportPreferences();
    const { apiFlowEntries, appendApiFlowEntryToDraftCase, networkMonitorEnabled } = useReport();
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);

    const failureCount = useMemo(() => apiFlowEntries.filter((entry) => !entry.ok).length, [apiFlowEntries]);
    const selectedEntry = useMemo(() => (selectedEntryId ? (apiFlowEntries.find((entry) => entry.id === selectedEntryId) ?? null) : null), [apiFlowEntries, selectedEntryId]);

    const handleCopy = async (entry: ApiFlowEntry) => {
        try {
            await navigator.clipboard.writeText(formatApiFlowEntryForCopy(entry));
            setCopiedEntryId(entry.id);
            window.setTimeout(() => setCopiedEntryId((current) => (current === entry.id ? null : current)), 1400);
        } catch {
            setCopiedEntryId(null);
        }
    };

    const list =
        apiFlowEntries.length === 0 ? (
            <p className="px-[12px] py-[16px] text-[12px] text-[var(--adaptive-black500)]">{messages.apiFlow.empty}</p>
        ) : (
            apiFlowEntries.map((entry) => (
                <ApiFlowListRow
                    key={entry.id}
                    entry={entry}
                    selected={selectedEntryId === entry.id}
                    onSelect={() => setSelectedEntryId((current) => (current === entry.id ? null : entry.id))}
                />
            ))
        );

    if (!networkMonitorEnabled) {
        return (
            <section className="bg-[var(--adaptive-black50)] p-[12px]">
                <p className="text-[12px] text-[var(--adaptive-black600)]">{messages.apiFlow.disabled}</p>
            </section>
        );
    }

    return (
        <Fragment>
            <header className="flex shrink-0 items-center gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[8px] text-[11px] font-medium text-[var(--adaptive-black500)]">
                <span>{messages.apiFlow.summaryRequests(apiFlowEntries.length)}</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-[4px]">
                    {messages.apiFlow.summaryFailures(failureCount)}
                    <HoverTooltip
                        label={messages.apiFlow.description}
                        multiline
                    >
                        <span
                            className="inline-flex cursor-help text-[var(--adaptive-black500)]"
                            aria-label={messages.apiFlow.description}
                        >
                            <InfoIcon className="h-[12px] w-[12px]" />
                        </span>
                    </HoverTooltip>
                </span>
            </header>

            {selectedEntry ? (
                <div className={`flex overflow-hidden ${API_FLOW_BODY_HEIGHT}`}>
                    <div className="w-[42%] shrink-0 overflow-y-auto border-r border-[var(--adaptive-border-subtle)]">{list}</div>
                    <ApiFlowDetailPane
                        entry={selectedEntry}
                        copied={copiedEntryId === selectedEntry.id}
                        onCopy={() => void handleCopy(selectedEntry)}
                        onAttach={() => appendApiFlowEntryToDraftCase(selectedEntry.id)}
                        onClose={() => setSelectedEntryId(null)}
                    />
                </div>
            ) : (
                <div className={`overflow-y-auto overscroll-contain`}>{list}</div>
            )}
        </Fragment>
    );
}
