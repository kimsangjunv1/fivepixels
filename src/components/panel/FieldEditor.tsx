import type { ReportField, ReportFieldValues } from "@/types/report.js";
import { useReportPreferences } from "@/providers/reportContext.js";

type FieldEditorProps = {
    fields: ReportField[];
    message: string;
    fieldValues: ReportFieldValues;
    onMessageChange: (nextValue: string) => void;
    onFieldChange: (key: string, nextValue: string | boolean) => void;
    variant?: "default" | "draft-bubble";
};

function renderNonCheckboxField(
    field: ReportField,
    {
        isDraftBubble,
        message,
        fieldValues,
        onMessageChange,
        onFieldChange,
        messagePlaceholder,
    }: {
        isDraftBubble: boolean;
        message: string;
        fieldValues: ReportFieldValues;
        onMessageChange: (nextValue: string) => void;
        onFieldChange: (key: string, nextValue: string | boolean) => void;
        messagePlaceholder: string;
    },
) {
    if (field.key === "message") {
        return (
            <label
                key={field.key}
                className={`${isDraftBubble ? "flex flex-col gap-1" : "flex flex-col gap-1 text-xs"} w-full`}
            >
                <textarea
                    autoFocus={isDraftBubble}
                    value={message}
                    onChange={(event) => onMessageChange(event.target.value)}
                    className="bg-[var(--adaptive-surface)] p-[14px] focus:border-none focus:stroke-none focus:outline-none"
                    placeholder={messagePlaceholder}
                />
            </label>
        );
    }

    return (
        <label
            key={field.key}
            className="flex flex-col gap-1 text-xs"
        >
            <span className="text-[12px] text-[var(--adaptive-text-muted)]">{field.label}</span>
            <textarea
                value={String(fieldValues[field.key] ?? "")}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                className="h-16 w-full resize-none rounded-md border border-[var(--adaptive-border)] bg-[var(--adaptive-surface)] px-2 py-1 text-xs text-[var(--adaptive-text-primary)] shadow-sm outline-none ring-0 placeholder:text-[var(--adaptive-text-muted)] focus:border-[var(--adaptive-text-muted)]"
            />
        </label>
    );
}

export function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange, variant = "default" }: FieldEditorProps) {
    const { messages } = useReportPreferences();
    const isDraftBubble = variant === "draft-bubble";
    const fieldsToRender = isDraftBubble ? fields.filter((field) => field.type !== "checkbox") : fields;

    return (
        <div className="w-full">
            {fieldsToRender.map((field) => {
                if (field.type === "checkbox") {
                    return (
                        <label
                            key={field.key}
                            className="flex items-center gap-2 text-xs text-[var(--adaptive-text-secondary)]"
                        >
                            <input
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-[var(--adaptive-border)] text-[var(--adaptive-blue500)]"
                                checked={fieldValues[field.key] === true}
                                onChange={(event) => onFieldChange(field.key, event.target.checked)}
                            />
                            <span>{field.label}</span>
                        </label>
                    );
                }

                return renderNonCheckboxField(field, {
                    isDraftBubble,
                    message,
                    fieldValues,
                    onMessageChange,
                    onFieldChange,
                    messagePlaceholder: messages.fieldEditor.messagePlaceholder,
                });
            })}
        </div>
    );
}
