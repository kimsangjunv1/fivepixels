import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useReport } from "../../providers/reportContext.js";
import { ChevronDownIcon } from "../../components/icons/Icons.js";
function buildReviewerSnippet({ name, authorId, publicKey }) {
    return `{ id: "${authorId}", name: "${name}", publicKey: "${publicKey}" }`;
}
export function PanelKeyGate() {
    const { messages, keyGateMode, selfProfile, publicKey, setErrorMessage } = useReport();
    const onboarding = messages.onboarding;
    const [copied, setCopied] = useState(false);
    const [keyInfoOpen, setKeyInfoOpen] = useState(false);
    const name = selfProfile?.name?.trim() || "reviewer";
    const authorId = selfProfile?.authorId?.trim() || "";
    const canShowSnippet = Boolean(authorId && publicKey);
    const title = keyGateMode === "key-issue" ? onboarding.issueTitle : onboarding.doneTitle;
    const description = keyGateMode === "key-issue" ? onboarding.issueDescription : onboarding.doneDescription;
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
    return (_jsxs("section", { className: "flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px]", children: [_jsxs("div", { children: [_jsx("h6", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: title }), _jsx("p", { className: "mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]", children: description })] }), canShowSnippet && publicKey ? (_jsxs("div", { className: "flex flex-col gap-[6px] overflow-hidden rounded-[8px] border border-[var(--adaptive-black200)]", children: [_jsxs("button", { type: "button", onClick: () => setKeyInfoOpen((current) => !current), "aria-expanded": keyInfoOpen, className: "flex items-center justify-between gap-[8px] px-[10px] py-[8px] text-left text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]", children: [_jsx("span", { children: onboarding.keyInfoToggle }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 transition-transform ${keyInfoOpen ? "rotate-180" : ""}` })] }), keyInfoOpen ? (_jsxs("div", { className: "flex flex-col gap-[6px] px-[10px] pb-[10px]", children: [_jsx("p", { className: "text-[11px] font-semibold text-[var(--adaptive-black500)]", children: onboarding.reviewerSnippetHint }), _jsx("pre", { className: "max-h-[120px] overflow-auto whitespace-pre-wrap break-all rounded-[8px] bg-[var(--adaptive-black100)] p-[10px] text-[11px] leading-[1.5] text-[var(--adaptive-black800)]", children: buildReviewerSnippet({ name, authorId, publicKey }) })] })) : null] })) : null, _jsxs("div", { className: "flex items-center justify-end gap-[10px]", children: [canShowSnippet ? (_jsx("button", { type: "button", onClick: () => void handleCopySnippet(), className: "rounded-[8px] bg-[var(--adaptive-grey300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]", children: copied ? onboarding.copied : onboarding.copySnippet })) : null, _jsx("button", { type: "button", onClick: handleRefresh, className: "rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]", children: onboarding.refresh })] })] }));
}
//# sourceMappingURL=PanelKeyGate.js.map