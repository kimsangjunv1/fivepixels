import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import type { PanelView } from "@/hooks/useReportState.js";

type PanelKeyGateMode = Extract<PanelView, "setup-complete" | "key-issue">;

function buildReviewerSnippet({ name, authorId, publicKey }: { name: string; authorId: string; publicKey: string }) {
    return `{ id: "${authorId}", name: "${name}", publicKey: "${publicKey}" }`;
}

export function PanelKeyGate({ mode }: { mode: PanelKeyGateMode }) {
    const { messages, selfProfile, publicKey } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const onboarding = messages.onboarding;
    const [copied, setCopied] = useState(false);
    const [keyInfoOpen, setKeyInfoOpen] = useState(false);
    const name = selfProfile?.name?.trim() || "reviewer";
    const authorId = selfProfile?.authorId?.trim() || "";
    const canShowSnippet = Boolean(authorId && publicKey);
    const title = mode === "key-issue" ? onboarding.issueTitle : onboarding.doneTitle;
    const description = mode === "key-issue" ? onboarding.issueDescription : onboarding.doneDescription;

    const handleCopySnippet = async () => {
        if (!canShowSnippet || !publicKey) {
            return;
        }

        try {
            await navigator.clipboard.writeText(buildReviewerSnippet({ name, authorId, publicKey }));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };

    const handleRefresh = () => {
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    };

    return (
        <section className="flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px]">
            <div>
                <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{title}</h6>
                <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{description}</p>
            </div>

            {canShowSnippet && publicKey ? (
                <div className="flex flex-col gap-[6px] overflow-hidden rounded-[8px] border border-[var(--adaptive-black200)]">
                    <button
                        type="button"
                        onClick={() => setKeyInfoOpen((current) => !current)}
                        aria-expanded={keyInfoOpen}
                        className="flex items-center justify-between gap-[8px] px-[10px] py-[8px] text-left text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                    >
                        <span>{onboarding.keyInfoToggle}</span>
                        <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 transition-transform ${keyInfoOpen ? "rotate-180" : ""}`} />
                    </button>

                    {keyInfoOpen ? (
                        <div className="flex flex-col gap-[6px] px-[10px] pb-[10px]">
                            <p className="text-[11px] font-semibold text-[var(--adaptive-black500)]">{onboarding.reviewerSnippetHint}</p>
                            <pre className="max-h-[120px] overflow-auto whitespace-pre-wrap break-all rounded-[8px] bg-[var(--adaptive-black100)] p-[10px] text-[11px] leading-[1.5] text-[var(--adaptive-black800)]">
                                {buildReviewerSnippet({ name, authorId, publicKey })}
                            </pre>
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div className="flex items-center justify-end gap-[10px]">
                {canShowSnippet ? (
                    <button
                        type="button"
                        onClick={() => void handleCopySnippet()}
                        className="rounded-[8px] bg-[var(--adaptive-grey300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                    >
                        {copied ? onboarding.copied : onboarding.copySnippet}
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
                >
                    {onboarding.refresh}
                </button>
            </div>
        </section>
    );
}
