import { AnimatePresence, motion } from "motion/react";
import { useReport } from "../../providers/reportContext.js";
import type { DraftPopoverPlacement } from "../../utils/coordinates.js";
import { DRAFT_POPOVER_CONNECTOR_WIDTH, getDraftMarkerPosition, getDraftPopoverPosition } from "../../utils/coordinates.js";
import { FeedbackComposer } from "./feedback/FeedbackComposer.js";

const DRAFT_MOTION_EASE = [0.22, 1, 0.36, 1] as const;

function getMotionOrigin(placement: DraftPopoverPlacement) {
    switch (placement) {
        case "right":
            return "0% 50%";
        case "left":
            return "100% 50%";
        case "bottom":
            return "50% 0%";
        case "top":
            return "50% 100%";
    }
}

type DraftPopoverConnectorProps = {
    placement: DraftPopoverPlacement;
};

function DraftPopoverConnector({ placement }: DraftPopoverConnectorProps) {
    if (placement !== "right" && placement !== "left") {
        return null;
    }

    const baseClass = "pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 bg-[var(--adaptive-black500)]";

    if (placement === "right") {
        return (
            <div
                aria-hidden
                className={`${baseClass} left-0 -translate-x-full`}
                style={{ width: DRAFT_POPOVER_CONNECTOR_WIDTH }}
            />
        );
    }

    return (
        <div
            aria-hidden
            className={`${baseClass} right-0 translate-x-full`}
            style={{ width: DRAFT_POPOVER_CONNECTOR_WIDTH }}
        />
    );
}

export function ReportDraftForm() {
    const { draft, fields, authors, isCreating, selectedTarget, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit, draftAuthorName, setDraftAuthorName } = useReport();

    return (
        <AnimatePresence>
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
                    draftAuthorName={draftAuthorName}
                    setDraftAuthorName={setDraftAuthorName}
                />
            ) : null}
        </AnimatePresence>
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
    draftAuthorName,
    setDraftAuthorName,
}: ReportDraftFormContentProps) {
    const anchor = getDraftMarkerPosition(draft, selectedTarget);
    const { left, top, anchorCenterY, width, placement, centerVertically } = getDraftPopoverPosition(anchor);
    const verticalOffset = centerVertically ? "-50%" : 0;

    return (
        <motion.div
            key="report-draft-form"
            initial={{ y: verticalOffset }}
            animate={{ y: verticalOffset }}
            exit={{ y: verticalOffset }}
            transition={{ duration: 0.25, ease: DRAFT_MOTION_EASE }}
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto fixed z-[1000001] flex flex-col rounded-[24px] bg-[var(--adaptive-whiteOpacity500)] p-[4px] shadow-[0_0_120px_0_var(--adaptive-black500)] backdrop-blur-[30px]"
            style={{
                left,
                top: centerVertically ? anchorCenterY : top,
                width,
                transformOrigin: getMotionOrigin(placement),
            }}
        >
            <section className="overflow-hidden rounded-[20px] bg-[var(--adaptive-black100)]">
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
                    autoFocus
                />
            </section>

            <DraftPopoverConnector placement={placement} />
        </motion.div>
    );
}
