import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, EditIcon } from "../../shared/components/icons/Icons.js";
import { readMinimizedWindowAlias, writeMinimizedWindowAlias } from "../../shared/utils/marker/minimizedWindowAlias.js";
function MinimizedCaseMarquee({ caseTexts }) {
    if (caseTexts.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "min-w-0 flex-1 overflow-hidden text-[12px] text-[var(--adaptive-black700)]", children: _jsx("div", { "aria-hidden": true, className: "fivepixels-marker-window-marquee", style: { animationDuration: `${Math.max(12, caseTexts.length * 6)}s` }, children: [0, 1].map((copyIndex) => (_jsx("div", { className: "fivepixels-marker-window-marquee__copy", children: caseTexts.map((text, index) => (_jsxs("span", { className: "whitespace-nowrap", children: [_jsxs("span", { className: "mr-[4px] text-[var(--adaptive-black500)]", children: [index + 1, "."] }), text] }, `${copyIndex}-${index}`))) }, copyIndex))) }) }));
}
export function MinimizedWindowAliasRow({ projectId, reportId, caseTexts, messages, onRestore, restoreDisabled = false, }) {
    const [alias, setAlias] = useState(() => readMinimizedWindowAlias(projectId, reportId));
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(alias);
    const inputRef = useRef(null);
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
        return (_jsxs("div", { className: "flex min-w-0 items-center gap-[4px]", onPointerDown: (event) => event.stopPropagation(), onClick: (event) => event.stopPropagation(), children: [_jsx("input", { ref: inputRef, type: "text", value: draft, maxLength: 40, placeholder: messages.marker.minimizedAliasPlaceholder, "aria-label": messages.marker.minimizedAliasInputAriaLabel, "data-fivepixels-interactive": "", onChange: (event) => setDraft(event.target.value), onKeyDown: (event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            commitAlias();
                        }
                        if (event.key === "Escape") {
                            event.preventDefault();
                            setDraft(alias);
                            setIsEditing(false);
                        }
                    }, onBlur: commitAlias, className: "min-w-0 flex-1 rounded-[4px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[12px] font-semibold text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]" }), alias ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.marker.minimizedAliasClearAriaLabel, title: messages.marker.minimizedAliasClearAriaLabel, onMouseDown: (event) => event.preventDefault(), onClick: clearAlias, className: "inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })) : null] }));
    }
    return (_jsxs("div", { className: "flex min-w-0 items-center gap-[4px]", children: [_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: onRestore, disabled: restoreDisabled, "aria-label": messages.marker.windowRestoreAriaLabel, className: "flex min-w-0 flex-1 items-center overflow-hidden text-left", children: alias ? (_jsx("p", { className: "min-w-0 flex-1 truncate text-[12px] font-semibold leading-[1.3] text-[var(--adaptive-black900)]", title: alias, children: alias })) : (_jsx(MinimizedCaseMarquee, { caseTexts: caseTexts })) }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", "aria-label": messages.marker.minimizedAliasEditAriaLabel, title: messages.marker.minimizedAliasEditAriaLabel, onPointerDown: (event) => event.stopPropagation(), onClick: (event) => {
                    event.stopPropagation();
                    setDraft(alias);
                    setIsEditing(true);
                }, className: "inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)]", children: _jsx(EditIcon, { className: "h-[12px] w-[12px]" }) })] }));
}
//# sourceMappingURL=MinimizedWindowAliasRow.js.map