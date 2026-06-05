import type { ReportField, ReportFieldValues } from "../../../types/report.js";
import type { ReportAuthor } from "../../../types/report.js";
import { SendIcon } from "../../icons/SendIcon.js";
import { AuthorSelector } from "./AuthorSelector.js";
import { FieldTagSelector } from "./FieldTagSelector.js";

type FeedbackComposerProps = {
    message: string;
    onMessageChange: (value: string) => void;
    authorName: string;
    onAuthorNameChange: (value: string) => void;
    authors: ReportAuthor[];
    fields: ReportField[];
    fieldValues: ReportFieldValues;
    onFieldChange: (key: string, value: string | boolean) => void;
    showTags?: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
};

export function FeedbackComposer({
    message,
    onMessageChange,
    authorName,
    onAuthorNameChange,
    authors,
    fields,
    fieldValues,
    onFieldChange,
    showTags = false,
    onSubmit,
    isSubmitting = false,
    placeholder = "leave your message",
    autoFocus = false,
}: FeedbackComposerProps) {
    const handleSubmit = () => {
        if (isSubmitting) {
            return;
        }

        onSubmit();
    };

    return (
        <div className="flex w-full flex-col">
            <textarea
                autoFocus={autoFocus}
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                placeholder={placeholder}
                rows={3}
                className="min-h-[72px] w-full resize-none bg-transparent px-[16px] pt-[16px] text-[14px] leading-[1.4] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)]"
                onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleSubmit();
                    }
                }}
            />

            <div className="flex items-center justify-between gap-[8px] px-[12px] pb-[12px]">
                <AuthorSelector
                    authors={authors}
                    value={authorName}
                    onChange={onAuthorNameChange}
                />
                <button
                    type="button"
                    data-stitchable-interactive=""
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-black900)] text-[var(--adaptive-black50)] disabled:opacity-50"
                    aria-label="전송"
                >
                    <SendIcon className="h-[16px] w-[16px]" />
                </button>
            </div>

            {showTags ? (
                <FieldTagSelector
                    fields={fields}
                    fieldValues={fieldValues}
                    onFieldChange={(key, value) => onFieldChange(key, value)}
                />
            ) : null}
        </div>
    );
}
