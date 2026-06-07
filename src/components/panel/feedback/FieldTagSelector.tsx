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
        <div className="flex flex-wrap items-center gap-[8px] border-t border-[var(--adaptive-blackOpacity200)] px-[16px] py-[12px]">
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
                                ? "bg-[var(--adaptive-black900)] border-[var(--adaptive-black300)] text-[var(--adaptive-black300)]"
                                : "border-[var(--adaptive-black800)] text-[var(--adaptive-black500)]")
                        }
                    >
                        {field.label}
                    </button>
                );
            })}
        </div>
    );
}
