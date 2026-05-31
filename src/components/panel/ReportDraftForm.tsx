import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { stitchablePartProps } from "../report/parts.js";
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
            {...stitchablePartProps("draft-card")}
            style={{
                left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
                top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
                width: isMobileViewport ? "calc(100vw - 32px)" : 320,
            }}
        >
            <p {...stitchablePartProps("draft-card-title")}>
                {draft.reportType} · {draft.reportId}
            </p>

            <div {...stitchablePartProps("field-stack")}>
                <FieldEditor
                    fields={fields}
                    message={draft.message}
                    fieldValues={draft.fieldValues}
                    onMessageChange={updateDraftMessage}
                    onFieldChange={updateDraftField}
                />
            </div>

            <div {...stitchablePartProps("button-row")}>
                <button
                    type="button"
                    onClick={cancelDraft}
                    {...stitchablePartProps("secondary-button")}
                >
                    <span {...stitchablePartProps("button-with-hint")}>
                        취소
                        <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} />
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => void handleCreateSubmit()}
                    disabled={isCreating}
                    {...stitchablePartProps("primary-button")}
                >
                    <span {...stitchablePartProps("button-with-hint")}>
                        {isCreating ? "저장 중..." : "저장"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} />
                    </span>
                </button>
            </div>
        </div>
    );
}
