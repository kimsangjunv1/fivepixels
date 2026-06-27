import { useMemo } from "react";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useReport } from "@/providers/reportContext.js";
import { getDraftMarkerPosition } from "@/utils/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";

const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
// const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[12px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const EXPANDED_TOOLTIP_ANCHOR_CLASS = "pointer-events-auto fixed z-[1000001]";

export function ReportDraftForm() {
    const {
        draft,
        fields,
        authors,
        isCreating,
        selectedTarget,
        updateDraftMessage,
        updateDraftField,
        handleCreateSubmit,
        handleCreateSubmitWithGitHubIssue,
        canCreateGitHubIssueOnCreate,
        isDraftGitHubIssueSubmitting,
        draftAuthorName,
        setDraftAuthorName,
    } = useReport();

    if (!draft) {
        return null;
    }

    return (
        <ReportDraftFormContent
            draft={draft}
            fields={fields}
            authors={authors}
            isCreating={isCreating}
            selectedTarget={selectedTarget}
            updateDraftMessage={updateDraftMessage}
            updateDraftField={updateDraftField}
            handleCreateSubmit={handleCreateSubmit}
            handleCreateSubmitWithGitHubIssue={handleCreateSubmitWithGitHubIssue}
            canCreateGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
            isDraftGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
            draftAuthorName={draftAuthorName}
            setDraftAuthorName={setDraftAuthorName}
        />
    );
}

type ReportDraftFormContentProps = {
    draft: NonNullable<ReturnType<typeof useReport>["draft"]>;
    fields: ReturnType<typeof useReport>["fields"];
    authors: ReturnType<typeof useReport>["authors"];
    isCreating: boolean;
    selectedTarget: ReturnType<typeof useReport>["selectedTarget"];
    updateDraftMessage: (message: string) => void;
    updateDraftField: (key: string, value: string | boolean) => void;
    handleCreateSubmit: () => Promise<void>;
    handleCreateSubmitWithGitHubIssue: () => Promise<void>;
    canCreateGitHubIssueOnCreate: boolean;
    isDraftGitHubIssueSubmitting: boolean;
    draftAuthorName: string;
    setDraftAuthorName: (name: string) => void;
};

function ReportDraftFormContent({
    draft,
    fields,
    authors,
    isCreating,
    selectedTarget,
    updateDraftMessage,
    updateDraftField,
    handleCreateSubmit,
    handleCreateSubmitWithGitHubIssue,
    canCreateGitHubIssueOnCreate,
    isDraftGitHubIssueSubmitting,
    draftAuthorName,
    setDraftAuthorName,
}: ReportDraftFormContentProps) {
    const anchor = useMemo(() => getDraftMarkerPosition(draft, selectedTarget), [draft, selectedTarget]);
    const { layout: tooltipLayout, setTooltipElement } = useTooltipLayout(anchor, true, true);
    const tooltipPosition = tooltipLayout?.position ?? null;
    const tooltipAnchorStyle = tooltipLayout?.anchorStyle;

    if (!tooltipPosition || !tooltipAnchorStyle) {
        return null;
    }

    return (
        <div
            ref={setTooltipElement}
            data-fivepixels-interactive=""
            onClick={(event) => event.stopPropagation()}
            className={EXPANDED_TOOLTIP_ANCHOR_CLASS}
            style={{
                left: tooltipPosition.left,
                top: tooltipPosition.top,
                width: tooltipPosition.width,
                ...tooltipAnchorStyle,
            }}
        >
            <div
                className={TOOLTIP_SURFACE_CLASS}
                style={{
                    pointerEvents: "auto",
                }}
            >
                <FeedbackComposer
                    message={draft.message}
                    onMessageChange={updateDraftMessage}
                    authorName={draftAuthorName}
                    onAuthorNameChange={setDraftAuthorName}
                    authors={authors}
                    fields={fields}
                    fieldValues={draft.fieldValues}
                    onFieldChange={updateDraftField}
                    showTags
                    onSubmit={() => void handleCreateSubmit()}
                    isSubmitting={isCreating}
                    showGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
                    onGitHubIssueSubmit={() => void handleCreateSubmitWithGitHubIssue()}
                    isGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
                    autoFocus
                />
            </div>
        </div>
    );
}
