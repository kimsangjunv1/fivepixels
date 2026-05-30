import { REPORT_SHORTCUTS } from "../../constants/reportShortcuts.js";
import { useReport } from "../../providers/reportContext.js";
import { ShortcutHint } from "../ShortcutHint.js";
import { FieldEditor } from "./FieldEditor.js";
import { reportStyles } from "../report/styles.js";

export function ReportDraftForm() {
    const {
        draft,
        fields,
        palette,
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
            style={{
                ...reportStyles.draftCard,
                left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
                top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
                width: isMobileViewport ? "calc(100vw - 32px)" : 320,
                backgroundColor: palette.card,
                borderColor: palette.panelBorder,
                color: palette.text,
            }}
        >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                {draft.reportType} · {draft.reportId}
            </p>

            <div style={reportStyles.fieldStack}>
                <FieldEditor
                    fields={fields}
                    message={draft.message}
                    fieldValues={draft.fieldValues}
                    palette={palette}
                    onMessageChange={updateDraftMessage}
                    onFieldChange={updateDraftField}
                />
            </div>

            <div style={reportStyles.buttonRow}>
                <button
                    type="button"
                    onClick={cancelDraft}
                    style={{
                        ...reportStyles.secondaryButton,
                        borderColor: palette.inputBorder,
                        color: palette.text,
                    }}
                >
                    <span style={reportStyles.buttonWithHint}>
                        취소
                        <ShortcutHint binding={REPORT_SHORTCUTS.cancel} visible={visibleShortcutKeys} palette={palette} />
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => void handleCreateSubmit()}
                    disabled={isCreating}
                    style={{
                        ...reportStyles.primaryButton,
                        backgroundColor: "#2563eb",
                    }}
                >
                    <span style={reportStyles.buttonWithHint}>
                        {isCreating ? "저장 중..." : "저장"}
                        <ShortcutHint binding={REPORT_SHORTCUTS.submit} visible={visibleShortcutKeys} palette={palette} />
                    </span>
                </button>
            </div>
        </div>
    );
}
