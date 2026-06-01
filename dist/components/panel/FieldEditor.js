import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { checkboxLabel, fieldBlock, textMuted, textareaBase } from "../report/classes.js";
export function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange }) {
    return (_jsx(_Fragment, { children: fields.map((field) => {
            if (field.key === "message") {
                return (_jsxs("label", { className: fieldBlock, children: [_jsx("span", { className: textMuted, children: field.label }), _jsx("textarea", { value: message, onChange: (event) => onMessageChange(event.target.value), className: textareaBase })] }, field.key));
            }
            if (field.type === "checkbox") {
                return (_jsxs("label", { className: checkboxLabel, children: [_jsx("input", { type: "checkbox", checked: fieldValues[field.key] === true, onChange: (event) => onFieldChange(field.key, event.target.checked) }), _jsx("span", { children: field.label })] }, field.key));
            }
            return (_jsxs("label", { className: fieldBlock, children: [_jsx("span", { className: textMuted, children: field.label }), _jsx("textarea", { value: String(fieldValues[field.key] ?? ""), onChange: (event) => onFieldChange(field.key, event.target.value), className: textareaBase })] }, field.key));
        }) }));
}
//# sourceMappingURL=FieldEditor.js.map