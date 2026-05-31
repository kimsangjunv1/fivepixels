import type { ReportField, ReportFieldValues } from "../../types/report.js";
type FieldEditorProps = {
    fields: ReportField[];
    message: string;
    fieldValues: ReportFieldValues;
    onMessageChange: (nextValue: string) => void;
    onFieldChange: (key: string, nextValue: string | boolean) => void;
};
export declare function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange }: FieldEditorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FieldEditor.d.ts.map