import type { ReportFeedback, ReportField } from "../../shared/types/report.js";
import type { ReportMessages } from "../../shared/i18n/types.js";
type ThreadAskAiFloatingButtonProps = {
    report: ReportFeedback;
    fields: ReportField[];
    messages: ReportMessages;
    caseId: string;
};
export declare function ThreadAskAiFloatingButton({ report, fields, messages, caseId }: ThreadAskAiFloatingButtonProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ThreadAskAiFloatingButton.d.ts.map