import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { MOTION } from "../../constants/motionClasses.js";
function choiceClassName(pressed) {
    return pressed ? "border-[var(--adaptive-blue500)] bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)]" : "border-[var(--adaptive-grey300)] bg-transparent text-[var(--adaptive-black700)]";
}
function actionClassName(variant = "primary") {
    switch (variant) {
        case "outline":
            return "border border-[var(--adaptive-grey300)] bg-transparent font-semibold text-[var(--adaptive-black700)]";
        case "muted":
            return "border border-transparent bg-[var(--adaptive-grey300)] font-semibold text-[var(--adaptive-black700)]";
        case "choice":
            return "border border-[var(--adaptive-grey300)] bg-transparent font-semibold text-[var(--adaptive-black700)]";
        case "primary":
        default:
            return "border border-transparent bg-[var(--adaptive-blue100)] font-bold text-[var(--adaptive-blue500)]";
    }
}
export function NoticeActionButton({ action, className = "" }) {
    const variant = action.variant ?? "primary";
    const pressed = Boolean(action.pressed);
    return (_jsx("button", { type: action.type ?? "button", onClick: action.onClick, disabled: action.disabled, "aria-pressed": variant === "choice" ? pressed : undefined, className: `rounded-[8px] p-[4px_8px] text-[12px] disabled:cursor-not-allowed disabled:opacity-50 ${variant === "choice" ? `font-semibold ${choiceClassName(pressed)}` : actionClassName(variant)} ${className}`, children: action.label }));
}
function NoticeFooter({ actions, footerDividerBeforeLast, className = "" }) {
    const dividerIndex = footerDividerBeforeLast > 0 && actions.length > footerDividerBeforeLast ? actions.length - footerDividerBeforeLast : -1;
    return (_jsx("div", { className: `flex items-center justify-end gap-[10px] ${className}`, children: actions.map((action, index) => (_jsxs("div", { className: "flex items-center gap-[10px]", children: [index === dividerIndex ? _jsx("div", { className: "h-[16px] w-[1px] bg-[var(--adaptive-black400)]" }) : null, _jsx(NoticeActionButton, { action: action })] }, action.id))) }));
}
/**
 * Shared panel notice / confirm shell — same visual language as import "확인 필요".
 * Status banners (PanelStatusBanner) intentionally stay separate.
 */
export function NoticeDialog({ title, description, children, choices, actions, footerDividerBeforeLast = 0, sectioned = false, className = "", role = "dialog", }) {
    const footerActions = actions ?? [];
    const hasChoices = Boolean(choices && choices.length > 0);
    const hasFooter = footerActions.length > 0;
    const header = (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-[14px] font-bold text-[var(--adaptive-black900)]", children: title }), description ? _jsx("div", { className: "mt-[8px] leading-[1.4] whitespace-break-spaces text-[var(--adaptive-black700)]", children: description }) : null, hasChoices ? (_jsx("div", { className: "mt-[12px] flex flex-wrap gap-[8px]", children: choices.map((choice) => (_jsx(NoticeActionButton, { action: { ...choice, variant: "choice" } }, choice.id))) })) : null] }));
    if (sectioned) {
        return (_jsxs("section", { role: role, className: `bg-[var(--adaptive-black50)] ${MOTION.dialogIn} ${className}`, "data-fivepixels-interactive": "", children: [_jsx("div", { className: "p-[16px]", children: header }), children, hasFooter ? (_jsx(NoticeFooter, { actions: footerActions, footerDividerBeforeLast: footerDividerBeforeLast, className: "p-[16px]" })) : null] }));
    }
    return (_jsx("section", { role: role, className: `bg-[var(--adaptive-black50)] ${MOTION.dialogIn} ${className}`, "data-fivepixels-interactive": "", children: _jsxs("div", { className: "p-[16px]", children: [header, children ? _jsx("div", { className: hasChoices || description ? "mt-[12px]" : "mt-[8px]", children: children }) : null, hasFooter ? (_jsx(NoticeFooter, { actions: footerActions, footerDividerBeforeLast: footerDividerBeforeLast, className: "mt-[14px]" })) : null] }) }));
}
//# sourceMappingURL=NoticeDialog.js.map