import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDownIcon } from "../../shared/components/icons/Icons.js";
import { getPanelTabDefinition } from "../../shared/constants/panelTabRegistry.js";
function PanelTabButton({ label, active, onClick }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: `flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[4px] hover:bg-[var(--adaptive-black200)] ${active ? "bg-[var(--adaptive-fillOpacity400)]" : ""}`, children: [_jsx("p", { className: `${active ? "text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black500)]"} font-[500] text-[14px]`, children: label }), _jsx(ChevronDownIcon, { className: `h-4 w-4 shrink-0 transition-transform ${active ? "rotate-180" : ""}` })] }));
}
/** Single visual entry point for panel tab buttons and their styles. */
export function PanelTabs({ tabs, activeTab, messages, onTabClick }) {
    return (_jsx("div", { className: "flex min-w-0 flex-1 overflow-hidden border-b-[0.1px] border-b-[var(--adaptive-border-subtle)]", children: tabs.map((tabId, index) => (_jsxs("div", { className: "contents", children: [index > 0 ? _jsx("div", { className: "h-full w-[1px] bg-[var(--adaptive-border-subtle)]" }) : null, _jsx(PanelTabButton, { label: messages.panel[getPanelTabDefinition(tabId).labelKey], active: activeTab === tabId, onClick: () => onTabClick(tabId) })] }, tabId))) }));
}
//# sourceMappingURL=PanelTabs.js.map