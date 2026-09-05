import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "../../../shared/i18n/index.js";
import type { QuestionThreadDisplay, ReplyHistoryLoadMode, ReportAppearance, ReportUi, ThreadLayoutStyle } from "../../../shared/types/report.js";
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
export type ResolveReportUiOptions = {
    ui?: ReportUi;
};
export declare function resolveReportUi({ ui }: ResolveReportUiOptions): ResolvedReportUi;
export type { DeepPartialReportMessages, ReportLocale, ReportMessages };
//# sourceMappingURL=reportUi.d.ts.map