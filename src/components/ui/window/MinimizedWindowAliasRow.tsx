import { useEffect, useRef, useState } from "react";
import { CloseIcon, EditIcon } from "@/components/icons/Icons.js";
import type { ReportMessages } from "@/i18n/types.js";
import { readMinimizedWindowAlias, writeMinimizedWindowAlias } from "@/utils/marker/minimizedWindowAlias.js";

function MinimizedCaseMarquee({ caseTexts }: { caseTexts: string[] }) {
    if (caseTexts.length === 0) {
        return null;
    }

    return (
        <div className="min-w-0 flex-1 overflow-hidden text-[12px] text-[var(--adaptive-black700)]">
            <div
                aria-hidden
                className="fivepixels-marker-window-marquee"
                style={{ animationDuration: `${Math.max(12, caseTexts.length * 6)}s` }}
            >
                {[0, 1].map((copyIndex) => (
                    <div
                        key={copyIndex}
                        className="fivepixels-marker-window-marquee__copy"
                    >
                        {caseTexts.map((text, index) => (
                            <span
                                key={`${copyIndex}-${index}`}
                                className="whitespace-nowrap"
                            >
                                <span className="mr-[4px] text-[var(--adaptive-black500)]">{index + 1}.</span>
                                {text}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function MinimizedWindowAliasRow({
    projectId,
    reportId,
    caseTexts,
    messages,
    onRestore,
    restoreDisabled = false,
}: {
    projectId: string;
    reportId: string;
    caseTexts: string[];
    messages: ReportMessages;
    onRestore: () => void;
    restoreDisabled?: boolean;
}) {
    const [alias, setAlias] = useState(() => readMinimizedWindowAlias(projectId, reportId));
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(alias);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAlias(readMinimizedWindowAlias(projectId, reportId));
    }, [projectId, reportId]);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        inputRef.current?.focus();
        inputRef.current?.select();
    }, [isEditing]);

    const commitAlias = () => {
        const next = writeMinimizedWindowAlias(projectId, reportId, draft);
        setAlias(next);
        setDraft(next);
        setIsEditing(false);
    };

    const clearAlias = () => {
        writeMinimizedWindowAlias(projectId, reportId, "");
        setAlias("");
        setDraft("");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div
                className="flex min-w-0 items-center gap-[4px]"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    maxLength={40}
                    placeholder={messages.marker.minimizedAliasPlaceholder}
                    aria-label={messages.marker.minimizedAliasInputAriaLabel}
                    data-fivepixels-interactive=""
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            commitAlias();
                        }

                        if (event.key === "Escape") {
                            event.preventDefault();
                            setDraft(alias);
                            setIsEditing(false);
                        }
                    }}
                    onBlur={commitAlias}
                    className="min-w-0 flex-1 rounded-[4px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[12px] font-semibold text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]"
                />
                {alias ? (
                    <button
                        type="button"
                        data-fivepixels-interactive=""
                        aria-label={messages.marker.minimizedAliasClearAriaLabel}
                        title={messages.marker.minimizedAliasClearAriaLabel}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={clearAlias}
                        className="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]"
                    >
                        <CloseIcon className="h-[12px] w-[12px]" />
                    </button>
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-[4px]">
            <button
                type="button"
                data-fivepixels-interactive=""
                onClick={onRestore}
                disabled={restoreDisabled}
                aria-label={messages.marker.windowRestoreAriaLabel}
                className="flex min-w-0 flex-1 items-center overflow-hidden text-left"
            >
                {alias ? (
                    <p
                        className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-[1.3] text-[var(--adaptive-black900)]"
                        title={alias}
                    >
                        {alias}
                    </p>
                ) : (
                    <MinimizedCaseMarquee caseTexts={caseTexts} />
                )}
            </button>
            <button
                type="button"
                data-fivepixels-interactive=""
                aria-label={messages.marker.minimizedAliasEditAriaLabel}
                title={messages.marker.minimizedAliasEditAriaLabel}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation();
                    setDraft(alias);
                    setIsEditing(true);
                }}
                className="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]"
            >
                <EditIcon className="h-[12px] w-[12px]" />
            </button>
        </div>
    );
}
