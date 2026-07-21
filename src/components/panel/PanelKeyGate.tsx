import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import type { PanelView } from "@/hooks/report/useReportState.js";
import { PanelGateButton, PanelGateShell } from "./PanelGateShell.js";

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
        <PanelGateShell
            title={title}
            description={description}
            footer={
                <div className="flex items-center justify-end gap-[10px]">
                    {canShowSnippet ? (
                        <PanelGateButton
                            variant="secondary"
                            onClick={() => void handleCopySnippet()}
                        >
                            {copied ? onboarding.copied : onboarding.copySnippet}
                        </PanelGateButton>
                    ) : null}
                    <PanelGateButton onClick={handleRefresh}>{onboarding.refresh}</PanelGateButton>
                </div>
            }
        >
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
        </PanelGateShell>
    );
}
