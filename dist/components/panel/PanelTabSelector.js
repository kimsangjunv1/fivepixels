import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { getExperimentalUserTabs, getPanelTabDefinition, getStableUserTabs, } from "../../constants/panelTabRegistry.js";
import { isTabRecommendedForRole, moveVisibleTab } from "../../utils/panel/panelTabPreference.js";
import { ChevronDownIcon } from "../../components/icons/Icons.js";
function buildOrderedSectionTabs(sectionTabs, selectedTabs) {
    const sectionIds = new Set(sectionTabs.map((tab) => tab.id));
    const orderedSelected = selectedTabs.filter((tabId) => sectionIds.has(tabId)).map((tabId) => getPanelTabDefinition(tabId));
    const unselected = sectionTabs.filter((tab) => !selectedTabs.includes(tab.id));
    return [...orderedSelected, ...unselected];
}
function TabRows({ tabs, role, selectedTabs, messages, onToggle, onMove, }) {
    const panelMessages = messages.panel;
    return (_jsx("div", { className: "overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]", children: tabs.map((tab, index) => {
            const checked = selectedTabs.includes(tab.id);
            const recommended = isTabRecommendedForRole(role, tab.id);
            const selectedIndex = selectedTabs.indexOf(tab.id);
            const canMoveUp = checked && selectedIndex > 0;
            const canMoveDown = checked && selectedIndex >= 0 && selectedIndex < selectedTabs.length - 1;
            const isLast = index === tabs.length - 1;
            return (_jsxs("div", { className: `flex items-center gap-[4px] px-[8px] py-[6px] hover:bg-[var(--adaptive-black100)] ${!isLast ? "border-b border-[var(--adaptive-black200)]" : ""}`, children: [_jsxs("label", { className: "flex min-w-0 flex-1 cursor-pointer items-center gap-[8px] py-[4px] pl-[4px]", children: [_jsx("input", { type: "checkbox", checked: checked, onChange: () => onToggle(tab.id), className: "h-[14px] w-[14px] accent-[var(--adaptive-blue500)]" }), _jsx("span", { className: "min-w-0 flex-1 text-[12px] font-semibold text-[var(--adaptive-black800)]", children: panelMessages[tab.labelKey] }), recommended ? (_jsx("span", { className: "shrink-0 rounded-[4px] bg-[var(--adaptive-blue100)] px-[6px] py-[1px] text-[10px] font-bold text-[var(--adaptive-blue500)]", children: panelMessages.tabRecommendedBadge })) : null, tab.experimental ? (_jsx("span", { className: "shrink-0 rounded-[4px] bg-[var(--adaptive-black200)] px-[6px] py-[1px] text-[10px] font-bold text-[var(--adaptive-black700)]", children: panelMessages.tabLabBadge })) : null] }), checked ? (_jsxs("div", { className: "flex shrink-0 items-center gap-[2px]", children: [_jsx("button", { type: "button", disabled: !canMoveUp, "aria-label": panelMessages.tabMoveUpAriaLabel, onClick: () => onMove(tab.id, "up"), className: "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black200)] disabled:cursor-not-allowed disabled:opacity-30", children: _jsx(ChevronDownIcon, { className: "h-[14px] w-[14px] rotate-180" }) }), _jsx("button", { type: "button", disabled: !canMoveDown, "aria-label": panelMessages.tabMoveDownAriaLabel, onClick: () => onMove(tab.id, "down"), className: "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black200)] disabled:cursor-not-allowed disabled:opacity-30", children: _jsx(ChevronDownIcon, { className: "h-[14px] w-[14px]" }) })] })) : (_jsx("div", { className: "w-[52px] shrink-0", "aria-hidden": "true" }))] }, tab.id));
        }) }));
}
export function PanelTabSelector({ role, selectedTabs, context, messages, onChange }) {
    const panelMessages = messages.panel;
    const stableTabs = useMemo(() => buildOrderedSectionTabs(getStableUserTabs(context), selectedTabs), [context, selectedTabs]);
    const experimentalTabs = useMemo(() => buildOrderedSectionTabs(getExperimentalUserTabs(context), selectedTabs), [context, selectedTabs]);
    const toggleTab = (tabId) => {
        const isSelected = selectedTabs.includes(tabId);
        if (isSelected) {
            if (selectedTabs.length <= 1) {
                return;
            }
            onChange(selectedTabs.filter((id) => id !== tabId));
            return;
        }
        onChange([...selectedTabs, tabId]);
    };
    const moveTab = (tabId, direction) => {
        onChange(moveVisibleTab(selectedTabs, tabId, direction));
    };
    return (_jsxs("section", { className: "flex flex-col gap-[12px]", children: [_jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-[600] text-[var(--adaptive-black500)]", children: panelMessages.tabsSectionLabel }), _jsx("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black500)]", children: panelMessages.tabsOrderHint })] }), _jsx(TabRows, { tabs: stableTabs, role: role, selectedTabs: selectedTabs, messages: messages, onToggle: toggleTab, onMove: moveTab })] }), experimentalTabs.length > 0 ? (_jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsx("p", { className: "text-[11px] font-[600] text-[var(--adaptive-black500)]", children: panelMessages.tabsExperimentalSectionLabel }), _jsx(TabRows, { tabs: experimentalTabs, role: role, selectedTabs: selectedTabs, messages: messages, onToggle: toggleTab, onMove: moveTab })] })) : null] }));
}
//# sourceMappingURL=PanelTabSelector.js.map