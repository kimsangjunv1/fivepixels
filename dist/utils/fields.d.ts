import type { ReportField, ReportFieldValues } from "../types/report.js";
export declare function createInitialFieldValues(fields: ReportField[], source?: ReportFieldValues): ReportFieldValues;
export declare function getFieldError(message: string, fieldValues: ReportFieldValues, fields: ReportField[]): string;
export declare function getFieldTags(fields: ReportField[], fieldValues: ReportFieldValues): {
    key: string;
    label: string;
}[];
//# sourceMappingURL=fields.d.ts.map