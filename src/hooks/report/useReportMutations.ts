import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import type { ReportMessages } from "@/i18n/types.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ReportFeedback,
    ReportField,
    ReportGitHubConfig,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import type { EditableDraft } from "@/types/report-ui.js";
import { createInitialFieldValues, getFieldError } from "@/utils/report/fields.js";
import { buildGitHubIssueStatusUpdate, buildGitHubIssueUpdate, canCreateGitHubIssueFromList, canCreateGitHubIssueOnCreate, isGitIssued } from "@/utils/github/githubIntegration.js";
import { notifyFeedbackCreate, notifyFeedbackDelete, notifyFeedbackUpdate, notifyGitHubIssueCreated, type ReportSideEffectCallbacks } from "@/utils/report/reportCallbacks.js";

export type UseReportMutationsParams = {
    messages: ReportMessages;
    fields: ReportField[];
    github?: ReportGitHubConfig;
    eventCallbacks: ReportSideEffectCallbacks;
    selectedReport: ReportFeedback | null;
    selectedReportId: string | null;
    setSelectedReportId: Dispatch<SetStateAction<string | null>>;
    getActiveReplyReportId: () => string | null;
    closeReplyComposer: () => void;
    isCreating: boolean;
    createFeedback: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    updateFeedback: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    deleteFeedback: (id: string) => Promise<void>;
    createReply: (commentId: string, payload: CreateReplyPayload) => Promise<unknown>;
    usesCreateReply: boolean;
    signCreatePayload: (payload: CreateReportFeedbackPayload) => Promise<CreateReportFeedbackPayload>;
    signUpdatePayload: (payload: UpdateReportFeedbackPayload) => Promise<UpdateReportFeedbackPayload>;
    signReplyPayload: (payload: CreateReplyPayload) => Promise<CreateReplyPayload>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
    buildCreatePayloadFromDraft: () => CreateReportFeedbackPayload | null;
    finalizeDraftCreate: () => void;
};

export function useReportMutations({
    messages,
    fields,
    github,
    eventCallbacks,
    selectedReport,
    selectedReportId,
    setSelectedReportId,
    getActiveReplyReportId,
    closeReplyComposer,
    isCreating,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    createReply,
    usesCreateReply,
    signCreatePayload,
    signUpdatePayload,
    signReplyPayload,
    setErrorMessage,
    buildCreatePayloadFromDraft,
    finalizeDraftCreate,
}: UseReportMutationsParams) {
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [editableDraft, setEditableDraft] = useState<EditableDraft | null>(null);
    const [creatingGitHubIssueId, setCreatingGitHubIssueId] = useState<string | null>(null);

    const canCreateGitHubIssueFromListValue = useMemo(() => canCreateGitHubIssueFromList(github), [github]);
    const canCreateGitHubIssueOnCreateValue = useMemo(() => canCreateGitHubIssueOnCreate(github), [github]);

    const applyGitHubIssueUpdate = async (report: ReportFeedback, result: { issueNumber: number; issueUrl: string }) => {
        if (usesCreateReply) {
            const updatedFeedback = await updateFeedback(report.id, await signUpdatePayload(buildGitHubIssueStatusUpdate(report, result)));

            await createReply(
                report.id,
                await signReplyPayload({
                    message: messages.resolution.gitIssuedMessage,
                    status: "suggested",
                    author_type: "system",
                }),
            );

            return updatedFeedback;
        }

        return updateFeedback(report.id, await signUpdatePayload(buildGitHubIssueUpdate(report, result, messages.resolution.gitIssuedMessage)));
    };

    const stopEditing = () => {
        setEditingReportId(null);
        setEditableDraft(null);
    };

    const handleCreateSubmit = async () => {
        const payload = buildCreatePayloadFromDraft();

        if (!payload) {
            return;
        }

        try {
            const savedFeedback = await createFeedback(await signCreatePayload(payload));
            await notifyFeedbackCreate(eventCallbacks, savedFeedback);
            finalizeDraftCreate();
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.saveFeedbackFailed);
        }
    };

    const handleCreateSubmitWithGitHubIssue = async () => {
        if (!github?.onCreate || !canCreateGitHubIssueOnCreateValue || creatingGitHubIssueId || isCreating) {
            return;
        }

        const payload = buildCreatePayloadFromDraft();

        if (!payload) {
            return;
        }

        setCreatingGitHubIssueId("draft");
        setErrorMessage("");

        try {
            const savedFeedback = await createFeedback(await signCreatePayload(payload));
            await notifyFeedbackCreate(eventCallbacks, savedFeedback);

            const result = await github.onCreate(savedFeedback);
            const updatedFeedback = await applyGitHubIssueUpdate(savedFeedback, result);

            await notifyGitHubIssueCreated(eventCallbacks, {
                feedback: updatedFeedback,
                issueUrl: result.issueUrl,
            });
            finalizeDraftCreate();
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.createGitHubIssueFailed);
        } finally {
            setCreatingGitHubIssueId(null);
        }
    };

    const startEditing = (report: ReportFeedback) => {
        if (report.status === "archived") {
            setErrorMessage(messages.errors.archivedReadOnly);
            setSelectedReportId(report.id);
            return;
        }

        setEditingReportId(report.id);
        setEditableDraft({
            cases: report.cases.map((item) => ({ ...item })),
            status: report.status,
            fieldValues: createInitialFieldValues(fields, report.field_values),
        });
        setSelectedReportId(report.id);
    };

    const handleUpdateSubmit = async () => {
        if (!selectedReport || !editableDraft) {
            return;
        }

        if (selectedReport.status === "archived") {
            setErrorMessage(messages.errors.archivedNotEditable);
            return;
        }

        const nextError = getFieldError(editableDraft.cases, editableDraft.fieldValues, fields, messages.errors);

        if (nextError) {
            setErrorMessage(nextError);
            return;
        }

        try {
            const cases = editableDraft.cases.map((item) => ({
                ...item,
                text: item.text.trim(),
                updated_at: new Date().toISOString(),
            }));
            const updatedFeedback = await updateFeedback(
                selectedReport.id,
                await signUpdatePayload({
                    cases,
                    status: editableDraft.status,
                    field_values: editableDraft.fieldValues,
                }),
            );

            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);

            stopEditing();
            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.updateFeedbackFailed);
        }
    };

    const handleCreateGitHubIssue = async (report: ReportFeedback) => {
        if (!github?.onCreate || !canCreateGitHubIssueFromListValue || creatingGitHubIssueId) {
            return;
        }

        if (isGitIssued(report)) {
            return;
        }

        setCreatingGitHubIssueId(report.id);
        setErrorMessage("");

        try {
            const result = await github.onCreate(report);
            const updatedFeedback = await applyGitHubIssueUpdate(report, result);

            await notifyGitHubIssueCreated(eventCallbacks, {
                feedback: updatedFeedback,
                issueUrl: result.issueUrl,
            });
            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.createGitHubIssueFailed);
        } finally {
            setCreatingGitHubIssueId(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteFeedback(id);
            await notifyFeedbackDelete(eventCallbacks, id);

            if (selectedReportId === id) {
                setSelectedReportId(null);
            }

            if (editingReportId === id) {
                stopEditing();
            }

            if (getActiveReplyReportId() === id) {
                closeReplyComposer();
            }

            setErrorMessage("");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : messages.errors.deleteFeedbackFailed);
        }
    };

    return {
        editingReportId,
        setEditingReportId,
        editableDraft,
        setEditableDraft,
        creatingGitHubIssueId,
        stopEditing,
        startEditing,
        handleCreateSubmit,
        handleCreateSubmitWithGitHubIssue,
        handleUpdateSubmit,
        handleCreateGitHubIssue,
        handleDelete,
        canCreateGitHubIssueFromList: canCreateGitHubIssueFromListValue,
        canCreateGitHubIssueOnCreate: canCreateGitHubIssueOnCreateValue,
        isDraftGitHubIssueSubmitting: creatingGitHubIssueId === "draft",
    };
}
