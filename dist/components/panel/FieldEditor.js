import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { textareaBase } from "../report/classes.js";
export function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange }) {
    return (_jsx(_Fragment, { children: fields.map((field) => {
            if (field.key === "message") {
                return (_jsxs("label", { className: "flex flex-col gap-1.5", children: [_jsx("span", { className: "text-xs font-medium text-slate-600 dark:text-slate-300", children: field.label }), _jsx("textarea", { value: message, onChange: (event) => onMessageChange(event.target.value), className: textareaBase })] }, field.key));
            }
            if (field.type === "checkbox") {
                return (_jsxs("label", { className: "pointer-events-auto flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200", children: [_jsx("input", { type: "checkbox", className: "pointer-events-auto h-4 w-4 rounded border-slate-300", checked: fieldValues[field.key] === true, onChange: (event) => onFieldChange(field.key, event.target.checked) }), _jsx("span", { children: field.label })] }, field.key));
            }
            return (_jsxs("label", { className: "flex flex-col gap-1.5", children: [_jsx("span", { className: "text-xs font-medium text-slate-600 dark:text-slate-300", children: field.label }), _jsx("textarea", { value: String(fieldValues[field.key] ?? ""), onChange: (event) => onFieldChange(field.key, event.target.value), className: textareaBase })] }, field.key));
        }) }));
}
//# sourceMappingURL=FieldEditor.js.map