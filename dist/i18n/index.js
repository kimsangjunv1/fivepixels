import { en } from "./en.js";
import { ko } from "./ko.js";
const MESSAGES_BY_LOCALE = {
    en,
    ko,
};
let activeMessages = en;
export function resolveReportLocale(locale) {
    if (locale) {
        return locale;
    }
    if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ko")) {
        return "ko";
    }
    return "en";
}
function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function mergeMessages(base, override) {
    if (!override) {
        return base;
    }
    const next = { ...base };
    for (const key of Object.keys(override)) {
        const overrideValue = override[key];
        const baseValue = base[key];
        if (typeof overrideValue === "function") {
            next[key] = overrideValue;
            continue;
        }
        if (isPlainObject(overrideValue) && isPlainObject(baseValue)) {
            next[key] = {
                ...baseValue,
                ...overrideValue,
            };
            continue;
        }
        if (overrideValue !== undefined) {
            next[key] = overrideValue;
        }
    }
    return next;
}
export function getReportMessages(locale, overrides) {
    return mergeMessages(MESSAGES_BY_LOCALE[locale], overrides);
}
export function setActiveReportMessages(messages) {
    activeMessages = messages;
}
export function getActiveReportMessages() {
    return activeMessages;
}
export function getDefaultFields(messages) {
    return [
        { key: "message", type: "textarea", label: messages.defaults.fields.message, required: true },
        { key: "checkbox1", type: "checkbox", label: messages.defaults.fields.checkbox1 },
        { key: "checkbox2", type: "checkbox", label: messages.defaults.fields.checkbox2 },
    ];
}
export { en } from "./en.js";
export { ko } from "./ko.js";
//# sourceMappingURL=index.js.map