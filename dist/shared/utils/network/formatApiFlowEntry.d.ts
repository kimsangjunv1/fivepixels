import type { ReportMessages } from "../../../shared/i18n/types.js";
import type { ApiFlowEntry } from "../../../shared/types/networkMonitor.js";
export declare function parseApiFlowUrl(url: string): {
    pathname: string;
    queryParams: Record<string, string>;
};
/** Next.js App Router RSC / Flight fetches — noise for host-app API QA. */
export declare function isRscNetworkRequest(url: string, headers?: Headers): boolean;
export declare function describeApiFlowStatus(entry: ApiFlowEntry, messages: ReportMessages): string;
export declare function formatApiFlowSummaryLine(entry: ApiFlowEntry, messages: ReportMessages): string;
export declare function formatApiFlowEntryForCopy(entry: ApiFlowEntry): string;
export declare function formatApiFlowEntryForFeedback(entry: ApiFlowEntry, messages: ReportMessages): string;
//# sourceMappingURL=formatApiFlowEntry.d.ts.map