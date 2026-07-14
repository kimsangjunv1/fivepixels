import type { ReportCase } from "../types/report.js";
import type { ReportField, ReportFieldValues } from "../types/report.js";
import type { ReportMessages } from "../i18n/types.js";
export declare function createInitialFieldValues(fields: ReportField[], source?: ReportFieldValues): ReportFieldValues;
type FieldErrorMessages = Pick<ReportMessages["errors"], "fieldRequiredInput" | "fieldRequiredConfirm" | "casesRequired" | "caseTextRequired">;
export declare function getFieldError(cases: ReportCase[], fieldValues: ReportFieldValues, fields: ReportField[], fieldErrors: FieldErrorMessages): string;
export declare function getFieldTags(fields: ReportField[], fieldValues: ReportFieldValues): {
    key: string;
    label: string;
}[];
export {};
//# sourceMappingURL=fields.d.ts.map