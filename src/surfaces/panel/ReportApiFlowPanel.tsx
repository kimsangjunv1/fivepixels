import { Fragment, useMemo, useState } from "react";
import type { ApiFlowEntry } from "@/shared/types/networkMonitor.js";
import { CopyIcon, InfoIcon } from "@/shared/components/icons/Icons.js";
import { HoverTooltip } from "@/surfaces/tooltip/HoverTooltip.js";
import { OptionSwitch } from "@/shared/components/ui/OptionSwitch.js";
import { NoticeDialog } from "@/shared/components/ui/NoticeDialog.js";
import { useReportData, useReportPreferences } from "@/shared/providers/reportContext.js";
import { describeApiFlowStatus } from "@/shared/utils/network/formatApiFlowEntry.js";
import { redactJsonLikeText } from "@/shared/utils/network/redactNetworkPayload.js";

/** Shared height budget for list / split panes — keeps overflow-y-auto independent of parent flex height. */
const API_FLOW_BODY_HEIGHT = "h-[min(52dvh,calc(100svh-280px))]";

type ApiFlowFilter = "all" | "success" | "failure";

function formatListTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function ApiFlowCopyButton({ copied, label, onCopy }: { copied: boolean; label: string; onCopy: () => void }) {
    const { messages } = useReportPreferences();

    return (
        <HoverTooltip label={copied ? messages.apiFlow.copied : messages.apiFlow.copy}>
            <button
                type="button"
                onClick={onCopy}
                aria-label={label}
                className="flex h-[20px] w-[20px] shrink-0 items-center justify-center text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black900)]"
            >
                {copied ? <span className="text-[9px] font-semibold">{messages.common.ok}</span> : <CopyIcon className="h-[12px] w-[12px]" />}
            </button>
        </HoverTooltip>
    );
}

function ApiFlowDetailSectionHeader({ label, copied, copyLabel, onCopy }: { label: string; copied: boolean; copyLabel: string; onCopy: () => void }) {
    return (
        <div className="flex items-center justify-between gap-[8px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{label}</p>
            <ApiFlowCopyButton
                copied={copied}
                label={copyLabel}
                onCopy={onCopy}
            />
        </div>
    );
}

function ApiFlowDetailReadOnlyBlock({ label, value }: { label: string; value: string | null }) {
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

function ApiFlowDetailBlock({ label, value, copied, copyLabel, onCopy }: { label: string; value: string | null; copied: boolean; copyLabel: string; onCopy: () => void }) {
    if (!value) {
        return null;
    }

    return (
        <div className="flex flex-col gap-[4px]">
            <ApiFlowDetailSectionHeader
                label={label}
                copied={copied}
                copyLabel={copyLabel}
                onCopy={onCopy}
            />
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

function ApiFlowDetailPane({
    entry,
    copiedField,
    onCopyField,
    onClose,
}: {
    entry: ApiFlowEntry;
    copiedField: string | null;
    onCopyField: (field: "url" | "query" | "response", text: string) => void;
    onClose: () => void;
}) {
    const { messages } = useReportPreferences();
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;
    const queryParamsValue = Object.keys(entry.queryParams).length > 0 ? JSON.stringify(entry.queryParams, null, 2) : null;
    const responseBodyValue = entry.responseBody ? redactJsonLikeText(entry.responseBody) : null;

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
                <div className="flex flex-col gap-[4px]">
                    <ApiFlowDetailSectionHeader
                        label={messages.apiFlow.feedbackUrl}
                        copied={copiedField === "url"}
                        copyLabel={`${messages.apiFlow.copy} ${messages.apiFlow.feedbackUrl}`}
                        onCopy={() => onCopyField("url", entry.url)}
                    />
                    <p className="break-all text-[11px] text-[var(--adaptive-black800)]">{entry.url}</p>
                </div>

                {queryParamsValue ? (
                    <ApiFlowDetailBlock
                        label={messages.apiFlow.detailQueryParams}
                        value={queryParamsValue}
                        copied={copiedField === "query"}
                        copyLabel={`${messages.apiFlow.copy} ${messages.apiFlow.detailQueryParams}`}
                        onCopy={() => onCopyField("query", queryParamsValue)}
                    />
                ) : null}

                <ApiFlowDetailReadOnlyBlock
                    label={messages.apiFlow.detailRequestBody}
                    value={entry.requestBody}
                />

                {entry.responseBody ? (
                    <ApiFlowDetailBlock
                        label={messages.apiFlow.detailResponseBody}
                        value={entry.responseBody}
                        copied={copiedField === "response"}
                        copyLabel={`${messages.apiFlow.copy} ${messages.apiFlow.detailResponseBody}`}
                        onCopy={() => onCopyField("response", responseBodyValue ?? "")}
                    />
                ) : null}

                {entry.errorMessage ? (
                    <p className="text-[11px] text-[var(--adaptive-red900)]">
                        {messages.apiFlow.detailError}: {entry.errorMessage}
                    </p>
                ) : null}
            </div>
        </aside>
    );
}

export function ReportApiFlowPanel() {
    const { messages } = useReportPreferences();
    const { apiFlowEntries, networkMonitorEnabled } = useReportData();
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [filter, setFilter] = useState<ApiFlowFilter>("all");
    const [copiedField, setCopiedField] = useState<string | null>(null);

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

    const filterOptions = useMemo(
        () =>
            [
                { value: "all" as const, label: messages.apiFlow.filterAll },
                { value: "success" as const, label: messages.apiFlow.filterSuccess },
                { value: "failure" as const, label: messages.apiFlow.filterFailure },
            ] as const,
        [messages.apiFlow.filterAll, messages.apiFlow.filterFailure, messages.apiFlow.filterSuccess],
    );

    const handleCopyField = async (field: "url" | "query" | "response", text: string) => {
        const copied = await copyToClipboard(text);
        if (!copied) {
            setCopiedField(null);
            return;
        }

        setCopiedField(field);
        window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1400);
    };

    const list =
        apiFlowEntries.length === 0 ? (
            <NoticeDialog
                role="status"
                title={messages.apiFlow.empty}
            />
        ) : filteredEntries.length === 0 ? (
            <NoticeDialog
                role="status"
                title={messages.apiFlow.emptyFiltered}
            />
        ) : (
            filteredEntries.map((entry) => (
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
            <section className="bg-[var(--adaptive-black50)]">
                <NoticeDialog
                    role="status"
                    title={messages.apiFlow.disabled}
                />
            </section>
        );
    }

    return (
        <Fragment>
            <header className="flex shrink-0 border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[4px] py-[4px]">
                <section className="flex-1 flex gap-[4px] shrink-0 items-center">
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
                </section>

                <section className="min-w-0 flex-1">
                    <OptionSwitch
                        options={filterOptions}
                        value={filter}
                        onChange={(next) => {
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
                        }}
                        ariaLabel={messages.apiFlow.filterAriaLabel}
                    />
                </section>
            </header>

            {selectedEntry ? (
                <div className={`flex overflow-hidden ${API_FLOW_BODY_HEIGHT}`}>
                    <div className="w-[42%] shrink-0 overflow-y-auto border-r border-[var(--adaptive-border-subtle)]">{list}</div>
                    <ApiFlowDetailPane
                        entry={selectedEntry}
                        copiedField={copiedField}
                        onCopyField={(field, text) => void handleCopyField(field, text)}
                        onClose={() => setSelectedEntryId(null)}
                    />
                </div>
            ) : (
                <div className="overflow-y-auto overscroll-contain">{list}</div>
            )}
        </Fragment>
    );
}
