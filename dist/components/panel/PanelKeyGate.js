import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ChevronDownIcon } from "../../components/icons/Icons.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { PanelGateButton, PanelGateShell } from "./PanelGateShell.js";
function buildReviewerSnippet({ name, authorId, publicKey }) {
    return `{ id: "${authorId}", name: "${name}", publicKey: "${publicKey}" }`;
}
export function PanelKeyGate({ mode }) {
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
        }
        catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };
    const handleRefresh = () => {
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    };
    return (_jsx(PanelGateShell, { title: title, description: description, footer: _jsxs("div", { className: "flex items-center justify-end gap-[10px]", children: [canShowSnippet ? (_jsx(PanelGateButton, { variant: "secondary", onClick: () => void handleCopySnippet(), children: copied ? onboarding.copied : onboarding.copySnippet })) : null, _jsx(PanelGateButton, { onClick: handleRefresh, children: onboarding.refresh })] }), children: canShowSnippet && publicKey ? (_jsxs("div", { className: "flex flex-col gap-[6px] overflow-hidden rounded-[8px] border border-[var(--adaptive-black200)]", children: [_jsxs("button", { type: "button", onClick: () => setKeyInfoOpen((current) => !current), "aria-expanded": keyInfoOpen, className: "flex items-center justify-between gap-[8px] px-[10px] py-[8px] text-left text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: [_jsx("span", { children: onboarding.keyInfoToggle }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 transition-transform ${keyInfoOpen ? "rotate-180" : ""}` })] }), keyInfoOpen ? (_jsxs("div", { className: "flex flex-col gap-[6px] px-[10px] pb-[10px]", children: [_jsx("p", { className: "text-[11px] font-semibold text-[var(--adaptive-black500)]", children: onboarding.reviewerSnippetHint }), _jsx("pre", { className: "max-h-[120px] overflow-auto whitespace-pre-wrap break-all rounded-[8px] bg-[var(--adaptive-black100)] p-[10px] text-[11px] leading-[1.5] text-[var(--adaptive-black800)]", children: buildReviewerSnippet({ name, authorId, publicKey }) })] })) : null] })) : null }));
}
//# sourceMappingURL=PanelKeyGate.js.map