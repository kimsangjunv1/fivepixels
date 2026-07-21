import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "../../i18n/index.js";
import type { QuestionThreadDisplay, ReplyHistoryLoadMode, ReportAppearance, ReportUi } from "../../types/report.js";
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
export type ResolveReportUiOptions = {
    ui?: ReportUi;
};
export declare function resolveReportUi({ ui }: ResolveReportUiOptions): ResolvedReportUi;
export type { DeepPartialReportMessages, ReportLocale, ReportMessages };
//# sourceMappingURL=reportUi.d.ts.map