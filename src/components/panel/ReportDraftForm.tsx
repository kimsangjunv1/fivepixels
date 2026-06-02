import { AnimatePresence, motion } from "motion/react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import type { DraftPopoverPlacement } from "../../utils/coordinates.js";
import { DRAFT_POPOVER_CONNECTOR_WIDTH, getDraftMarkerPosition, getDraftPopoverPosition } from "../../utils/coordinates.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";

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

    const baseClass = "pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 bg-[var(--adaptive-grey200)]";

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
    const { draft, fields, isCreating, selectedTarget, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit } = useReport();

    return (
        <AnimatePresence>
            {draft ? (
                <ReportDraftFormContent
                    draft={draft}
                    fields={fields}
                    isCreating={isCreating}
                    selectedTarget={selectedTarget}
                    visibleShortcutKeys={visibleShortcutKeys}
                    updateDraftMessage={updateDraftMessage}
                    updateDraftField={updateDraftField}
                    cancelDraft={cancelDraft}
                    handleCreateSubmit={handleCreateSubmit}
                />
            ) : null}
        </AnimatePresence>
    );
}

type ReportDraftFormContentProps = {
    draft: NonNullable<ReturnType<typeof useReport>["draft"]>;
    fields: ReturnType<typeof useReport>["fields"];
    isCreating: boolean;
    selectedTarget: ReturnType<typeof useReport>["selectedTarget"];
    visibleShortcutKeys: boolean;
    updateDraftMessage: (message: string) => void;
    updateDraftField: (key: string, value: string | boolean) => void;
    cancelDraft: () => void;
    handleCreateSubmit: () => Promise<void>;
};

function ReportDraftFormContent({
    draft,
    fields,
    isCreating,
    selectedTarget,
    visibleShortcutKeys,
    updateDraftMessage,
    updateDraftField,
    cancelDraft,
    handleCreateSubmit,
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
            // initial={{ opacity: 0 }}
            // animate={{ opacity: 1 }}
            // exit={{ opacity: 0 }}

            // initial={{ scale: 0.95, opacity: 0, y: verticalOffset }}
            // animate={{ scale: 1, opacity: 1, y: verticalOffset }}
            // exit={{ scale: 0.95, opacity: 0, y: verticalOffset }}

            transition={{ duration: 0.25, ease: DRAFT_MOTION_EASE }}
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto fixed z-[1000001] text-xs"
            style={{
                left,
                top: centerVertically ? anchorCenterY : top,
                width,
                transformOrigin: getMotionOrigin(placement),
            }}
        >
            <div className="relative overflow-visible">
                <div className="relative z-10 flex flex-col items-start gap-2.5 text-white">
                    <div className="relative flex flex-col items-center gap-[4px] rounded-[24px] bg-[var(--adaptive-greyOpacity100)] p-[4px] shadow-[0_0_120px_0_var(--adaptive-grey700)] backdrop-blur-[20px] pb-2.5">
                        <section className="flex items-center gap-[4px] px-[12px]">
                            <p className="py-[4px] text-[12px] text-[var(--adaptive-grey700)]">+ {draft.reportId}</p>
                            <button
                                type="button"
                                onClick={cancelDraft}
                                className="flex items-center gap-[4px] rounded-[8px] bg-[var(--adaptive-red400)] p-[2px_6px] whitespace-nowrap shadow-[var(--shadow-normal)]"
                            >
                                <p className="text-[12px] font-semibold text-white">닫기</p>
                                <ShortcutHint
                                    binding={REPORT_SHORTCUTS.cancel}
                                    visible={visibleShortcutKeys}
                                />
                            </button>
                        </section>

                        <FieldEditor
                            fields={fields}
                            message={draft.message}
                            fieldValues={draft.fieldValues}
                            onMessageChange={updateDraftMessage}
                            onFieldChange={updateDraftField}
                            variant="draft-bubble"
                        />

                        <DraftPopoverConnector placement={placement} />

                        <section className="flex w-full justify-end">
                            <button
                                type="button"
                                onClick={() => void handleCreateSubmit()}
                                disabled={isCreating}
                                className="rounded-[8px] bg-blue-400 p-[4px_8px] whitespace-nowrap"
                            >
                                <span className="inline-flex items-center gap-1">
                                    {isCreating ? "저장 중..." : "저장"}
                                    <ShortcutHint
                                        binding={REPORT_SHORTCUTS.submit}
                                        visible={visibleShortcutKeys}
                                    />
                                </span>
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
