import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "@/i18n/index.js";
import { getReportMessages, resolveReportLocale } from "@/i18n/index.js";
import type { QuestionThreadDisplay, ReportUi } from "@/types/report.js";

export type ResolvedReportUi = {
    appearance: NonNullable<ReportUi["appearance"]>;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    questionThreadDefault: QuestionThreadDisplay;
    shortcut?: string;
    locale: ReportLocale;
    messages: ReportMessages;
};

const DEFAULT_UI: Pick<ResolvedReportUi, "appearance" | "showFeedbackList" | "visibleShortcutKeys" | "questionThreadDefault" | "locale"> = {
    appearance: "system",
    showFeedbackList: true,
    visibleShortcutKeys: false,
    questionThreadDefault: "expanded",
    locale: "en",
};

export type ResolveReportUiOptions = {
    ui?: ReportUi;
};

export function resolveReportUi({ ui }: ResolveReportUiOptions): ResolvedReportUi {
    const locale = resolveReportLocale(ui?.locale);

    return {
        appearance: ui?.appearance ?? DEFAULT_UI.appearance,
        showFeedbackList: ui?.showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        questionThreadDefault: ui?.questionThreadDefault ?? DEFAULT_UI.questionThreadDefault,
        shortcut: ui?.shortcut,
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}

export type { DeepPartialReportMessages, ReportLocale, ReportMessages };
