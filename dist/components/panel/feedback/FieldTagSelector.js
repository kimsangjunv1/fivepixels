import { jsx as _jsx } from "react/jsx-runtime";
export function FieldTagSelector({ fields, fieldValues, onFieldChange }) {
    const tagFields = fields.filter((field) => field.type === "checkbox");
    if (tagFields.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "flex flex-wrap items-center gap-[8px] border-t border-[var(--adaptive-blackOpacity100)] p-[8px]", children: tagFields.map((field) => {
            const selected = fieldValues[field.key] === true;
            return (_jsx("button", { type: "button", onClick: () => onFieldChange(field.key, !selected), className: "rounded-[8px] border px-[12px] py-[4px] text-[12px] font-semibold uppercase " +
                    (selected
                        ? "border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface-inverse)] text-[var(--adaptive-text-inverse)]"
                        : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-text-muted)]"), children: field.label }, field.key));
        }) }));
}
//# sourceMappingURL=FieldTagSelector.js.map