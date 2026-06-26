import type { ReportField, ReportFieldValues } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";
export declare function createInitialFieldValues(fields: ReportField[], source?: ReportFieldValues): ReportFieldValues;
type FieldErrorMessages = Pick<ReportMessages["errors"], "fieldRequiredInput" | "fieldRequiredConfirm">;
export declare function getFieldError(message: string, fieldValues: ReportFieldValues, fields: ReportField[], fieldErrors: FieldErrorMessages): string;
export declare function getFieldTags(fields: ReportField[], fieldValues: ReportFieldValues): {
    key: string;
    label: string;
}[];
export {};
//# sourceMappingURL=fields.d.ts.map