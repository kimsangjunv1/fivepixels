import type { ReportMessages } from "@/shared/i18n/types.js";
import type { ApiFlowEntry } from "@/shared/types/networkMonitor.js";
import { redactJsonLikeText } from "./redactNetworkPayload.js";

export function parseApiFlowUrl(url: string): { pathname: string; queryParams: Record<string, string> } {
    try {
        const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        return {
            pathname: parsed.pathname,
            queryParams: Object.fromEntries(parsed.searchParams.entries()),
        };
    } catch {
        return { pathname: url, queryParams: {} };
    }
}

/** Next.js App Router RSC / Flight fetches — noise for host-app API QA. */
export function isRscNetworkRequest(url: string, headers?: Headers): boolean {
    const { queryParams } = parseApiFlowUrl(url);

    if ("_rsc" in queryParams) {
        return true;
    }

    if (!headers) {
        return false;
    }

    const accept = headers.get("accept") ?? "";
    const rscHeader = headers.get("rsc") ?? headers.get("RSC");
    const nextRouterState = headers.get("next-router-state-tree") ?? headers.get("Next-Router-State-Tree");
    const nextRouterPrefetch = headers.get("next-router-prefetch") ?? headers.get("Next-Router-Prefetch");

    return Boolean(rscHeader) || Boolean(nextRouterState) || Boolean(nextRouterPrefetch) || accept.includes("text/x-component");
}

export function describeApiFlowStatus(entry: ApiFlowEntry, messages: ReportMessages): string {
    if (entry.failureKind === "network") {
        return messages.apiFlow.statusNetworkError;
    }

    if (entry.status === null) {
        return messages.apiFlow.statusUnknown;
    }

    if (entry.status >= 500) {
        return messages.apiFlow.statusServerError;
    }

    if (entry.status >= 400) {
        return messages.apiFlow.statusClientError;
    }

    return messages.apiFlow.statusSuccess;
}

export function formatApiFlowSummaryLine(entry: ApiFlowEntry, messages: ReportMessages): string {
    const statusLabel = entry.status ?? messages.apiFlow.statusUnknown;
    const friendly = describeApiFlowStatus(entry, messages);
    const time = new Date(entry.timestamp).toLocaleTimeString();

    return `${entry.method} ${entry.pathname} · ${statusLabel} · ${friendly} · ${time}`;
}

export function formatApiFlowEntryForCopy(entry: ApiFlowEntry): string {
    const payload = {
        id: entry.id,
        timestamp: new Date(entry.timestamp).toISOString(),
        method: entry.method,
        url: entry.url,
        pathname: entry.pathname,
        queryParams: entry.queryParams,
        status: entry.status,
        ok: entry.ok,
        durationMs: entry.durationMs,
        failureKind: entry.failureKind,
        errorMessage: entry.errorMessage,
        requestBody: entry.requestBody ? safeParseJson(entry.requestBody) : null,
        responseBody: entry.responseBody ? safeParseJson(entry.responseBody) : null,
    };

    return JSON.stringify(payload, null, 2);
}

export function formatApiFlowEntryForFeedback(entry: ApiFlowEntry, messages: ReportMessages): string {
    const lines = [
        messages.apiFlow.feedbackTitle,
        formatApiFlowSummaryLine(entry, messages),
        `${messages.apiFlow.feedbackUrl}: ${entry.url}`,
    ];

    if (Object.keys(entry.queryParams).length > 0) {
        lines.push(`${messages.apiFlow.feedbackQueryParams}:\n${JSON.stringify(entry.queryParams, null, 2)}`);
    }

    if (entry.requestBody) {
        lines.push(`${messages.apiFlow.feedbackRequestBody}:\n${redactJsonLikeText(entry.requestBody)}`);
    }

    if (entry.responseBody) {
        lines.push(`${messages.apiFlow.feedbackResponseBody}:\n${redactJsonLikeText(entry.responseBody)}`);
    }

    if (entry.errorMessage) {
        lines.push(`${messages.apiFlow.feedbackErrorMessage}: ${entry.errorMessage}`);
    }

    return lines.join("\n\n");
}

function safeParseJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}
