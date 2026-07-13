import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReport } from "../../providers/reportContext.js";
export function PanelProjectFooter() {
    const { projectId, environment, appVersion } = useReport();
    return (_jsxs("footer", { className: "mt-auto flex shrink-0 justify-center gap-[8px] border-t border-[var(--adaptive-black200)] bg-[var(--adaptive-black100)] text-[12px] uppercase text-[var(--adaptive-black500)]", children: [_jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)]", children: projectId }), _jsx("div", { className: "h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" }), _jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)]", children: appVersion ?? "-" }), _jsx("div", { className: "h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" }), _jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)]", children: environment ?? "-" })] }));
}
//# sourceMappingURL=PanelProjectFooter.js.map