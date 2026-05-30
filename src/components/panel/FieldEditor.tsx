import type { ReportField, ReportFieldValues } from "../../types/report.js";
import type { ReportPalette } from "../../hooks/usePalette.js";
import { reportStyles } from "../report/styles.js";

type FieldEditorProps = {
    fields: ReportField[];
    message: string;
    fieldValues: ReportFieldValues;
    palette: ReportPalette;
    onMessageChange: (nextValue: string) => void;
    onFieldChange: (key: string, nextValue: string | boolean) => void;
};

export function FieldEditor({ fields, message, fieldValues, palette, onMessageChange, onFieldChange }: FieldEditorProps) {
    return (
        <>
            {fields.map((field) => {
                if (field.key === "message") {
                    return (
                        <label
                            key={field.key}
                            style={reportStyles.fieldBlock}
                        >
                            <span style={{ ...reportStyles.fieldLabel, color: palette.text }}>{field.label}</span>
                            <textarea
                                value={message}
                                onChange={(event) => onMessageChange(event.target.value)}
                                style={{
                                    ...reportStyles.textarea,
                                    backgroundColor: palette.input,
                                    borderColor: palette.inputBorder,
                                    color: palette.inputText,
                                }}
                            />
                        </label>
                    );
                }

                if (field.type === "checkbox") {
                    return (
                        <label
                            key={field.key}
                            style={{ ...reportStyles.checkboxRow, color: palette.text }}
                        >
                            <input
                                type="checkbox"
                                checked={fieldValues[field.key] === true}
                                onChange={(event) => onFieldChange(field.key, event.target.checked)}
                            />
                            <span>{field.label}</span>
                        </label>
                    );
                }

                return (
                    <label
                        key={field.key}
                        style={reportStyles.fieldBlock}
                    >
                        <span style={{ ...reportStyles.fieldLabel, color: palette.text }}>{field.label}</span>
                        <textarea
                            value={String(fieldValues[field.key] ?? "")}
                            onChange={(event) => onFieldChange(field.key, event.target.value)}
                            style={{
                                ...reportStyles.textarea,
                                backgroundColor: palette.input,
                                borderColor: palette.inputBorder,
                                color: palette.inputText,
                            }}
                        />
                    </label>
                );
            })}
        </>
    );
}
