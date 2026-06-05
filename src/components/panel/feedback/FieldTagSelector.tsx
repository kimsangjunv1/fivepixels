import type { ReportField, ReportFieldValues } from "../../../types/report.js";

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
                            selected
                                ? "rounded-full border border-[var(--adaptive-black900)] px-[12px] py-[6px] text-[12px] font-semibold uppercase tracking-wide text-[var(--adaptive-black900)]"
                                : "rounded-full border border-[var(--adaptive-black400)] px-[12px] py-[6px] text-[12px] font-semibold uppercase tracking-wide text-[var(--adaptive-black500)]"
                        }
                    >
                        {field.label}
                    </button>
                );
            })}
        </div>
    );
}
