import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { reportStyles } from "../report/styles.js";
export function FieldEditor({ fields, message, fieldValues, palette, onMessageChange, onFieldChange }) {
    return (_jsx(_Fragment, { children: fields.map((field) => {
            if (field.key === "message") {
                return (_jsxs("label", { style: reportStyles.fieldBlock, children: [_jsx("span", { style: { ...reportStyles.fieldLabel, color: palette.text }, children: field.label }), _jsx("textarea", { value: message, onChange: (event) => onMessageChange(event.target.value), style: {
                                ...reportStyles.textarea,
                                backgroundColor: palette.input,
                                borderColor: palette.inputBorder,
                                color: palette.inputText,
                            } })] }, field.key));
            }
            if (field.type === "checkbox") {
                return (_jsxs("label", { style: { ...reportStyles.checkboxRow, color: palette.text }, children: [_jsx("input", { type: "checkbox", checked: fieldValues[field.key] === true, onChange: (event) => onFieldChange(field.key, event.target.checked) }), _jsx("span", { children: field.label })] }, field.key));
            }
            return (_jsxs("label", { style: reportStyles.fieldBlock, children: [_jsx("span", { style: { ...reportStyles.fieldLabel, color: palette.text }, children: field.label }), _jsx("textarea", { value: String(fieldValues[field.key] ?? ""), onChange: (event) => onFieldChange(field.key, event.target.value), style: {
                            ...reportStyles.textarea,
                            backgroundColor: palette.input,
                            borderColor: palette.inputBorder,
                            color: palette.inputText,
                        } })] }, field.key));
        }) }));
}
//# sourceMappingURL=FieldEditor.js.map