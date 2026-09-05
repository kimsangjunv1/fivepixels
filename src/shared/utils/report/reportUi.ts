import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "@/shared/i18n/index.js";
import { getReportMessages, resolveReportLocale } from "@/shared/i18n/index.js";
import type { QuestionThreadDisplay, ReplyHistoryLoadMode, ReportAppearance, ReportUi, ThreadLayoutStyle } from "@/shared/types/report.js";
import { DEFAULT_REPLY_HISTORY_MODE, DEFAULT_REPLY_HISTORY_PAGE_SIZE } from "@/shared/utils/feedback/replyHistory.js";

export type ResolvedReplyHistoryConfig = {
    mode: ReplyHistoryLoadMode;
    pageSize: number;
};

export type ResolvedReportUi = {
    panelAppearance: ReportAppearance;
    tooltipAppearance: ReportAppearance;
    showFeedbackList: boolean;
    questionThreadDefault: QuestionThreadDisplay;
    threadLayoutDefault: ThreadLayoutStyle;
    replyHistory: ResolvedReplyHistoryConfig;
    locale: ReportLocale;
    messages: ReportMessages;
};

const DEFAULT_UI: Pick<
    ResolvedReportUi,
    "panelAppearance" | "tooltipAppearance" | "showFeedbackList" | "questionThreadDefault" | "threadLayoutDefault" | "locale"
> = {
    panelAppearance: "light",
    tooltipAppearance: "light",
    showFeedbackList: true,
    questionThreadDefault: "expanded",
    threadLayoutDefault: "classic",
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
        questionThreadDefault: ui?.questionThreadDefault ?? DEFAULT_UI.questionThreadDefault,
        threadLayoutDefault: ui?.threadLayoutDefault ?? DEFAULT_UI.threadLayoutDefault,
        replyHistory: {
            mode: ui?.replyHistory?.mode ?? DEFAULT_REPLY_HISTORY_MODE,
            pageSize: ui?.replyHistory?.pageSize ?? DEFAULT_REPLY_HISTORY_PAGE_SIZE,
        },
        locale,
        messages: getReportMessages(locale, ui?.messages),
    };
}

export type { DeepPartialReportMessages, ReportLocale, ReportMessages };
