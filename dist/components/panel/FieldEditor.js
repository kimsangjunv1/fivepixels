import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function renderNonCheckboxField(field, { isDraftBubble, message, fieldValues, onMessageChange, onFieldChange, }) {
    if (field.key === "message") {
        return (_jsx("label", { className: `${isDraftBubble ? "flex flex-col gap-1" : "flex flex-col gap-1 text-xs"} w-full`, children: _jsx("textarea", { autoFocus: isDraftBubble, value: message, onChange: (event) => onMessageChange(event.target.value), className: "bg-[var(--adaptive-grey50)] rounded-[16px] shadow-[var(--shadow-normal)] p-[14px]", placeholder: "\uD53C\uB4DC\uBC31\uC744 \uB0A8\uACA8\uC8FC\uC138\uC694" }) }, field.key));
    }
    return (_jsxs("label", { className: "flex flex-col gap-1 text-xs", children: [_jsx("span", { className: "text-[11px] text-slate-500 dark:text-slate-400", children: field.label }), _jsx("textarea", { value: String(fieldValues[field.key] ?? ""), onChange: (event) => onFieldChange(field.key, event.target.value), className: "h-16 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700" })] }, field.key));
}
export function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange, variant = "default" }) {
    const isDraftBubble = variant === "draft-bubble";
    const fieldsToRender = isDraftBubble ? fields.filter((field) => field.type !== "checkbox") : fields;
    return (_jsx("div", { className: "w-full", children: fieldsToRender.map((field) => {
            if (field.type === "checkbox") {
                return (_jsxs("label", { className: "flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200", children: [_jsx("input", { type: "checkbox", className: "h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-600", checked: fieldValues[field.key] === true, onChange: (event) => onFieldChange(field.key, event.target.checked) }), _jsx("span", { children: field.label })] }, field.key));
            }
            return renderNonCheckboxField(field, {
                isDraftBubble,
                message,
                fieldValues,
                onMessageChange,
                onFieldChange,
            });
        }) }));
}
//# sourceMappingURL=FieldEditor.js.map