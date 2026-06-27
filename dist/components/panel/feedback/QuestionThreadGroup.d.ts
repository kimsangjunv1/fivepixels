import type { ReportReply } from "../../../types/report.js";
import type { ReportLocale } from "../../../i18n/types.js";
type QuestionThreadGroupProps = {
    questions: ReportReply[];
    originalAuthorName: string;
    locale: ReportLocale;
    threadReplyPrefix: string;
    forceExpanded?: boolean;
};
export declare function QuestionThreadGroup({ questions, originalAuthorName, locale, threadReplyPrefix, forceExpanded, }: QuestionThreadGroupProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=QuestionThreadGroup.d.ts.map