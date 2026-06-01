import type { ReportField, ReportFieldValues } from "../../types/report.js";
import { textareaBase } from "../report/classes.js";

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
                        <label key={field.key} className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{field.label}</span>
                            <textarea
                                value={message}
                                onChange={(event) => onMessageChange(event.target.value)}
                                className={textareaBase}
                            />
                        </label>
                    );
                }

                if (field.type === "checkbox") {
                    return (
                        <label key={field.key} className="pointer-events-auto flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                            <input
                                type="checkbox"
                                className="pointer-events-auto h-4 w-4 rounded border-slate-300"
                                checked={fieldValues[field.key] === true}
                                onChange={(event) => onFieldChange(field.key, event.target.checked)}
                            />
                            <span>{field.label}</span>
                        </label>
                    );
                }

                return (
                    <label key={field.key} className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{field.label}</span>
                        <textarea
                            value={String(fieldValues[field.key] ?? "")}
                            onChange={(event) => onFieldChange(field.key, event.target.value)}
                            className={textareaBase}
                        />
                    </label>
                );
            })}
        </>
    );
}
