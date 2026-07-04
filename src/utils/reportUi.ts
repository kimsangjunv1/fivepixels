import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "@/i18n/index.js";
import { getReportMessages, resolveReportLocale } from "@/i18n/index.js";
import type { QuestionThreadDisplay, ReportAppearance, ReportUi } from "@/types/report.js";

export type ResolvedReportUi = {
    panelAppearance: ReportAppearance;
    tooltipAppearance: ReportAppearance;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    questionThreadDefault: QuestionThreadDisplay;
    shortcut?: string;
    locale: ReportLocale;
    messages: ReportMessages;
};

const DEFAULT_UI: Pick<
    ResolvedReportUi,
    "panelAppearance" | "tooltipAppearance" | "showFeedbackList" | "visibleShortcutKeys" | "questionThreadDefault" | "locale"
> = {
    panelAppearance: "system",
    tooltipAppearance: "system",
    showFeedbackList: true,
    visibleShortcutKeys: false,
    questionThreadDefault: "expanded",
    locale: "en",
};

function resolveScopedAppearance(ui: ReportUi | undefined, specific: ReportAppearance | undefined): ReportAppearance {
    return specific ?? ui?.appearance ?? DEFAULT_UI.panelAppearance;
}

export type ResolveReportUiOptions = {
    ui?: ReportUi;
};

export function resolveReportUi({ ui }: ResolveReportUiOptions): ResolvedReportUi {
    const locale = resolveReportLocale(ui?.locale);
    const sharedAppearance = ui?.appearance;
    const panelAppearance = ui?.panelAppearance ?? sharedAppearance ?? DEFAULT_UI.panelAppearance;
    const tooltipAppearance = ui?.tooltipAppearance ?? sharedAppearance ?? DEFAULT_UI.tooltipAppearance;

    return {
        panelAppearance,
        tooltipAppearance,
        showFeedbackList: ui?.showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        questionThreadDefault: ui?.questionThreadDefault ?? DEFAULT_UI.questionThreadDefault,
        shortcut: ui?.shortcut,
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}

export type { DeepPartialReportMessages, ReportLocale, ReportMessages };
