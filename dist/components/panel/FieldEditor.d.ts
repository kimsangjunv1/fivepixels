import type { ReportField, ReportFieldValues } from "../../types/report.js";
type FieldEditorProps = {
    fields: ReportField[];
    message: string;
    fieldValues: ReportFieldValues;
    onMessageChange: (nextValue: string) => void;
    onFieldChange: (key: string, nextValue: string | boolean) => void;
    variant?: "default" | "draft-bubble";
};
export declare function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange, variant }: FieldEditorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FieldEditor.d.ts.map