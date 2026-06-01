import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange }) {
    return (_jsx(_Fragment, { children: fields.map((field) => {
            if (field.key === "message") {
                return (_jsxs("label", { className: "flex flex-col gap-1 text-xs", children: [_jsx("span", { className: "text-[11px] text-slate-500 dark:text-slate-400", children: field.label }), _jsx("textarea", { value: message, onChange: (event) => onMessageChange(event.target.value), className: "h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700" })] }, field.key));
            }
            if (field.type === "checkbox") {
                return (_jsxs("label", { className: "flex flex-row items-center gap-2 text-xs text-slate-700 dark:text-slate-200", children: [_jsx("input", { type: "checkbox", className: "h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-600", checked: fieldValues[field.key] === true, onChange: (event) => onFieldChange(field.key, event.target.checked) }), _jsx("span", { children: field.label })] }, field.key));
            }
            return (_jsxs("label", { className: "flex flex-col gap-1 text-xs", children: [_jsx("span", { className: "text-[11px] text-slate-500 dark:text-slate-400", children: field.label }), _jsx("textarea", { value: String(fieldValues[field.key] ?? ""), onChange: (event) => onFieldChange(field.key, event.target.value), className: "h-16 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700" })] }, field.key));
        }) }));
}
//# sourceMappingURL=FieldEditor.js.map