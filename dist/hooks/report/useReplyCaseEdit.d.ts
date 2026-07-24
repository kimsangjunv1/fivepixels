import { type Dispatch, type SetStateAction } from "react";
import type { ReportMessages } from "../../i18n/types.js";
import type { ReportFeedback, ReportField, UpdateReportFeedbackPayload } from "../../types/report.js";
import { type ReportSideEffectCallbacks } from "../../utils/report/reportCallbacks.js";
import { type FeedbackActor } from "../../utils/feedback/feedbackPermissions.js";
export type UseReplyCaseEditParams = {
    reports: ReportFeedback[];
    activeReplyReport: ReportFeedback | null;
    activeReplyReportId: string | null;
    focusedCaseId: string | null;
    selectCase: (caseId: string) => void;
    sessionActor: FeedbackActor;
    fields: ReportField[];
    messages: ReportMessages;
    updateFeedback: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    signUpdatePayload: (payload: UpdateReportFeedbackPayload) => Promise<UpdateReportFeedbackPayload>;
    eventCallbacks: ReportSideEffectCallbacks;
    setErrorMessage: Dispatch<SetStateAction<string>>;
};
export declare function useReplyCaseEdit({ reports, activeReplyReport, activeReplyReportId, focusedCaseId, selectCase, sessionActor, fields, messages, updateFeedback, signUpdatePayload, eventCallbacks, setErrorMessage, }: UseReplyCaseEditParams): {
    beginCaseEdit: (report: ReportFeedback) => void;
    cancelCaseEdit: () => void;
    handleCaseEditSave: () => Promise<void>;
    updateCaseEditDraftCase: (caseId: string, text: string) => void;
    addCaseEditDraftCase: () => void;
    removeCaseEditDraftCase: (caseId: string) => void;
    removePersistedCase: (report: ReportFeedback, caseId: string) => Promise<void>;
    isCaseEditing: boolean;
    caseEditReportId: string | null;
    caseEditCases: import("../../types/report.js").ReportCase[] | null;
};
//# sourceMappingURL=useReplyCaseEdit.d.ts.map