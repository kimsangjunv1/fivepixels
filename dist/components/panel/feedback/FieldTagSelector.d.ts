import type { ReportField, ReportFieldValues } from "@/types/report.js";
type FieldTagSelectorProps = {
    fields: ReportField[];
    fieldValues: ReportFieldValues;
    onFieldChange: (key: string, nextValue: boolean) => void;
};
export declare function FieldTagSelector({ fields, fieldValues, onFieldChange }: FieldTagSelectorProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=FieldTagSelector.d.ts.map