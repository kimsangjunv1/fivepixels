export function createInitialFieldValues(fields, source) {
    return fields.reduce((acc, field) => {
        if (field.key === "message") {
            return acc;
        }
        if (source && field.key in source) {
            acc[field.key] = source[field.key];
            return acc;
        }
        acc[field.key] = field.type === "checkbox" ? false : "";
        return acc;
    }, {});
}
export function getFieldError(message, fieldValues, fields) {
    for (const field of fields) {
        if (!field.required) {
            continue;
        }
        if (field.key === "message" && !message.trim()) {
            return `${field.label}을 입력해주세요.`;
        }
        if (field.type === "checkbox" && fieldValues[field.key] !== true) {
            return `${field.label}을 확인해주세요.`;
        }
        if (field.type === "textarea" && field.key !== "message" && !String(fieldValues[field.key] ?? "").trim()) {
            return `${field.label}을 입력해주세요.`;
        }
    }
    return "";
}
export function getFieldTags(fields, fieldValues) {
    return fields.flatMap((field) => {
        if (field.key === "message") {
            return [];
        }
        if (field.type === "checkbox") {
            return fieldValues[field.key] === true ? [{ key: field.key, label: field.label }] : [];
        }
        const value = String(fieldValues[field.key] ?? "").trim();
        return value ? [{ key: field.key, label: `${field.label}: ${value}` }] : [];
    });
}
//# sourceMappingURL=fields.js.map