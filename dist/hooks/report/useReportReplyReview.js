import { useCallback, useEffect, useMemo, useState } from "react";
import { canShowCaseClaimAction, createReplyStatusForSubmit, getLatestBranchRootForCase, getReportReplies, ISSUE_ROOT_PARENT_ID, requiresCaseActorPermissionForComposer, resolveOriginalFeedbackAuthorName, resolveParentReplyIdForCaseQuestion, } from "../../utils/feedback/feedbackThread.js";
import { claimCaseAssignee, buildResolvedCasesUpdate, canActOnCase, getCaseAssigneeName, isValidFocusedCase, resolveDefaultFocusedCaseId, transferCaseAssignee, } from "../../utils/report/reportCases.js";
import { createReplyId } from "../../utils/shared/format.js";
import { notifyFeedbackReply, notifyFeedbackUpdate } from "../../utils/report/reportCallbacks.js";
import { resolveDefaultAuthorName } from "../../utils/report/resolveDefaultAuthorName.js";
import { useReplyCaseEdit } from "./useReplyCaseEdit.js";
export function useReportReplyReview({ reports, messages, fields, sessionActor, authorSelectionLocked, activeIdentify, authorizedAuthors, selfName, eventCallbacks, createReply, updateFeedback, usesCreateReply, signReplyPayload, signUpdatePayload, setErrorMessage, onSelectReport, }) {
    const [activeReplyReportId, setActiveReplyReportId] = useState(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [replySubmitAsQuestion, setReplySubmitAsQuestion] = useState(false);
    const [replyAuthorName, setReplyAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfName));
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isClaimingAssignee, setIsClaimingAssignee] = useState(false);
    const [pendingComposer, setPendingComposer] = useState(null);
    const [confirmAuthorName, setConfirmAuthorName] = useState("");
    const [showConfirmAuthorSelect, setShowConfirmAuthorSelect] = useState(false);
    const [focusedCaseId, setFocusedCaseId] = useState(null);
    useEffect(() => {
        if (!sessionActor?.name) {
            return;
        }
        setReplyAuthorName(sessionActor.name);
    }, [sessionActor?.id, sessionActor?.name]);
    const setReplyAuthorNameSafe = useCallback((name) => {
        if (authorSelectionLocked && sessionActor?.name) {
            setReplyAuthorName(sessionActor.name);
            return;
        }
        setReplyAuthorName(name);
    }, [authorSelectionLocked, sessionActor?.name]);
    const activeReplyReport = useMemo(() => (activeReplyReportId ? (reports.find((item) => item.id === activeReplyReportId) ?? null) : null), [activeReplyReportId, reports]);
    const activeReplyAnchor = useMemo(() => (activeReplyReport ? { report: activeReplyReport } : null), [activeReplyReport]);
    const caseEdit = useReplyCaseEdit({
        reports,
        activeReplyReport,
        activeReplyReportId,
        fields,
        messages,
        updateFeedback,
        signUpdatePayload,
        eventCallbacks,
        setErrorMessage,
    });
    const { cancelCaseEdit } = caseEdit;
    useEffect(() => {
        if (!activeReplyReport) {
            return;
        }
        setFocusedCaseId((current) => {
            if (current && isValidFocusedCase(activeReplyReport, current)) {
                return current;
            }
            return resolveDefaultFocusedCaseId(activeReplyReport);
        });
    }, [activeReplyReport]);
    const clearFocusedCase = useCallback(() => {
        setFocusedCaseId(null);
    }, []);
    const selectCase = useCallback((caseId) => {
        setFocusedCaseId(caseId);
        setPendingComposer(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setErrorMessage("");
    }, []);
    const ensureFocusedCase = useCallback((report) => {
        if (isValidFocusedCase(report, focusedCaseId)) {
            return true;
        }
        setErrorMessage(messages.errors.selectCaseFirst);
        return false;
    }, [focusedCaseId, messages.errors.selectCaseFirst]);
    const ensureCanActOnFocusedCase = useCallback((report) => {
        if (!ensureFocusedCase(report) || !focusedCaseId) {
            return false;
        }
        const actorName = sessionActor?.name?.trim() ?? "";
        if (actorName && canActOnCase(report, focusedCaseId, actorName)) {
            return true;
        }
        setErrorMessage(messages.errors.caseAssigneeOnly);
        return false;
    }, [ensureFocusedCase, focusedCaseId, messages.errors.caseAssigneeOnly, sessionActor?.name]);
    const closeReplyComposer = () => {
        setActiveReplyReportId(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setShowConfirmAuthorSelect(false);
        cancelCaseEdit();
        clearFocusedCase();
    };
    const openReplyComposer = (report) => {
        onSelectReport(report.id);
        setActiveReplyReportId(report.id);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setReplyAuthorName(sessionActor?.name ?? resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfName));
        setConfirmAuthorName(resolveOriginalFeedbackAuthorName(report));
        setShowConfirmAuthorSelect(false);
        setFocusedCaseId(resolveDefaultFocusedCaseId(report));
    };
    const toggleConfirmAuthorSelect = () => {
        setShowConfirmAuthorSelect((current) => !current);
    };
    const startDenyReview = (targetReplyId) => {
        if (!activeReplyReport || !focusedCaseId) {
            return;
        }
        if (!ensureCanActOnFocusedCase(activeReplyReport)) {
            return;
        }
        const latestRoot = getLatestBranchRootForCase(activeReplyReport, focusedCaseId);
        if (!latestRoot) {
            setPendingComposer({
                type: "deny",
                targetReplyId: targetReplyId ?? ISSUE_ROOT_PARENT_ID,
            });
            setReplyDraft("");
            setReplySubmitAsQuestion(false);
            return;
        }
        setPendingComposer({
            type: latestRoot.status === "found_error" ? "recheck" : "deny",
            targetReplyId: latestRoot.id,
        });
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };
    const startCheckoutReview = (replyId) => {
        if (!activeReplyReport || !focusedCaseId || !ensureCanActOnFocusedCase(activeReplyReport)) {
            return;
        }
        setPendingComposer({ type: "checkout", targetReplyId: replyId });
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };
    const startAskQuestion = () => {
        if (!activeReplyReport || !focusedCaseId || !ensureFocusedCase(activeReplyReport)) {
            return;
        }
        const latestRoot = getLatestBranchRootForCase(activeReplyReport, focusedCaseId);
        setErrorMessage("");
        setReplyDraft("");
        if (!latestRoot) {
            setPendingComposer({
                type: "question",
                targetReplyId: ISSUE_ROOT_PARENT_ID,
            });
            setReplySubmitAsQuestion(true);
            return;
        }
        if (latestRoot.status === "suggested" || latestRoot.status === "found_error" || latestRoot.status === "recheck_requested") {
            setPendingComposer({
                type: "question",
                targetReplyId: latestRoot.id,
            });
            setReplySubmitAsQuestion(true);
        }
    };
    const cancelPendingComposer = () => {
        setPendingComposer(null);
        setReplyDraft("");
        setReplySubmitAsQuestion(false);
    };
    const appendReply = async (report, reply) => {
        if (usesCreateReply) {
            await createReply(report.id, await signReplyPayload({
                message: reply.message,
                status: reply.status,
                case_ids: reply.case_ids,
                parent_reply_id: reply.parent_reply_id,
                author_type: reply.author_type ?? "manager",
                author_name: reply.author_name,
            }));
        }
        else {
            const payload = await signUpdatePayload({
                replies: [...getReportReplies(report), reply],
            });
            await updateFeedback(report.id, payload);
        }
        await notifyFeedbackReply(eventCallbacks, {
            feedbackId: report.id,
            message: reply.message,
        });
    };
    const handleReplySubmit = async () => {
        if (!activeReplyReport) {
            return;
        }
        if (!replyDraft.trim()) {
            setErrorMessage(messages.errors.replyContentRequired);
            return;
        }
        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }
        const actorName = sessionActor?.name?.trim() ?? "";
        if (!actorName) {
            setErrorMessage(messages.errors.authorRequired);
            return;
        }
        const pendingType = pendingComposer?.type ?? null;
        const isCreatorSubmit = pendingType === "deny" || pendingType === "recheck" || pendingType === "question";
        const isQuestionSubmit = pendingType === "question";
        if (requiresCaseActorPermissionForComposer(pendingType) && !canActOnCase(activeReplyReport, focusedCaseId, actorName)) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }
        const replyMessage = replyDraft.trim();
        const replyStatus = createReplyStatusForSubmit(pendingType, isQuestionSubmit);
        const parentReplyId = replyStatus === "additional_question" ? resolveParentReplyIdForCaseQuestion(activeReplyReport, focusedCaseId, pendingComposer) : null;
        const reply = {
            id: createReplyId(),
            message: replyMessage,
            created_at: new Date().toISOString(),
            status: replyStatus,
            case_ids: [focusedCaseId],
            ...(parentReplyId ? { parent_reply_id: parentReplyId } : {}),
            author_type: isCreatorSubmit ? "user" : "manager",
            author_name: actorName,
        };
        try {
            setIsSubmittingReply(true);
            await appendReply(activeReplyReport, reply);
            setErrorMessage("");
            setReplyDraft("");
            if (replyStatus === "additional_question") {
                setReplySubmitAsQuestion(true);
                if (pendingType === "question" && pendingComposer) {
                    setPendingComposer({
                        type: "question",
                        targetReplyId: pendingComposer.targetReplyId,
                    });
                }
                else {
                    setPendingComposer(null);
                }
            }
            else {
                setReplySubmitAsQuestion(false);
                setPendingComposer(null);
            }
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        }
        finally {
            setIsSubmittingReply(false);
        }
    };
    const handleClaimAssignee = async () => {
        if (!activeReplyReport) {
            return;
        }
        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }
        const assigneeName = sessionActor?.name?.trim() ?? "";
        if (!assigneeName) {
            setErrorMessage(messages.errors.authorRequired);
            return;
        }
        if (!canShowCaseClaimAction(activeReplyReport, focusedCaseId, assigneeName)) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }
        const reply = {
            id: createReplyId(),
            message: messages.thread.assigneeAssigned,
            created_at: new Date().toISOString(),
            status: "assignee_assigned",
            case_ids: [focusedCaseId],
            author_type: "manager",
            author_name: assigneeName,
        };
        try {
            setIsClaimingAssignee(true);
            await appendReply(activeReplyReport, reply);
            const nextCases = claimCaseAssignee(activeReplyReport.cases, focusedCaseId, assigneeName);
            await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                cases: nextCases,
            }));
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        }
        finally {
            setIsClaimingAssignee(false);
        }
    };
    const handleTransferAssignee = async () => {
        if (!activeReplyReport) {
            return;
        }
        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }
        const assigneeName = sessionActor?.name?.trim() ?? "";
        if (!assigneeName) {
            setErrorMessage(messages.errors.authorRequired);
            return;
        }
        const currentAssignee = getCaseAssigneeName(activeReplyReport, focusedCaseId);
        if (!currentAssignee || currentAssignee === assigneeName) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }
        const authorName = resolveOriginalFeedbackAuthorName(activeReplyReport);
        if (authorName && assigneeName === authorName) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }
        const reply = {
            id: createReplyId(),
            message: messages.thread.assigneeTransferred,
            created_at: new Date().toISOString(),
            status: "assignee_transferred",
            case_ids: [focusedCaseId],
            author_type: "manager",
            author_name: assigneeName,
        };
        try {
            setIsClaimingAssignee(true);
            await appendReply(activeReplyReport, reply);
            const nextCases = transferCaseAssignee(activeReplyReport.cases, focusedCaseId, assigneeName);
            await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                cases: nextCases,
            }));
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveReplyFailed);
        }
        finally {
            setIsClaimingAssignee(false);
        }
    };
    const handleConfirmResolution = async () => {
        if (!activeReplyReport) {
            return;
        }
        if (!ensureFocusedCase(activeReplyReport) || !focusedCaseId) {
            return;
        }
        const resolverName = sessionActor?.name?.trim() ?? "";
        if (!resolverName) {
            setErrorMessage(messages.errors.reviewerRequired);
            return;
        }
        if (!canActOnCase(activeReplyReport, focusedCaseId, resolverName)) {
            setErrorMessage(messages.errors.caseAssigneeOnly);
            return;
        }
        const nextCases = buildResolvedCasesUpdate(activeReplyReport, [focusedCaseId]);
        try {
            if (usesCreateReply) {
                await createReply(activeReplyReport.id, await signReplyPayload({
                    message: messages.resolution.issueResolvedMessage,
                    status: "resolved",
                    case_ids: [focusedCaseId],
                    author_type: "user",
                    author_name: resolverName,
                }));
                const updatedFeedback = await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                    cases: nextCases,
                }));
                await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            }
            else {
                const reply = {
                    id: createReplyId(),
                    message: messages.resolution.issueResolvedMessage,
                    created_at: new Date().toISOString(),
                    status: "resolved",
                    case_ids: [focusedCaseId],
                    author_type: "user",
                    author_name: resolverName,
                };
                const updatedFeedback = await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                    cases: nextCases,
                    replies: [...getReportReplies(activeReplyReport), reply],
                }));
                await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            }
            setFocusedCaseId(resolveDefaultFocusedCaseId({ ...activeReplyReport, cases: nextCases }));
            setErrorMessage("");
            setPendingComposer(null);
            setReplyDraft("");
            setShowConfirmAuthorSelect(false);
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.confirmResolutionFailed);
        }
    };
    return {
        activeReplyReportId,
        setActiveReplyReportId,
        activeReplyReport,
        activeReplyAnchor,
        replyDraft,
        setReplyDraft,
        replySubmitAsQuestion,
        setReplySubmitAsQuestion,
        replyAuthorName,
        setReplyAuthorName: setReplyAuthorNameSafe,
        setReplyAuthorNameRaw: setReplyAuthorName,
        isSubmittingReply,
        isClaimingAssignee,
        pendingComposer,
        setPendingComposer,
        confirmAuthorName,
        setConfirmAuthorName,
        showConfirmAuthorSelect,
        setShowConfirmAuthorSelect,
        toggleConfirmAuthorSelect,
        startDenyReview,
        startCheckoutReview,
        startAskQuestion,
        cancelPendingComposer,
        handleClaimAssignee,
        handleTransferAssignee,
        handleConfirmResolution,
        ...caseEdit,
        focusedCaseId,
        selectCase,
        clearFocusedCase,
        openReplyComposer,
        closeReplyComposer,
        handleReplySubmit,
    };
}
//# sourceMappingURL=useReportReplyReview.js.map