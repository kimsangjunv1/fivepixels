import type { ReportMessages } from "../../i18n/types.js";
import type { ApiFlowEntry } from "../../types/networkMonitor.js";
export declare function parseApiFlowUrl(url: string): {
    pathname: string;
    queryParams: Record<string, string>;
};
export declare function describeApiFlowStatus(entry: ApiFlowEntry, messages: ReportMessages): string;
export declare function formatApiFlowSummaryLine(entry: ApiFlowEntry, messages: ReportMessages): string;
export declare function formatApiFlowEntryForCopy(entry: ApiFlowEntry): string;
export declare function formatApiFlowEntryForFeedback(entry: ApiFlowEntry, messages: ReportMessages): string;
//# sourceMappingURL=formatApiFlowEntry.d.ts.map