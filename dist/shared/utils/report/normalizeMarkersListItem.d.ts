import type { ReportCase, ReportFeedback } from "../../../shared/types/report.js";
export type NormalizeMarkersListOptions = {
    pathname?: string;
};
/**
 * Marker list payloads may ship stub cases (`{ status, version }`) without id/text.
 * Fill the minimum fields so marker UI can render without crashing.
 */
export declare function normalizeMarkersListCases(value: unknown, fallbackTimestamp: string): ReportCase[];
/**
 * Normalize backend markers.list snake_case (possibly abbreviated) payloads into `ReportFeedback`.
 */
export declare function normalizeMarkersListItem(value: unknown, options?: NormalizeMarkersListOptions): ReportFeedback | null;
export declare function normalizeMarkersListItems(values: unknown, options?: NormalizeMarkersListOptions): ReportFeedback[];
//# sourceMappingURL=normalizeMarkersListItem.d.ts.map