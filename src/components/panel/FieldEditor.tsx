import type { ReportField, ReportFieldValues } from "../../types/report.js";
import { checkboxLabel, fieldBlock, inputBase, textMuted, textareaBase } from "../report/classes.js";

type FieldEditorProps = {
    fields: ReportField[];
    message: string;
    fieldValues: ReportFieldValues;
    onMessageChange: (nextValue: string) => void;
    onFieldChange: (key: string, nextValue: string | boolean) => void;
};

export function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange }: FieldEditorProps) {
    return (
        <>
            {fields.map((field) => {
                if (field.key === "message") {
                    return (
                        <label key={field.key} className={fieldBlock}>
                            <span className={textMuted}>{field.label}</span>
                            <textarea value={message} onChange={(event) => onMessageChange(event.target.value)} className={textareaBase} />
                        </label>
                    );
                }

                if (field.type === "checkbox") {
                    return (
                        <label key={field.key} className={checkboxLabel}>
                            <input type="checkbox" checked={fieldValues[field.key] === true} onChange={(event) => onFieldChange(field.key, event.target.checked)} />
                            <span>{field.label}</span>
                        </label>
                    );
                }

                return (
                    <label key={field.key} className={fieldBlock}>
                        <span className={textMuted}>{field.label}</span>
                        <textarea value={String(fieldValues[field.key] ?? "")} onChange={(event) => onFieldChange(field.key, event.target.value)} className={textareaBase} />
                    </label>
                );
            })}
        </>
    );
}
