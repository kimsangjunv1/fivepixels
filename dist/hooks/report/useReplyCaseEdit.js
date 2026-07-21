import { useCallback, useEffect, useState } from "react";
import { getFieldError } from "../../utils/report/fields.js";
import { canEditReportCases, createReportCase } from "../../utils/report/reportCases.js";
import { notifyFeedbackUpdate } from "../../utils/report/reportCallbacks.js";
export function useReplyCaseEdit({ reports, activeReplyReport, activeReplyReportId, fields, messages, updateFeedback, signUpdatePayload, eventCallbacks, setErrorMessage, }) {
    const [caseEditReportId, setCaseEditReportId] = useState(null);
    const [caseEditDraft, setCaseEditDraft] = useState(null);
    const cancelCaseEdit = useCallback(() => {
        setCaseEditReportId(null);
        setCaseEditDraft(null);
    }, []);
    const beginCaseEdit = useCallback((report) => {
        if (!canEditReportCases(report)) {
            setErrorMessage(messages.errors.archivedReadOnly);
            return;
        }
        setCaseEditReportId(report.id);
        setCaseEditDraft(report.cases.map((item) => ({ ...item })));
        setErrorMessage("");
    }, [messages.errors.archivedReadOnly, setErrorMessage]);
    const updateCaseEditDraftCase = useCallback((caseId, text) => {
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
    const removeCaseEditDraftCase = useCallback((caseId) => {
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
        }
        catch (nextError) {
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
//# sourceMappingURL=useReplyCaseEdit.js.map