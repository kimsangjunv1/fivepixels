import { AnimatePresence, motion } from "motion/react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import type { DraftPopoverTailCorner } from "../../utils/coordinates.js";
import { getDraftMarkerPosition, getDraftPopoverPosition } from "../../utils/coordinates.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";

const DRAFT_MOTION_EASE = [0.22, 1, 0.36, 1] as const;

function getTailPresentation(tailCorner: DraftPopoverTailCorner) {
    switch (tailCorner) {
        case "bottom-left":
            return {
                bodyCorner: "rounded-bl-[5px]",
                hook: "bottom-0 -left-[5px] rounded-br-[17px_16px]",
                origin: "0% 100%",
            };
        case "bottom-right":
            return {
                bodyCorner: "rounded-br-[5px]",
                hook: "bottom-0 -right-[5px] left-auto rounded-bl-[17px_16px]",
                origin: "100% 100%",
            };
        case "top-left":
            return {
                bodyCorner: "rounded-tl-[5px]",
                hook: "top-0 -left-[5px] rounded-tr-[17px_16px]",
                origin: "0% 0%",
            };
        case "top-right":
            return {
                bodyCorner: "rounded-tr-[5px]",
                hook: "top-0 -right-[5px] left-auto rounded-tl-[17px_16px]",
                origin: "100% 0%",
            };
    }
}

export function ReportDraftForm() {
    const {
        draft,
        fields,
        isCreating,
        selectedTarget,
        visibleShortcutKeys,
        updateDraftMessage,
        updateDraftField,
        cancelDraft,
        handleCreateSubmit,
    } = useReport();

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
    const { left, top, width, tailCorner } = getDraftPopoverPosition(anchor);
    const tail = getTailPresentation(tailCorner);

    return (
        <motion.div
            key="report-draft-form"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.28, ease: DRAFT_MOTION_EASE }}
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto fixed z-[1000001] text-xs"
            style={{ left, top, width, transformOrigin: tail.origin }}
        >
            <div className="relative overflow-visible">
                <div
                    className={`relative z-10 flex flex-col gap-2.5 rounded-[22px] bg-[var(--adaptive-blue500,#3182f6)] p-3 pb-2.5 text-white shadow-[0_12px_28px_-8px_color-mix(in_srgb,var(--adaptive-blue700,#1b64da)_55%,transparent),0_4px_12px_-4px_rgba(15,23,42,0.28)] ${tail.bodyCorner}`}
                >
                    <p className="text-[12px] font-bold leading-[1.2] text-white">
                        {draft.reportType} · {draft.reportId}
                    </p>

                    <div className="flex flex-col gap-2">
                        <FieldEditor
                            fields={fields}
                            message={draft.message}
                            fieldValues={draft.fieldValues}
                            onMessageChange={updateDraftMessage}
                            onFieldChange={updateDraftField}
                            variant="draft-bubble"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-0.5">
                        <button
                            type="button"
                            onClick={cancelDraft}
                            className="inline-flex items-center justify-center rounded-[10px] border border-white/55 px-2.5 py-1.5 text-[12px] font-semibold leading-none text-white hover:bg-white/12"
                        >
                            <span className="inline-flex items-center gap-1">
                                취소
                                <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} />
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleCreateSubmit()}
                            disabled={isCreating}
                            className="inline-flex items-center justify-center rounded-[10px] border border-transparent bg-white px-2.5 py-1.5 text-[12px] font-semibold leading-none text-[var(--adaptive-blue700,#1b64da)] hover:bg-[color-mix(in_srgb,#fff_92%,var(--adaptive-blue100,#c9e2ff))] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="inline-flex items-center gap-1">
                                {isCreating ? "저장 중..." : "저장"}
                                <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} />
                            </span>
                        </button>
                    </div>
                </div>

                <div
                    aria-hidden
                    className={`absolute z-0 h-[17px] w-[21px] bg-[var(--adaptive-blue500,#3182f6)] ${tail.hook}`}
                />
            </div>
        </motion.div>
    );
}
