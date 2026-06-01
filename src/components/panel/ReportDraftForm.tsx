import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
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
            className="pointer-events-auto fixed z-30 space-y-2 rounded-lg border border-slate-300 bg-white p-3 text-xs shadow-xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900"
            style={{
                left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
                top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
                width: isMobileViewport ? "calc(100vw - 32px)" : 320,
            }}
        >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {draft.reportType} · {draft.reportId}
            </p>

            <div className="flex flex-col gap-2">
                <FieldEditor
                    fields={fields}
                    message={draft.message}
                    fieldValues={draft.fieldValues}
                    onMessageChange={updateDraftMessage}
                    onFieldChange={updateDraftField}
                />
            </div>

            <div className="mt-1 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={cancelDraft}
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
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
                    className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                    <span className="inline-flex items-center gap-1">
                        {isCreating ? "저장 중..." : "저장"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} />
                    </span>
                </button>
            </div>
        </div>
    );
}
