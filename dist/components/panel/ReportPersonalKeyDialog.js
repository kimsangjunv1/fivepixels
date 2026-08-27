import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useReportPreferences } from "../../providers/reportContext.js";
import { ReportPanelNoticeDialog } from "./ReportPanelNoticeDialog.js";
export function ReportPersonalKeyDialog({ mode, onCancel, onComplete }) {
    const { issuePersonalKey, rotatePersonalKey, insertPersonalKey, personalKeyCandidates, messages } = useReportPreferences();
    const [key, setKey] = useState("");
    const [authorId, setAuthorId] = useState(personalKeyCandidates.length === 1 ? personalKeyCandidates[0].id : "");
    const [error, setError] = useState("");
    const handleConfirm = async () => {
        if (mode === "rotate") {
            const issuedKey = await rotatePersonalKey();
            if (!issuedKey) {
                setError(messages.personalKey.invalidKey);
                return;
            }
            try {
                await navigator.clipboard.writeText(issuedKey.publicKey);
                onComplete(messages.personalKey.publicKeyCopied);
            }
            catch {
                onComplete(messages.personalKey.registrationPending);
            }
            return;
        }
        if (mode === "required") {
            const issuedKey = await issuePersonalKey(authorId);
            if (!issuedKey) {
                setError(messages.personalKey.ownerRequired);
                return;
            }
            try {
                await navigator.clipboard.writeText(issuedKey.publicKey);
                onComplete(messages.personalKey.publicKeyCopied);
            }
            catch {
                onComplete(messages.personalKey.registrationPending);
            }
            return;
        }
        const inserted = await insertPersonalKey(key);
        if (!inserted.saved) {
            setError(inserted.reason === "project-mismatch" ? messages.personalKey.restoreProjectMismatch : messages.personalKey.invalidKey);
            return;
        }
        onComplete(inserted.authorized ? messages.personalKey.setupSuccess : messages.personalKey.registrationPending);
    };
    const title = mode === "required" ? messages.personalKey.requiredTitle : mode === "rotate" ? messages.personalKey.rotateTitle : messages.personalKey.insertTitle;
    const description = mode === "required"
        ? messages.personalKey.requiredDescription
        : mode === "rotate"
            ? messages.personalKey.rotateDescription
            : messages.personalKey.insertDescription;
    let body = null;
    if (mode === "required") {
        body = (_jsxs(_Fragment, { children: [_jsxs("select", { value: authorId, onChange: (event) => setAuthorId(event.target.value), className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none", children: [_jsx("option", { value: "", children: messages.personalKey.reviewerPlaceholder }), personalKeyCandidates.map((author) => (_jsx("option", { value: author.id, children: author.name }, author.id)))] }), _jsxs("ul", { className: "mt-[10px] list-disc space-y-[4px] pl-[18px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]", children: [_jsx("li", { children: messages.personalKey.backupWarning }), _jsx("li", { children: messages.personalKey.restoreGuide })] })] }));
    }
    else if (mode === "insert") {
        body = (_jsx("input", { autoFocus: true, value: key, onChange: (event) => {
                setKey(event.target.value);
                setError("");
            }, placeholder: messages.personalKey.inputPlaceholder, className: "w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none" }));
    }
    else {
        body = _jsx("p", { className: "rounded-[8px] bg-amber-50 p-[10px] text-[12px] leading-[1.4] text-amber-800", children: messages.personalKey.rotateWarning });
    }
    return (_jsxs(ReportPanelNoticeDialog, { title: title, description: description, actions: [
            {
                id: "cancel",
                label: messages.common.cancel,
                variant: "muted",
                onClick: onCancel,
            },
            {
                id: "confirm",
                label: messages.common.confirm,
                variant: "primary",
                disabled: mode === "required" ? !authorId : mode === "insert" ? !key.trim() : false,
                onClick: () => void handleConfirm(),
            },
        ], children: [body, error ? _jsx("p", { className: "mt-[8px] text-[12px] text-[var(--adaptive-black700)]", children: error }) : null] }));
}
//# sourceMappingURL=ReportPersonalKeyDialog.js.map