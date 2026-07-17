import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ReportMessages } from "@/i18n/types.js";
import type { ReportFeedback, ReportField, UpdateReportFeedbackPayload } from "@/types/report.js";
import { getFieldError } from "@/utils/report/fields.js";
import { canEditReportCases, createReportCase } from "@/utils/report/reportCases.js";
import { notifyFeedbackUpdate, type ReportSideEffectCallbacks } from "@/utils/report/reportCallbacks.js";

export type UseReplyCaseEditParams = {
    reports: ReportFeedback[];
    activeReplyReport: ReportFeedback | null;
    activeReplyReportId: string | null;
    fields: ReportField[];
    messages: ReportMessages;
    updateFeedback: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    signUpdatePayload: (payload: UpdateReportFeedbackPayload) => Promise<UpdateReportFeedbackPayload>;
    eventCallbacks: ReportSideEffectCallbacks;
    setErrorMessage: Dispatch<SetStateAction<string>>;
};

export function useReplyCaseEdit({
    reports,
    activeReplyReport,
    activeReplyReportId,
    fields,
    messages,
    updateFeedback,
    signUpdatePayload,
    eventCallbacks,
    setErrorMessage,
}: UseReplyCaseEditParams) {
    const [caseEditReportId, setCaseEditReportId] = useState<string | null>(null);
    const [caseEditDraft, setCaseEditDraft] = useState<ReportFeedback["cases"] | null>(null);

    const cancelCaseEdit = useCallback(() => {
        setCaseEditReportId(null);
        setCaseEditDraft(null);
    }, []);

    const beginCaseEdit = useCallback(
        (report: ReportFeedback) => {
            if (!canEditReportCases(report)) {
                setErrorMessage(messages.errors.archivedReadOnly);
                return;
            }

            setCaseEditReportId(report.id);
            setCaseEditDraft(report.cases.map((item) => ({ ...item })));
            setErrorMessage("");
        },
        [messages.errors.archivedReadOnly, setErrorMessage],
    );

    const updateCaseEditDraftCase = useCallback((caseId: string, text: string) => {
        setCaseEditDraft((current) => {
            if (!current) {
                return current;
            }

            return current.map((item) => (item.id === caseId ? { ...item, text } : item));
        });
    }, []);

    const addCaseEditDraftCase = useCallback(() => {
        setCaseEditDraft((current) => (current ? [...current, createReportCase("")] : current));
    }, []);

    const removeCaseEditDraftCase = useCallback((caseId: string) => {
        setCaseEditDraft((current) => {
            if (!current || current.length <= 1) {
                return current;
            }

            return current.filter((item) => item.id !== caseId);
        });
    }, []);

    const handleCaseEditSave = async () => {
        if (!caseEditReportId || !caseEditDraft) {
            return;
        }

        const report = reports.find((item) => item.id === caseEditReportId) ?? activeReplyReport;

        if (!report) {
            return;
        }

        if (!canEditReportCases(report)) {
            setErrorMessage(messages.errors.archivedNotEditable);
            return;
        }

        const nextError = getFieldError(caseEditDraft, report.field_values, fields, messages.errors);

        if (nextError) {
            setErrorMessage(nextError);
            return;
        }

        try {
            const cases = caseEditDraft.map((item) => ({
                ...item,
                text: item.text.trim(),
                updated_at: new Date().toISOString(),
            }));
            const updatedFeedback = await updateFeedback(report.id, await signUpdatePayload({ cases }));

            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            cancelCaseEdit();
            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.updateFeedbackFailed);
        }
    };

    const isCaseEditing = Boolean(caseEditReportId && caseEditDraft);
    const caseEditCases = caseEditReportId === activeReplyReport?.id ? caseEditDraft : null;

    useEffect(() => {
        if (caseEditReportId && activeReplyReportId && caseEditReportId !== activeReplyReportId) {
            cancelCaseEdit();
        }
    }, [activeReplyReportId, cancelCaseEdit, caseEditReportId]);

    return {
        beginCaseEdit,
        cancelCaseEdit,
        handleCaseEditSave,
        updateCaseEditDraftCase,
        addCaseEditDraftCase,
        removeCaseEditDraftCase,
        isCaseEditing,
        caseEditReportId,
        caseEditCases,
    };
}
