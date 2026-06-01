import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { btnHint, btnPrimary, btnRow, btnSecondary, cardSurface, stack, textTitle } from "../report/classes.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";

export function ReportDraftForm() {
    const { draft, fields, isMobileViewport, isCreating, visibleShortcutKeys, updateDraftMessage, updateDraftField, cancelDraft, handleCreateSubmit } = useReport();

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
            <p className={textTitle}>
                {draft.reportType} · {draft.reportId}
            </p>

            <div className={stack}>
                <FieldEditor fields={fields} message={draft.message} fieldValues={draft.fieldValues} onMessageChange={updateDraftMessage} onFieldChange={updateDraftField} />
            </div>

            <div className={btnRow}>
                <button type="button" onClick={cancelDraft} className={btnSecondary}>
                    <span className={btnHint}>
                        취소
                        <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} />
                    </span>
                </button>
                <button type="button" onClick={() => void handleCreateSubmit()} disabled={isCreating} className={btnPrimary}>
                    <span className={btnHint}>
                        {isCreating ? "저장 중..." : "저장"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} />
                    </span>
                </button>
            </div>
        </div>
    );
}
