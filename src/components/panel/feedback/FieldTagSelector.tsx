import type { ReportField, ReportFieldValues } from "@/types/report.js";

type FieldTagSelectorProps = {
    fields: ReportField[];
    fieldValues: ReportFieldValues;
    onFieldChange: (key: string, nextValue: boolean) => void;
};

export function FieldTagSelector({ fields, fieldValues, onFieldChange }: FieldTagSelectorProps) {
    const tagFields = fields.filter((field) => field.type === "checkbox");

    if (tagFields.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-[8px] border-t border-[var(--adaptive-blackOpacity100)] p-[8px]">
            {tagFields.map((field) => {
                const selected = fieldValues[field.key] === true;

                return (
                    <button
                        key={field.key}
                        type="button"
                        onClick={() => onFieldChange(field.key, !selected)}
                        className={
                            "rounded-[8px] border px-[12px] py-[4px] text-[12px] font-semibold uppercase " +
                            (selected
                                ? "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-inverse)] text-[var(--adaptive-text-inverse)]"
                                : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-muted)]")
                        }
                    >
                        {field.label}
                    </button>
                );
            })}
        </div>
    );
}
