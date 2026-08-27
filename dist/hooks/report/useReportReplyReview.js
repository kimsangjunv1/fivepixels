import { useCallback, useEffect, useMemo, useState } from "react";
import { canShowCaseClaimAction, createReplyStatusForSubmit, getLatestBranchRootForCase, resolveDenyComposerType, getReportReplies, ISSUE_ROOT_PARENT_ID, requiresCaseActorPermissionForComposer, resolveOriginalFeedbackAuthorName, resolveParentReplyIdForCaseQuestion, } from "../../utils/feedback/feedbackThread.js";
import { claimCaseAssignee, buildResolvedCasesUpdate, canActOnCase, canEditReportCases, createReportCase, getCaseAssigneeName, getReportCases, isValidFocusedCase, resolveDefaultFocusedCaseId, syncIssueStatusFromCases, transferCaseAssignee, } from "../../utils/report/reportCases.js";
import { createReplyId } from "../../utils/shared/format.js";
import { notifyFeedbackReply, notifyFeedbackUpdate } from "../../utils/report/reportCallbacks.js";
import { resolveDefaultAuthorName } from "../../utils/report/resolveDefaultAuthorName.js";
import { stripMentionTokensForEmptyCheck } from "../../utils/mention/elementMentions.js";
import { useReplyCaseEdit } from "./useReplyCaseEdit.js";
export function useReportReplyReview({ reports, allPageReports, messages, fields, sessionActor, authorSelectionLocked, activeIdentify, authorizedAuthors, selfName, eventCallbacks, createReply, updateFeedback, usesCreateReply, signReplyPayload, signUpdatePayload, setErrorMessage, onSelectReport, }) {
    const [activeReplyReportId, setActiveReplyReportId] = useState(null);
    const [openReplyReportIds, setOpenReplyReportIds] = useState([]);
    const [openReplyReportCache, setOpenReplyReportCache] = useState({});
    const [minimizedReplyReportIds, setMinimizedReplyReportIds] = useState([]);
    const [replyDraft, setReplyDraft] = useState("");
    const [replyMentions, setReplyMentions] = useState([]);
    const [mentionHighlightTarget, setMentionHighlightTarget] = useState(null);
    const [replySubmitAsQuestion, setReplySubmitAsQuestion] = useState(false);
    const [replyAuthorName, setReplyAuthorName] = useState(() => resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfName));
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isClaimingAssignee, setIsClaimingAssignee] = useState(false);
    const [pendingComposer, setPendingComposer] = useState(null);
    const [confirmAuthorName, setConfirmAuthorName] = useState("");
    const [showConfirmAuthorSelect, setShowConfirmAuthorSelect] = useState(false);
    const [focusedCaseId, setFocusedCaseId] = useState(null);
    const [isComposingNewCase, setIsComposingNewCase] = useState(false);
    /** Stashed new-case draft while browsing other cases; cleared on submit or window close. */
    const [newCaseDraftSession, setNewCaseDraftSession] = useState(null);
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
    const reportLookup = useMemo(() => {
        const byId = new Map();
        for (const item of Object.values(openReplyReportCache)) {
            byId.set(item.id, item);
        }
        for (const item of [...allPageReports, ...reports]) {
            byId.set(item.id, item);
        }
        return byId;
    }, [allPageReports, openReplyReportCache, reports]);
    const rememberOpenReport = useCallback((report) => {
        setOpenReplyReportCache((current) => {
            if (current[report.id] === report) {
                return current;
            }
            return { ...current, [report.id]: report };
        });
    }, []);
    const forgetOpenReport = useCallback((reportId) => {
        setOpenReplyReportCache((current) => {
            if (!(reportId in current)) {
                return current;
            }
            const next = { ...current };
            delete next[reportId];
            return next;
        });
    }, []);
    const activeReplyReport = useMemo(() => (activeReplyReportId ? (reportLookup.get(activeReplyReportId) ?? null) : null), [activeReplyReportId, reportLookup]);
    const openReplyReports = useMemo(() => openReplyReportIds.map((reportId) => reportLookup.get(reportId)).filter((item) => Boolean(item)), [openReplyReportIds, reportLookup]);
    const activeReplyAnchor = useMemo(() => (activeReplyReport ? { report: activeReplyReport } : null), [activeReplyReport]);
    useEffect(() => {
        if (openReplyReportIds.length === 0) {
            return;
        }
        setOpenReplyReportCache((current) => {
            let changed = false;
            const next = { ...current };
            for (const reportId of openReplyReportIds) {
                const fresh = reports.find((item) => item.id === reportId) ?? allPageReports.find((item) => item.id === reportId);
                if (fresh && next[reportId] !== fresh) {
                    next[reportId] = fresh;
                    changed = true;
                }
            }
            for (const reportId of Object.keys(next)) {
                if (!openReplyReportIds.includes(reportId)) {
                    delete next[reportId];
                    changed = true;
                }
            }
            return changed ? next : current;
        });
    }, [allPageReports, openReplyReportIds, reports]);
    const clearFocusedCase = useCallback(() => {
        setFocusedCaseId(null);
    }, []);
    const clearReplyComposerDraft = useCallback(() => {
        setReplyDraft("");
        setReplyMentions([]);
        setMentionHighlightTarget(null);
    }, []);
    const selectCase = useCallback((caseId) => {
        if (isComposingNewCase) {
            setNewCaseDraftSession({ text: replyDraft, mentions: replyMentions });
        }
        setIsComposingNewCase(false);
        setFocusedCaseId(caseId);
        setPendingComposer(null);
        clearReplyComposerDraft();
        setReplySubmitAsQuestion(false);
        setErrorMessage("");
    }, [clearReplyComposerDraft, isComposingNewCase, replyDraft, replyMentions, setErrorMessage]);
    const caseEdit = useReplyCaseEdit({
        reports,
        activeReplyReport,
        activeReplyReportId,
        focusedCaseId,
        selectCase,
        sessionActor,
        fields,
        messages,
        updateFeedback,
        signUpdatePayload,
        eventCallbacks,
        setErrorMessage,
    });
    const { cancelCaseEdit } = caseEdit;
    const cancelComposeNewCase = useCallback(() => {
        setIsComposingNewCase(false);
        setNewCaseDraftSession(null);
        clearReplyComposerDraft();
        setErrorMessage("");
    }, [clearReplyComposerDraft, setErrorMessage]);
    const beginComposeNewCase = useCallback(() => {
        if (!activeReplyReport) {
            return;
        }
        if (!canEditReportCases(activeReplyReport)) {
            setErrorMessage(messages.errors.archivedReadOnly);
            return;
        }
        if (isComposingNewCase) {
            return;
        }
        setIsComposingNewCase(true);
        setPendingComposer(null);
        setReplySubmitAsQuestion(false);
        setErrorMessage("");
        cancelCaseEdit();
        if (newCaseDraftSession) {
            setReplyDraft(newCaseDraftSession.text);
            setReplyMentions(newCaseDraftSession.mentions);
            return;
        }
        clearReplyComposerDraft();
        setNewCaseDraftSession({ text: "", mentions: [] });
    }, [
        activeReplyReport,
        cancelCaseEdit,
        clearReplyComposerDraft,
        isComposingNewCase,
        messages.errors.archivedReadOnly,
        newCaseDraftSession,
        setErrorMessage,
    ]);
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
    useEffect(() => {
        setIsComposingNewCase(false);
        setNewCaseDraftSession(null);
    }, [activeReplyReportId]);
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
    const resetComposerSession = useCallback(() => {
        clearReplyComposerDraft();
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setShowConfirmAuthorSelect(false);
        setIsComposingNewCase(false);
        setNewCaseDraftSession(null);
        cancelCaseEdit();
        clearFocusedCase();
    }, [cancelCaseEdit, clearFocusedCase, clearReplyComposerDraft]);
    const closeReplyComposer = useCallback(() => {
        setActiveReplyReportId(null);
        setOpenReplyReportIds([]);
        setOpenReplyReportCache({});
        setMinimizedReplyReportIds([]);
        resetComposerSession();
    }, [resetComposerSession]);
    const applyFocusedReplyWindow = useCallback((report) => {
        onSelectReport(report.id);
        setActiveReplyReportId(report.id);
        clearReplyComposerDraft();
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setReplyAuthorName(sessionActor?.name ?? resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfName));
        setConfirmAuthorName(resolveOriginalFeedbackAuthorName(report));
        setShowConfirmAuthorSelect(false);
        setFocusedCaseId(resolveDefaultFocusedCaseId(report));
        setIsComposingNewCase(false);
        setNewCaseDraftSession(null);
        cancelCaseEdit();
    }, [activeIdentify, authorizedAuthors, cancelCaseEdit, clearReplyComposerDraft, onSelectReport, selfName, sessionActor?.name]);
    const closeReplyWindow = useCallback((reportId) => {
        const nextOpen = openReplyReportIds.filter((id) => id !== reportId);
        const closingFocused = activeReplyReportId === reportId;
        const nextFocusedId = closingFocused ? (nextOpen[nextOpen.length - 1] ?? null) : activeReplyReportId;
        setOpenReplyReportIds(nextOpen);
        forgetOpenReport(reportId);
        setMinimizedReplyReportIds((current) => current.filter((id) => id !== reportId));
        if (!closingFocused) {
            return;
        }
        resetComposerSession();
        setActiveReplyReportId(nextFocusedId);
        if (!nextFocusedId) {
            return;
        }
        const nextReport = reportLookup.get(nextFocusedId) ?? null;
        if (!nextReport) {
            return;
        }
        applyFocusedReplyWindow(nextReport);
    }, [activeReplyReportId, applyFocusedReplyWindow, forgetOpenReport, openReplyReportIds, reportLookup, resetComposerSession]);
    const restoreOpenReplyWindows = useCallback((snapshot, preferredFocusId, focusReport) => {
        if (focusReport) {
            rememberOpenReport(focusReport);
        }
        const preferredFocus = preferredFocusId === undefined ? snapshot.focusedId : preferredFocusId;
        const orderedIds = [...snapshot.openIds];
        if (preferredFocus && !orderedIds.includes(preferredFocus)) {
            orderedIds.push(preferredFocus);
        }
        const resolvedOpen = [];
        for (const reportId of orderedIds) {
            const report = (focusReport?.id === reportId ? focusReport : null) ?? reportLookup.get(reportId);
            if (!report) {
                continue;
            }
            rememberOpenReport(report);
            resolvedOpen.push(reportId);
        }
        const focusedId = (preferredFocus && resolvedOpen.includes(preferredFocus) ? preferredFocus : null) ??
            (snapshot.focusedId && resolvedOpen.includes(snapshot.focusedId) ? snapshot.focusedId : null) ??
            resolvedOpen[resolvedOpen.length - 1] ??
            null;
        setOpenReplyReportIds(resolvedOpen);
        setMinimizedReplyReportIds(snapshot.minimizedIds.filter((reportId) => resolvedOpen.includes(reportId) && reportId !== focusedId));
        if (!focusedId) {
            setActiveReplyReportId(null);
            resetComposerSession();
            return;
        }
        const focused = (focusReport?.id === focusedId ? focusReport : null) ?? reportLookup.get(focusedId) ?? null;
        if (!focused) {
            setActiveReplyReportId(null);
            resetComposerSession();
            return;
        }
        applyFocusedReplyWindow(focused);
    }, [applyFocusedReplyWindow, rememberOpenReport, reportLookup, resetComposerSession]);
    const setReplyWindowMinimized = useCallback((reportId, minimized) => {
        if (!minimized) {
            setMinimizedReplyReportIds((current) => current.filter((id) => id !== reportId));
            return;
        }
        const nextMinimizedIds = minimizedReplyReportIds.includes(reportId) ? minimizedReplyReportIds : [...minimizedReplyReportIds, reportId];
        setMinimizedReplyReportIds(nextMinimizedIds);
        if (activeReplyReportId !== reportId) {
            return;
        }
        const minimizedIdSet = new Set(nextMinimizedIds);
        const nextFocusedId = [...openReplyReportIds].reverse().find((id) => !minimizedIdSet.has(id)) ?? null;
        resetComposerSession();
        setActiveReplyReportId(nextFocusedId);
        if (!nextFocusedId) {
            return;
        }
        const nextReport = reportLookup.get(nextFocusedId) ?? null;
        if (!nextReport) {
            return;
        }
        applyFocusedReplyWindow(nextReport);
    }, [activeReplyReportId, applyFocusedReplyWindow, minimizedReplyReportIds, openReplyReportIds, reportLookup, resetComposerSession]);
    const reorderMinimizedReplyWindow = useCallback((reportId, toIndex) => {
        setMinimizedReplyReportIds((current) => {
            const fromIndex = current.indexOf(reportId);
            if (fromIndex < 0) {
                return current;
            }
            const clampedIndex = Math.max(0, Math.min(toIndex, current.length - 1));
            if (fromIndex === clampedIndex) {
                return current;
            }
            const next = [...current];
            const [item] = next.splice(fromIndex, 1);
            next.splice(clampedIndex, 0, item);
            return next;
        });
    }, []);
    const focusReplyWindow = useCallback((reportId) => {
        const report = reportLookup.get(reportId);
        if (!report) {
            return;
        }
        rememberOpenReport(report);
        setOpenReplyReportIds((current) => (current.includes(reportId) ? current : [...current, reportId]));
        setMinimizedReplyReportIds((current) => current.filter((id) => id !== reportId));
        if (activeReplyReportId === reportId) {
            return;
        }
        onSelectReport(reportId);
        setActiveReplyReportId(reportId);
        clearReplyComposerDraft();
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setReplyAuthorName(sessionActor?.name ?? resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfName));
        setConfirmAuthorName(resolveOriginalFeedbackAuthorName(report));
        setShowConfirmAuthorSelect(false);
        setFocusedCaseId(resolveDefaultFocusedCaseId(report));
        cancelCaseEdit();
    }, [activeIdentify, activeReplyReportId, authorizedAuthors, cancelCaseEdit, clearReplyComposerDraft, onSelectReport, rememberOpenReport, reportLookup, selfName, sessionActor?.name]);
    const openReplyComposer = (report) => {
        onSelectReport(report.id);
        rememberOpenReport(report);
        setOpenReplyReportIds((current) => (current.includes(report.id) ? current : [...current, report.id]));
        setMinimizedReplyReportIds((current) => current.filter((id) => id !== report.id));
        setActiveReplyReportId(report.id);
        clearReplyComposerDraft();
        setReplySubmitAsQuestion(false);
        setPendingComposer(null);
        setReplyAuthorName(sessionActor?.name ?? resolveDefaultAuthorName(activeIdentify, authorizedAuthors, selfName));
        setConfirmAuthorName(resolveOriginalFeedbackAuthorName(report));
        setShowConfirmAuthorSelect(false);
        setFocusedCaseId(resolveDefaultFocusedCaseId(report));
        cancelCaseEdit();
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
                type: resolveDenyComposerType(null),
                targetReplyId: targetReplyId ?? ISSUE_ROOT_PARENT_ID,
            });
            clearReplyComposerDraft();
            setReplySubmitAsQuestion(false);
            return;
        }
        setPendingComposer({
            type: resolveDenyComposerType(latestRoot),
            targetReplyId: latestRoot.id,
        });
        clearReplyComposerDraft();
        setReplySubmitAsQuestion(false);
    };
    const startCheckoutReview = (replyId) => {
        if (!activeReplyReport || !focusedCaseId || !ensureCanActOnFocusedCase(activeReplyReport)) {
            return;
        }
        setPendingComposer({ type: "checkout", targetReplyId: replyId });
        clearReplyComposerDraft();
        setReplySubmitAsQuestion(false);
    };
    const startAskQuestion = () => {
        if (!activeReplyReport || !focusedCaseId || !ensureFocusedCase(activeReplyReport)) {
            return;
        }
        const latestRoot = getLatestBranchRootForCase(activeReplyReport, focusedCaseId);
        setErrorMessage("");
        clearReplyComposerDraft();
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
        clearReplyComposerDraft();
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
                ...(reply.mentions && reply.mentions.length > 0 ? { mentions: reply.mentions } : {}),
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
    const handleCreateCaseSubmit = async () => {
        if (!activeReplyReport || !isComposingNewCase) {
            return;
        }
        if (!canEditReportCases(activeReplyReport)) {
            setErrorMessage(messages.errors.archivedReadOnly);
            return;
        }
        if (!stripMentionTokensForEmptyCheck(replyDraft, replyMentions)) {
            setErrorMessage(messages.errors.caseTextRequired(getReportCases(activeReplyReport).length + 1));
            return;
        }
        const nextCase = createReportCase(replyDraft.trim(), {
            ...(replyMentions.length > 0 ? { mentions: replyMentions } : {}),
        });
        const nextCases = [...getReportCases(activeReplyReport), nextCase];
        try {
            setIsSubmittingReply(true);
            const updatedFeedback = await updateFeedback(activeReplyReport.id, await signUpdatePayload({
                cases: nextCases,
                status: syncIssueStatusFromCases({ ...activeReplyReport, cases: nextCases }),
            }));
            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            setIsComposingNewCase(false);
            setNewCaseDraftSession(null);
            setFocusedCaseId(nextCase.id);
            setPendingComposer(null);
            setReplySubmitAsQuestion(false);
            clearReplyComposerDraft();
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.updateFeedbackFailed);
        }
        finally {
            setIsSubmittingReply(false);
        }
    };
    const handleReplySubmit = async () => {
        if (isComposingNewCase) {
            await handleCreateCaseSubmit();
            return;
        }
        if (!activeReplyReport) {
            return;
        }
        if (!stripMentionTokensForEmptyCheck(replyDraft, replyMentions)) {
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
            ...(replyMentions.length > 0 ? { mentions: replyMentions } : {}),
        };
        try {
            setIsSubmittingReply(true);
            await appendReply(activeReplyReport, reply);
            setErrorMessage("");
            clearReplyComposerDraft();
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
            clearReplyComposerDraft();
            setShowConfirmAuthorSelect(false);
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.confirmResolutionFailed);
        }
    };
    return {
        activeReplyReportId,
        setActiveReplyReportId,
        openReplyReportIds,
        openReplyReports,
        minimizedReplyReportIds,
        setReplyWindowMinimized,
        reorderMinimizedReplyWindow,
        focusReplyWindow,
        closeReplyWindow,
        activeReplyReport,
        activeReplyAnchor,
        replyDraft,
        setReplyDraft,
        replyMentions,
        setReplyMentions,
        mentionHighlightTarget,
        setMentionHighlightTarget,
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
        isComposingNewCase,
        hasNewCaseDraftSession: newCaseDraftSession !== null,
        beginComposeNewCase,
        cancelComposeNewCase,
        openReplyComposer,
        closeReplyComposer,
        restoreOpenReplyWindows,
        handleReplySubmit,
        handleCreateCaseSubmit,
    };
}
//# sourceMappingURL=useReportReplyReview.js.map