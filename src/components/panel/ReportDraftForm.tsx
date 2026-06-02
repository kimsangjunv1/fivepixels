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

    const baseClass = "pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 bg-[var(--adaptive-grey500)]";

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
    const checkboxFields = fields.filter((field) => field.type === "checkbox");

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
            className="pointer-events-auto fixed z-[1000001] relative flex flex-col items-center rounded-[16px] w-full shadow-[0_0_120px_0_var(--adaptive-grey500)] bg-[var(--adaptive-whiteOpacity500)] backdrop-blur-[30px] p-[4px]"
            style={{
                left,
                top: centerVertically ? anchorCenterY : top,
                width,
                transformOrigin: getMotionOrigin(placement),
            }}
        >
            <div className="absolute top-[50%] left-[-32px] transform translate-y-[-50%] w-[32px] h-[1px] bg-black" />
            <section className="flex flex-col gap-[8px] rounded-[16px] overflow-hidden bg-[var(--adaptive-grey100)] shadow-[var(--shadow-normal)] w-full p-[8px]">
                <section className="flex items-center justify-between w-full gap-[8px] h-[24px]">
                    <p className="text-[14px] text-[var(--adaptive-grey700)] pl-[8px]">
                        * {draft.reportId} *{/* {draft.reportId} */}
                    </p>
                </section>

                <section className="flex flex-col items-center gap-[12px] w-full">
                    <FieldEditor
                        fields={fields}
                        message={draft.message}
                        fieldValues={draft.fieldValues}
                        onMessageChange={updateDraftMessage}
                        onFieldChange={updateDraftField}
                        variant="draft-bubble"
                    />
                </section>

                <section className="flex justify-end w-full gap-[4px]">
                    <button
                        type="button"
                        onClick={cancelDraft}
                        className="h-full text-[14px] font-semibold flex flex-col justify-center items-center gap-[4px] rounded-[12px] p-[8px_12px] bg-[var(--adaptive-grey300)] text-white whitespace-nowrap"
                    >
                        닫기
                        {/* <ShortcutHint
                                    binding={REPORT_SHORTCUTS.cancel}
                                    visible={visibleShortcutKeys}
                                /> */}
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleCreateSubmit()}
                        disabled={isCreating}
                        className="h-full flex-1 text-[14px] font-semibold flex flex-col justify-center items-center gap-[4px] rounded-[12px] p-[8px_12px] bg-[var(--adaptive-blue400)] text-white whitespace-nowrap shadow-[var(--shadow-normal)]"
                    >
                        {isCreating ? "저장 중..." : "완료"}
                        {/* <ShortcutHint
                                        binding={REPORT_SHORTCUTS.submit}
                                        visible={visibleShortcutKeys}
                                    /> */}
                    </button>
                </section>
            </section>

            {checkboxFields.length > 0 ? (
                <section className="flex w-full flex-col gap-[4px] p-[12px]">
                    {checkboxFields.map((field) => (
                        <label
                            key={field.key}
                            className="text-[var(--adaptive-grey500)] flex items-center gap-[4px] w-full px-[12px]"
                        >
                            <input
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-white/50 bg-white/10 text-white accent-white bg-transparent"
                                checked={draft.fieldValues[field.key] === true}
                                onChange={(event) => updateDraftField(field.key, event.target.checked)}
                            />
                            <span>{field.label}</span>
                        </label>
                    ))}
                </section>
            ) : null}

            <DraftPopoverConnector placement={placement} />
        </motion.div>
    );
}
