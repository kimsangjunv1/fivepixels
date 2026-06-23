import { useMemo } from "react";
import { AnimatedPresence, motion } from "@/components/motion/index.js";
import { useTooltipLayout } from "@/hooks/useTooltipLayout.js";
import { useReport } from "@/providers/reportContext.js";
import { getDraftMarkerPosition } from "@/utils/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";

const TOOLTIP_MOTION_TRANSITION = {
    delay: 0,
    type: "spring" as const,
    mass: 0.1,
    stiffness: 100,
    damping: 10,
};

const TOOLTIP_SURFACE_CLASS = "overflow-hidden rounded-[24px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
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
        cancelDraft,
        handleCreateSubmit,
        handleCreateSubmitWithGitHubIssue,
        canCreateGitHubIssueOnCreate,
        isDraftGitHubIssueSubmitting,
        draftAuthorName,
        setDraftAuthorName,
    } = useReport();

    return (
        <AnimatedPresence>
            {draft ? (
                <ReportDraftFormContent
                    draft={draft}
                    fields={fields}
                    authors={authors}
                    isCreating={isCreating}
                    selectedTarget={selectedTarget}
                    updateDraftMessage={updateDraftMessage}
                    updateDraftField={updateDraftField}
                    cancelDraft={cancelDraft}
                    handleCreateSubmit={handleCreateSubmit}
                    handleCreateSubmitWithGitHubIssue={handleCreateSubmitWithGitHubIssue}
                    canCreateGitHubIssueOnCreate={canCreateGitHubIssueOnCreate}
                    isDraftGitHubIssueSubmitting={isDraftGitHubIssueSubmitting}
                    draftAuthorName={draftAuthorName}
                    setDraftAuthorName={setDraftAuthorName}
                />
            ) : null}
        </AnimatedPresence>
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
    cancelDraft: () => void;
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
    const tooltipScaleOrigin = tooltipPosition?.placement === "below" ? "top left" : "bottom left";

    if (!tooltipPosition || !tooltipAnchorStyle) {
        return null;
    }

    return (
        <motion.div
            ref={setTooltipElement}
            key="report-draft-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TOOLTIP_MOTION_TRANSITION}
            onClick={(event) => event.stopPropagation()}
            className={EXPANDED_TOOLTIP_ANCHOR_CLASS}
            style={{
                left: tooltipPosition.left,
                top: tooltipPosition.top,
                width: tooltipPosition.width,
                ...tooltipAnchorStyle,
            }}
        >
            <motion.div
                data-fivepixels-interactive=""
                initial={{ scale: 0.97 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.97 }}
                transition={TOOLTIP_MOTION_TRANSITION}
                className={TOOLTIP_SURFACE_CLASS}
                style={{
                    pointerEvents: "auto",
                    transformOrigin: tooltipScaleOrigin,
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
            </motion.div>
        </motion.div>
    );
}
