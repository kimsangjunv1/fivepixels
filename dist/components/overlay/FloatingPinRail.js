import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { CloseIcon, ChevronDownIcon, FavoritePinIcon } from "../../components/icons/Icons.js";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
function PinRailCard({ item, index, onOpen, onRemove, }) {
    const { messages } = useReportPreferences();
    const [pulsing, setPulsing] = useState(false);
    const handleOpen = () => {
        setPulsing(true);
        window.setTimeout(() => setPulsing(false), 180);
        onOpen(item);
    };
    return (_jsxs("div", { className: `fivepixels-pin-card-enter group relative flex flex-col gap-[4px] rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity800)] px-[10px] py-[8px] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[8px] ${pulsing ? "fivepixels-pin-card-pulse" : ""}`, style: { animationDelay: `${index * 35}ms` }, children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: handleOpen, "aria-label": messages.pins.openPinAriaLabel, className: "flex w-full flex-col gap-[4px] text-left", children: [_jsx("p", { className: "line-clamp-2 text-[12px] font-semibold leading-[1.35] text-[var(--adaptive-black900)]", children: item.summary }), _jsx("p", { className: "truncate text-[10px] text-[var(--adaptive-black500)]", children: item.pathname })] }), _jsx("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => onRemove(item.reportId), "aria-label": messages.pins.removePinAriaLabel, className: "absolute right-[4px] top-[4px] flex h-[20px] w-[20px] items-center justify-center rounded-[6px] text-[var(--adaptive-black400)] opacity-0 transition-opacity hover:bg-[var(--adaptive-tintOpacity200)] hover:text-[var(--adaptive-black900)] group-hover:opacity-100", children: _jsx(CloseIcon, { className: "h-[12px] w-[12px]" }) })] }));
}
export function FloatingPinRail() {
    const { messages, pinnedFeedbackItems, pinRailCollapsed, setPinRailCollapsed, unpinFeedback } = useReportPreferences();
    const { openPinnedFeedback } = useReportSession();
    const [entered, setEntered] = useState(false);
    const hasPins = pinnedFeedbackItems.length > 0;
    useEffect(() => {
        if (!hasPins) {
            setEntered(false);
            return;
        }
        const frame = window.requestAnimationFrame(() => setEntered(true));
        return () => window.cancelAnimationFrame(frame);
    }, [hasPins]);
    if (!hasPins) {
        return null;
    }
    const expanded = !pinRailCollapsed;
    const handleOpen = (item) => {
        void openPinnedFeedback(item.reportId, {
            caseId: item.caseId,
            pathname: item.pathname,
        });
    };
    return (_jsx("div", { className: `pointer-events-auto fixed right-[16px] top-[20%] z-[1000002] flex w-[220px] flex-col gap-[8px] ${entered ? "fivepixels-pin-rail-enter" : ""}`, children: _jsxs("div", { className: "fivepixels-pin-rail-shell overflow-hidden rounded-[14px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity700)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[12px]", "data-expanded": expanded ? "true" : "false", children: [_jsxs("button", { type: "button", "data-fivepixels-interactive": "", onClick: () => setPinRailCollapsed(!pinRailCollapsed), "aria-expanded": expanded, "aria-label": expanded ? messages.pins.railCollapseAriaLabel : messages.pins.railExpandAriaLabel, className: "flex w-full items-center justify-between gap-[8px] px-[12px] py-[10px] text-left", children: [_jsxs("span", { className: "flex min-w-0 items-center gap-[6px]", children: [_jsx(FavoritePinIcon, { filled: true, className: "h-[14px] w-[14px] shrink-0 text-[var(--adaptive-blue500)]" }), _jsx("span", { className: "truncate text-[12px] font-bold text-[var(--adaptive-black900)]", children: messages.pins.railTitle }), _jsx("span", { className: "rounded-[999px] bg-[var(--adaptive-black100)] px-[6px] py-[1px] text-[10px] font-semibold tabular-nums text-[var(--adaptive-black600)]", children: messages.pins.railCountLabel(pinnedFeedbackItems.length) })] }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black500)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${expanded ? "rotate-180" : ""}` })] }), _jsx("div", { className: "fivepixels-pin-rail-body", "data-expanded": expanded ? "true" : "false", children: _jsx("div", { className: "fivepixels-pin-rail-body-inner", children: _jsx("div", { className: "flex flex-col gap-[8px] px-[10px] pb-[10px]", children: [...pinnedFeedbackItems].reverse().map((item, index) => (_jsx(PinRailCard, { item: item, index: index, onOpen: handleOpen, onRemove: unpinFeedback }, item.reportId))) }) }) })] }) }));
}
//# sourceMappingURL=FloatingPinRail.js.map