import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "@/i18n/index.js";
import { getReportMessages, resolveReportLocale } from "@/i18n/index.js";
import type { QuestionThreadDisplay, ReplyHistoryLoadMode, ReportAppearance, ReportUi } from "@/types/report.js";
import { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE } from "@/utils/feedback/replyHistory.js";

export type ResolvedReplyHistoryConfig = {
    mode: ReplyHistoryLoadMode;
    pageSize: number;
};

export type ResolvedReportUi = {
    panelAppearance: ReportAppearance;
    tooltipAppearance: ReportAppearance;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    questionThreadDefault: QuestionThreadDisplay;
    replyHistory: ResolvedReplyHistoryConfig;
    shortcut?: string;
    locale: ReportLocale;
    messages: ReportMessages;
};

const DEFAULT_UI: Pick<
    ResolvedReportUi,
    "panelAppearance" | "tooltipAppearance" | "showFeedbackList" | "visibleShortcutKeys" | "questionThreadDefault" | "locale"
> = {
    panelAppearance: "light",
    tooltipAppearance: "light",
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
    const panelAppearance = ui?.panelAppearance ?? DEFAULT_UI.panelAppearance;
    const tooltipAppearance = ui?.tooltipAppearance ?? DEFAULT_UI.tooltipAppearance;

    return {
        panelAppearance,
        tooltipAppearance,
        showFeedbackList: ui?.showFeedbackList ?? DEFAULT_UI.showFeedbackList,
        visibleShortcutKeys: ui?.visibleShortcutKeys ?? DEFAULT_UI.visibleShortcutKeys,
        questionThreadDefault: ui?.questionThreadDefault ?? DEFAULT_UI.questionThreadDefault,
        replyHistory: {
            mode: ui?.replyHistory?.mode ?? DEFAULT_REPLY_HISTORY_MODE,
            pageSize: ui?.replyHistory?.pageSize ?? DEFAULT_REPLY_HISTORY_PAGE_SIZE,
        },
        shortcut: ui?.shortcut,
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}

export type { DeepPartialReportMessages, ReportLocale, ReportMessages };
