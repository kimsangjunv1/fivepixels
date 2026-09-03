import { useState, type ReactNode } from "react";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import { NoticeDialog } from "@/shared/components/ui/NoticeDialog.js";

type ReportPersonalKeyDialogProps = {
    mode: "required" | "insert" | "rotate";
    onCancel: () => void;
    onComplete: (message: string) => void;
};

export function ReportPersonalKeyDialog({ mode, onCancel, onComplete }: ReportPersonalKeyDialogProps) {
    const { issuePersonalKey, rotatePersonalKey, insertPersonalKey, personalKeyCandidates, messages } = useReportPreferences();
    const [key, setKey] = useState("");
    const [authorId, setAuthorId] = useState(personalKeyCandidates.length === 1 ? personalKeyCandidates[0]!.id : "");
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
            } catch {
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
            } catch {
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

    const title =
        mode === "required" ? messages.personalKey.requiredTitle : mode === "rotate" ? messages.personalKey.rotateTitle : messages.personalKey.insertTitle;
    const description =
        mode === "required"
            ? messages.personalKey.requiredDescription
            : mode === "rotate"
              ? messages.personalKey.rotateDescription
              : messages.personalKey.insertDescription;

    let body: ReactNode = null;

    if (mode === "required") {
        body = (
            <>
                <select
                    value={authorId}
                    onChange={(event) => setAuthorId(event.target.value)}
                    className="w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none"
                >
                    <option value="">{messages.personalKey.reviewerPlaceholder}</option>
                    {personalKeyCandidates.map((author) => (
                        <option
                            key={author.id}
                            value={author.id}
                        >
                            {author.name}
                        </option>
                    ))}
                </select>
                <ul className="mt-[10px] list-disc space-y-[4px] pl-[18px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]">
                    <li>{messages.personalKey.backupWarning}</li>
                    <li>{messages.personalKey.restoreGuide}</li>
                </ul>
            </>
        );
    } else if (mode === "insert") {
        body = (
            <input
                autoFocus
                value={key}
                onChange={(event) => {
                    setKey(event.target.value);
                    setError("");
                }}
                placeholder={messages.personalKey.inputPlaceholder}
                className="w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none"
            />
        );
    } else {
        body = <p className="rounded-[8px] bg-amber-50 p-[10px] text-[12px] leading-[1.4] text-amber-800">{messages.personalKey.rotateWarning}</p>;
    }

    return (
        <NoticeDialog
            title={title}
            description={description}
            actions={[
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
            ]}
        >
            {body}
            {error ? <p className="mt-[8px] text-[12px] text-[var(--adaptive-black700)]">{error}</p> : null}
        </NoticeDialog>
    );
}
