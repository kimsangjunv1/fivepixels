import { AnimatePresence, motion } from "motion/react";
import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import type { DraftPopoverTailCorner } from "../../utils/coordinates.js";
import { getDraftMarkerPosition, getDraftPopoverPosition } from "../../utils/coordinates.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { DraftBubbleTailSvg } from "./DraftBubbleTailSvg.js";
import { FieldEditor } from "./FieldEditor.js";

const DRAFT_MOTION_EASE = [0.22, 1, 0.36, 1] as const;

function getMotionOrigin(tailCorner: DraftPopoverTailCorner) {
    switch (tailCorner) {
        case "bottom-left":
            return "0% 100%";
        case "bottom-right":
            return "100% 100%";
        case "top-left":
            return "0% 0%";
        case "top-right":
            return "100% 0%";
    }
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
    const { left, top, width, tailCorner } = getDraftPopoverPosition(anchor);

    return (
        <motion.div
            key="report-draft-form"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.28, ease: DRAFT_MOTION_EASE }}
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto fixed z-[1000001] text-xs"
            style={{ left, top, width, transformOrigin: getMotionOrigin(tailCorner) }}
        >
            <div className="relative overflow-visible ">
                {/* <div className="relative z-10 flex flex-col gap-2.5 rounded-[22px] bg-[var(--adaptive-blue500,#3182f6)] p-3 pb-2.5 text-white"> */}
                <div className="relative z-10 flex flex-col items-start gap-2.5 text-white">
                    <section className="flex items-center">
                        {/* <p className="text-[12px] font-bold text-white backdrop-blur-[2px] bg-[var(--adaptive-greyOpacity400)] p-[4px_12px] rounded-[10px]">{draft.reportId}</p> */}
                        {/* {draft.reportType} · {draft.reportId} */}
                        <div className="flex items-end justify-end gap-2 pt-0.5">
                            {/* <button
                                type="button"
                                onClick={cancelDraft}
                                className="bg-red-100 whitespace-nowrap p-[4px_8px] rounded-[8px]"
                                // className="inline-flex items-center justify-center rounded-[10px] border border-white/55 px-2.5 py-1.5 text-[12px] font-semibold leading-none text-white hover:bg-white/12"
                            >
                                <span className="inline-flex items-center gap-1">
                                    취소
                                    <ShortcutHint
                                        binding={REPORT_SHORTCUTS.cancel}
                                        visible={visibleShortcutKeys}
                                    />
                                </span>
                            </button> */}
                            {/* <button
                                type="button"
                                onClick={() => void handleCreateSubmit()}
                                disabled={isCreating}
                                className="bg-blue-400 whitespace-nowrap p-[4px_8px] rounded-[8px]"
                                // className="inline-flex items-center justify-center rounded-[10px] border border-transparent bg-white px-2.5 py-1.5 text-[12px] font-semibold leading-none text-[var(--adaptive-blue700,#1b64da)] hover:bg-[color-mix(in_srgb,#fff_92%,var(--adaptive-blue100,#c9e2ff))] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="inline-flex items-center gap-1">
                                    {isCreating ? "저장 중..." : "저장"}
                                    <ShortcutHint
                                        binding={REPORT_SHORTCUTS.submit}
                                        visible={visibleShortcutKeys}
                                    />
                                </span>
                            </button> */}
                        </div>
                    </section>

                    <div className="relative flex flex-col items-center gap-[4px] rounded-[24px] bg-[var(--adaptive-greyOpacity100)] backdrop-blur-[20px] p-[4px] shadow-[0_0_120px_0_var(--adaptive-grey700)] pb-2.5">
                        <section className="flex items-center gap-[4px] px-[12px]">
                            <p className="text-[12px] text-[var(--adaptive-grey700)] py-[4px]">+ {draft.reportId}</p>
                            <button
                                type="button"
                                onClick={cancelDraft}
                                className="flex items-center gap-[4px] bg-[var(--adaptive-red400)] whitespace-nowrap p-[2px_6px] rounded-[8px] shadow-[var(--shadow-normal)]"
                                // className="inline-flex items-center justify-center rounded-[10px] border border-white/55 px-2.5 py-1.5 text-[12px] font-semibold leading-none text-white hover:bg-white/12"
                            >
                                <p className="text-[12px] font-semibold text-white">닫기</p>
                                <ShortcutHint
                                    binding={REPORT_SHORTCUTS.cancel}
                                    visible={visibleShortcutKeys}
                                />
                            </button>
                        </section>
                        {/* <p className="text-[12px] font-bold text-center text-white backdrop-blur-[2px] bg-[var(--adaptive-greyOpacity500)] p-[4px_8px] rounded-[100px]">{draft.reportId}</p> */}

                        <FieldEditor
                            fields={fields}
                            message={draft.message}
                            fieldValues={draft.fieldValues}
                            onMessageChange={updateDraftMessage}
                            onFieldChange={updateDraftField}
                            variant="draft-bubble"
                            tailCorner={tailCorner}
                        />
                        <div className="w-[32px] h-[2px] bg-[var(--adaptive-grey200)] absolute bottom-[50%] left-[-32px]" />
                        <section className="flex justify-end w-full">
                            <button
                                type="button"
                                onClick={() => void handleCreateSubmit()}
                                disabled={isCreating}
                                className="bg-blue-400 whitespace-nowrap p-[4px_8px] rounded-[8px]"
                                // className="inline-flex items-center justify-center rounded-[10px] border border-transparent bg-white px-2.5 py-1.5 text-[12px] font-semibold leading-none text-[var(--adaptive-blue700,#1b64da)] hover:bg-[color-mix(in_srgb,#fff_92%,var(--adaptive-blue100,#c9e2ff))] disabled:cursor-not-allowed disabled:opacity-50"
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
                    {/* <DraftBubbleTailSvg corner={tailCorner} /> */}
                    {/* <div className="relative flex flex-col gap-2 rounded-[22px] bg-[var(--adaptive-blue500,#3182f6)] p-3 pb-2.5">
                    </div> */}
                </div>

                {/* <DraftBubbleTailSvg corner={tailCorner} /> */}
            </div>
        </motion.div>
    );
}
