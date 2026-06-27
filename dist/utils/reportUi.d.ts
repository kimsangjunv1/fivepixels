import type { DeepPartialReportMessages, ReportLocale, ReportMessages } from "../i18n/index.js";
import type { QuestionThreadDisplay, ReportUi } from "../types/report.js";
export type ResolvedReportUi = {
    appearance: NonNullable<ReportUi["appearance"]>;
    showFeedbackList: boolean;
    visibleShortcutKeys: boolean;
    questionThreadDefault: QuestionThreadDisplay;
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