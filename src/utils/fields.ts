import type { ReportField, ReportFieldValues } from "@/types/report.js";
import type { ReportMessages } from "@/i18n/types.js";

export function createInitialFieldValues(fields: ReportField[], source?: ReportFieldValues) {
    return fields.reduce<ReportFieldValues>((acc, field) => {
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

type FieldErrorMessages = Pick<ReportMessages["errors"], "fieldRequiredInput" | "fieldRequiredConfirm">;

export function getFieldError(message: string, fieldValues: ReportFieldValues, fields: ReportField[], fieldErrors: FieldErrorMessages) {
    for (const field of fields) {
        if (!field.required) {
            continue;
        }

        if (field.key === "message" && !message.trim()) {
            return fieldErrors.fieldRequiredInput(field.label);
        }

        if (field.type === "checkbox" && fieldValues[field.key] !== true) {
            return fieldErrors.fieldRequiredConfirm(field.label);
        }

        if (field.type === "textarea" && field.key !== "message" && !String(fieldValues[field.key] ?? "").trim()) {
            return fieldErrors.fieldRequiredInput(field.label);
        }
    }

    return "";
}

export function getFieldTags(fields: ReportField[], fieldValues: ReportFieldValues) {
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
