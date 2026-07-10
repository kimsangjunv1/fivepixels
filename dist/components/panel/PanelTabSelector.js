import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { getAvailableUserTabs, getPanelTabDefinition, } from "../../constants/panelTabRegistry.js";
import { isTabRecommendedForRole, moveVisibleTab } from "../../utils/panelTabPreference.js";
import { ChevronDownIcon } from "../../components/icons/Icons.js";
function buildDisplayTabs(availableTabs, selectedTabs) {
    const availableIds = new Set(availableTabs.map((tab) => tab.id));
    const orderedSelected = selectedTabs.filter((tabId) => availableIds.has(tabId)).map((tabId) => getPanelTabDefinition(tabId));
    const unselected = availableTabs.filter((tab) => !selectedTabs.includes(tab.id));
    return [...orderedSelected, ...unselected];
}
export function PanelTabSelector({ role, selectedTabs, context, messages, onChange }) {
    const availableTabs = getAvailableUserTabs(context);
    const panelMessages = messages.panel;
    const displayTabs = useMemo(() => buildDisplayTabs(availableTabs, selectedTabs), [availableTabs, selectedTabs]);
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
    return (_jsxs("section", { className: "flex flex-col gap-[6px]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-[600] text-[var(--adaptive-black500)]", children: panelMessages.tabsSectionLabel }), _jsx("p", { className: "mt-[2px] text-[11px] text-[var(--adaptive-black500)]", children: panelMessages.tabsOrderHint })] }), _jsx("div", { className: "overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]", role: "group", "aria-label": panelMessages.tabsSectionLabel, children: displayTabs.map((tab, index) => {
                    const checked = selectedTabs.includes(tab.id);
                    const recommended = isTabRecommendedForRole(role, tab.id);
                    const selectedIndex = selectedTabs.indexOf(tab.id);
                    const canMoveUp = checked && selectedIndex > 0;
                    const canMoveDown = checked && selectedIndex >= 0 && selectedIndex < selectedTabs.length - 1;
                    const isLast = index === displayTabs.length - 1;
                    return (_jsxs("div", { className: `flex items-center gap-[4px] px-[8px] py-[6px] hover:bg-[var(--adaptive-black100)] ${!isLast ? "border-b border-[var(--adaptive-black200)]" : ""}`, children: [_jsxs("label", { className: "flex min-w-0 flex-1 cursor-pointer items-center gap-[8px] py-[4px] pl-[4px]", children: [_jsx("input", { type: "checkbox", checked: checked, onChange: () => toggleTab(tab.id), className: "h-[14px] w-[14px] accent-[var(--adaptive-blue500)]" }), _jsx("span", { className: "min-w-0 flex-1 text-[12px] font-semibold text-[var(--adaptive-black800)]", children: panelMessages[tab.labelKey] }), recommended ? (_jsx("span", { className: "shrink-0 rounded-[4px] bg-[var(--adaptive-blue100)] px-[6px] py-[1px] text-[10px] font-bold text-[var(--adaptive-blue500)]", children: panelMessages.tabRecommendedBadge })) : null] }), checked ? (_jsxs("div", { className: "flex shrink-0 items-center gap-[2px]", children: [_jsx("button", { type: "button", disabled: !canMoveUp, "aria-label": panelMessages.tabMoveUpAriaLabel, onClick: () => moveTab(tab.id, "up"), className: "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black200)] disabled:cursor-not-allowed disabled:opacity-30", children: _jsx(ChevronDownIcon, { className: "h-[14px] w-[14px] rotate-180" }) }), _jsx("button", { type: "button", disabled: !canMoveDown, "aria-label": panelMessages.tabMoveDownAriaLabel, onClick: () => moveTab(tab.id, "down"), className: "flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black200)] disabled:cursor-not-allowed disabled:opacity-30", children: _jsx(ChevronDownIcon, { className: "h-[14px] w-[14px]" }) })] })) : (_jsx("div", { className: "w-[52px] shrink-0", "aria-hidden": "true" }))] }, tab.id));
                }) })] }));
}
//# sourceMappingURL=PanelTabSelector.js.map