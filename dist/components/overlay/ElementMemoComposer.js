import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { STYLE_TOOLTIP_SURFACE_CLASS } from "../../components/ui/PointerFollowTooltip.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { MOTION } from "../../constants/motionClasses.js";
const COMPOSER_SURFACE_CLASS = `pointer-events-auto fixed z-[1000005] w-[min(280px,calc(100vw-16px))] ${STYLE_TOOLTIP_SURFACE_CLASS} ${MOTION.tooltipIn}`;
export function ElementMemoComposer() {
    const { messages } = useReportPreferences();
    const { memoComposer, elementMemos, closeMemoComposer, saveElementMemo, deleteElementMemo } = useReportSession();
    const [text, setText] = useState("");
    const textareaRef = useRef(null);
    useEffect(() => {
        if (!memoComposer) {
            setText("");
            return;
        }
        setText(elementMemos[memoComposer.elementKey]?.text ?? "");
    }, [elementMemos, memoComposer]);
    useEffect(() => {
        if (!memoComposer) {
            return;
        }
        const frameId = window.requestAnimationFrame(() => {
            textareaRef.current?.focus();
            textareaRef.current?.select();
        });
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeMemoComposer();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeMemoComposer, memoComposer]);
    if (!memoComposer) {
        return null;
    }
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const panelWidth = 280;
    const panelHeight = 180;
    const left = Math.min(memoComposer.clientX, Math.max(8, viewportWidth - panelWidth - 8));
    const top = Math.min(memoComposer.clientY, Math.max(8, viewportHeight - panelHeight - 8));
    const hasExistingMemo = Boolean(elementMemos[memoComposer.elementKey]?.text);
    return (_jsx("div", { "data-fivepixels-interactive": "", className: COMPOSER_SURFACE_CLASS, style: { left, top }, onClick: (event) => event.stopPropagation(), onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
        }, children: _jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsxs("div", { className: "flex flex-col gap-[2px]", children: [_jsx("p", { className: "text-[14px] font-semibold leading-[1.45] text-[var(--adaptive-black900)]", children: messages.pickTarget.memoComposerTitle }), _jsx("p", { className: "text-[14px] leading-[1.45] text-[var(--adaptive-black500)]", children: messages.pickTarget.memoComposerHint })] }), _jsx("textarea", { ref: textareaRef, "data-fivepixels-interactive": "", value: text, onChange: (event) => setText(event.target.value), placeholder: messages.pickTarget.memoComposerPlaceholder, rows: 4, className: "w-full resize-none rounded-[8px] border border-solid border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[14px] leading-[1.45] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)] focus:border-[var(--adaptive-border-subtle)]" }), _jsxs("div", { className: "flex items-center justify-end gap-[6px] border-t border-[var(--adaptive-border-subtle)] pt-[6px]", children: [hasExistingMemo ? (_jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => deleteElementMemo(memoComposer.elementKey), className: "mr-auto rounded-[8px] px-[8px] py-[4px] text-[14px] font-medium text-[var(--adaptive-accent-red)] hover:bg-[color-mix(in_srgb,var(--adaptive-accent-red)_10%,transparent)]", children: messages.pickTarget.memoComposerDelete })) : null, _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: closeMemoComposer, className: "rounded-[8px] px-[8px] py-[4px] text-[14px] font-medium text-[var(--adaptive-black500)] hover:bg-[var(--adaptive-black100)]", children: messages.common.cancel }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => saveElementMemo(memoComposer.elementKey, text), className: "rounded-[8px] bg-[var(--adaptive-black900)] px-[10px] py-[4px] text-[14px] font-semibold text-[var(--adaptive-black50)] hover:opacity-90 disabled:opacity-50", disabled: !text.trim(), children: messages.pickTarget.memoComposerSave })] })] }) }));
}
//# sourceMappingURL=ElementMemoComposer.js.map