import { en } from "./en.js";
import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "./types.js";

let koMessages: ReportMessages | null = null;
let koMessagesPromise: Promise<ReportMessages> | null = null;

let activeMessages: ReportMessages = en;

export function resolveReportLocale(locale?: ReportLocale): ReportLocale {
    if (locale) {
        return locale;
    }

    if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ko")) {
        return "ko";
    }

    return "en";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeMessages(base: ReportMessages, override?: DeepPartialReportMessages): ReportMessages {
    if (!override) {
        return base;
    }

    const next = { ...base } as ReportMessages;

    for (const key of Object.keys(override) as Array<keyof ReportMessages>) {
        const overrideValue = override[key];
        const baseValue = base[key];

        if (typeof overrideValue === "function") {
            (next as Record<keyof ReportMessages, ReportMessages[keyof ReportMessages]>)[key] = overrideValue as ReportMessages[typeof key];
            continue;
        }

        if (isPlainObject(overrideValue) && isPlainObject(baseValue)) {
            (next as Record<keyof ReportMessages, ReportMessages[keyof ReportMessages]>)[key] = {
                ...baseValue,
                ...overrideValue,
            } as ReportMessages[typeof key];
            continue;
        }

        if (overrideValue !== undefined) {
            (next as Record<keyof ReportMessages, ReportMessages[keyof ReportMessages]>)[key] = overrideValue as ReportMessages[typeof key];
        }
    }

    return next;
}

function getLocaleMessages(locale: ReportLocale): ReportMessages {
    if (locale === "ko") {
        return koMessages ?? en;
    }

    return en;
}

export async function ensureReportLocaleMessages(locale: ReportLocale): Promise<void> {
    if (locale !== "ko" || koMessages) {
        return;
    }

    if (!koMessagesPromise) {
        koMessagesPromise = import("./ko.js").then((module) => {
            koMessages = module.ko;
            return koMessages;
        });
    }

    await koMessagesPromise;
}

export function getReportMessages(locale: ReportLocale, overrides?: DeepPartialReportMessages): ReportMessages {
    return mergeMessages(getLocaleMessages(locale), overrides);
}

export function setActiveReportMessages(messages: ReportMessages) {
    activeMessages = messages;
}

export function getActiveReportMessages() {
    return activeMessages;
}

export function getDefaultFields(messages: ReportMessages) {
    return [
        { key: "message", type: "textarea" as const, label: messages.defaults.fields.message, required: true },
        { key: "checkbox1", type: "checkbox" as const, label: messages.defaults.fields.checkbox1 },
        { key: "checkbox2", type: "checkbox" as const, label: messages.defaults.fields.checkbox2 },
    ];
}

export type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "./types.js";
export { en } from "./en.js";
