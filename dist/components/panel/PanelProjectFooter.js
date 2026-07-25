import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReportPreferences } from "../../providers/reportContext.js";
export function PanelProjectFooter() {
    const { projectId, environment, appVersion, persistenceStatus, messages } = useReportPreferences();
    const statusLabel = persistenceStatus.mode === "conflict" ? "conflict · localStorage" : persistenceStatus.mode;
    return (_jsxs("footer", { className: "mt-auto flex shrink-0 justify-center gap-[8px] border-t border-[var(--adaptive-black200)] bg-[var(--adaptive-black100)] text-[12px] uppercase text-[var(--adaptive-black500)] rounded-b-[12px_12px]", children: [_jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)] text-[12px]", children: projectId }), _jsx("div", { className: "h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" }), _jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)] text-[12px]", children: appVersion ?? "-" }), _jsx("div", { className: "h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" }), _jsx("p", { className: "py-[4px] font-[500] text-[var(--adaptive-black500)] text-[12px]", children: environment ?? "-" }), _jsx("div", { className: "h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" })] }));
}
//# sourceMappingURL=PanelProjectFooter.js.map