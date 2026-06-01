import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { btnPrimary, btnSecondary, cardSurface } from "../report/classes.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";

export function ReportDraftForm() {
    const {
        draft,
        fields,
        isMobileViewport,
        isCreating,
        visibleShortcutKeys,
        updateDraftMessage,
        updateDraftField,
        cancelDraft,
        handleCreateSubmit,
    } = useReport();

    if (!draft) {
        return null;
    }

    return (
        <div
            onClick={(event) => event.stopPropagation()}
            className={cardSurface}
            style={{
                left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
                top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
                width: isMobileViewport ? "calc(100vw - 32px)" : 320,
            }}
        >
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {draft.reportType} · {draft.reportId}
            </p>

            <div className="flex flex-col gap-3">
                <FieldEditor
                    fields={fields}
                    message={draft.message}
                    fieldValues={draft.fieldValues}
                    onMessageChange={updateDraftMessage}
                    onFieldChange={updateDraftField}
                />
            </div>

            <div className="mt-4 flex gap-2">
                <button type="button" onClick={cancelDraft} className={`flex-1 ${btnSecondary}`}>
                    <span className="inline-flex items-center gap-1">
                        취소
                        <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} />
                    </span>
                </button>
                <button type="button" onClick={() => void handleCreateSubmit()} disabled={isCreating} className={`flex-1 ${btnPrimary}`}>
                    <span className="inline-flex items-center gap-1">
                        {isCreating ? "저장 중..." : "저장"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} />
                    </span>
                </button>
            </div>
        </div>
    );
}
