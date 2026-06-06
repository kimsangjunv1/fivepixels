import { jsx as _jsx } from "react/jsx-runtime";
export function FieldTagSelector({ fields, fieldValues, onFieldChange }) {
    const tagFields = fields.filter((field) => field.type === "checkbox");
    if (tagFields.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "flex flex-wrap items-center gap-[8px] border-t border-[var(--adaptive-blackOpacity200)] px-[16px] py-[12px]", children: tagFields.map((field) => {
            const selected = fieldValues[field.key] === true;
            return (_jsx("button", { type: "button", onClick: () => onFieldChange(field.key, !selected), className: selected
                    ? "rounded-full border border-[var(--adaptive-black900)] px-[12px] py-[6px] text-[12px] font-semibold uppercase text-[var(--adaptive-black900)]"
                    : "rounded-full border border-[var(--adaptive-black400)] px-[12px] py-[6px] text-[12px] font-semibold uppercase text-[var(--adaptive-black500)]", children: field.label }, field.key));
        }) }));
}
//# sourceMappingURL=FieldTagSelector.js.map