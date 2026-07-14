import { useMemo } from "react";
import type { PanelRole } from "@/constants/panelRole.js";
import {
    getExperimentalUserTabs,
    getPanelTabDefinition,
    getStableUserTabs,
    type PanelTabAvailabilityContext,
    type PanelTabDefinition,
    type UserSelectablePanelTab,
} from "@/constants/panelTabRegistry.js";
import { isTabRecommendedForRole, moveVisibleTab } from "@/utils/panel/panelTabPreference.js";
import type { ReportMessages } from "@/i18n/types.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";

type PanelTabSelectorProps = {
    role: PanelRole;
    selectedTabs: UserSelectablePanelTab[];
    context: PanelTabAvailabilityContext;
    messages: ReportMessages;
    onChange: (nextTabs: UserSelectablePanelTab[]) => void;
};

function buildOrderedSectionTabs(sectionTabs: PanelTabDefinition[], selectedTabs: UserSelectablePanelTab[]): PanelTabDefinition[] {
    const sectionIds = new Set(sectionTabs.map((tab) => tab.id));
    const orderedSelected = selectedTabs.filter((tabId) => sectionIds.has(tabId)).map((tabId) => getPanelTabDefinition(tabId));
    const unselected = sectionTabs.filter((tab) => !selectedTabs.includes(tab.id));

    return [...orderedSelected, ...unselected];
}

function TabRows({
    tabs,
    role,
    selectedTabs,
    messages,
    onToggle,
    onMove,
}: {
    tabs: PanelTabDefinition[];
    role: PanelRole;
    selectedTabs: UserSelectablePanelTab[];
    messages: ReportMessages;
    onToggle: (tabId: UserSelectablePanelTab) => void;
    onMove: (tabId: UserSelectablePanelTab, direction: "up" | "down") => void;
}) {
    const panelMessages = messages.panel;

    return (
        <div className="overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]">
            {tabs.map((tab, index) => {
                const checked = selectedTabs.includes(tab.id);
                const recommended = isTabRecommendedForRole(role, tab.id);
                const selectedIndex = selectedTabs.indexOf(tab.id);
                const canMoveUp = checked && selectedIndex > 0;
                const canMoveDown = checked && selectedIndex >= 0 && selectedIndex < selectedTabs.length - 1;
                const isLast = index === tabs.length - 1;

                return (
                    <div
                        key={tab.id}
                        className={`flex items-center gap-[4px] px-[8px] py-[6px] hover:bg-[var(--adaptive-black100)] ${!isLast ? "border-b border-[var(--adaptive-black200)]" : ""}`}
                    >
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-[8px] py-[4px] pl-[4px]">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(tab.id)}
                                className="h-[14px] w-[14px] accent-[var(--adaptive-blue500)]"
                            />
                            <span className="min-w-0 flex-1 text-[12px] font-semibold text-[var(--adaptive-black800)]">{panelMessages[tab.labelKey]}</span>
                            {recommended ? (
                                <span className="shrink-0 rounded-[4px] bg-[var(--adaptive-blue100)] px-[6px] py-[1px] text-[10px] font-bold text-[var(--adaptive-blue500)]">
                                    {panelMessages.tabRecommendedBadge}
                                </span>
                            ) : null}
                            {tab.experimental ? (
                                <span className="shrink-0 rounded-[4px] bg-[var(--adaptive-black200)] px-[6px] py-[1px] text-[10px] font-bold text-[var(--adaptive-black700)]">
                                    {panelMessages.tabLabBadge}
                                </span>
                            ) : null}
                        </label>

                        {checked ? (
                            <div className="flex shrink-0 items-center gap-[2px]">
                                <button
                                    type="button"
                                    disabled={!canMoveUp}
                                    aria-label={panelMessages.tabMoveUpAriaLabel}
                                    onClick={() => onMove(tab.id, "up")}
                                    className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black200)] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronDownIcon className="h-[14px] w-[14px] rotate-180" />
                                </button>
                                <button
                                    type="button"
                                    disabled={!canMoveDown}
                                    aria-label={panelMessages.tabMoveDownAriaLabel}
                                    onClick={() => onMove(tab.id, "down")}
                                    className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[var(--adaptive-black600)] hover:bg-[var(--adaptive-black200)] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronDownIcon className="h-[14px] w-[14px]" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="w-[52px] shrink-0"
                                aria-hidden="true"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function PanelTabSelector({ role, selectedTabs, context, messages, onChange }: PanelTabSelectorProps) {
    const panelMessages = messages.panel;
    const stableTabs = useMemo(() => buildOrderedSectionTabs(getStableUserTabs(context), selectedTabs), [context, selectedTabs]);
    const experimentalTabs = useMemo(() => buildOrderedSectionTabs(getExperimentalUserTabs(context), selectedTabs), [context, selectedTabs]);

    const toggleTab = (tabId: UserSelectablePanelTab) => {
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

    const moveTab = (tabId: UserSelectablePanelTab, direction: "up" | "down") => {
        onChange(moveVisibleTab(selectedTabs, tabId, direction));
    };

    return (
        <section className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[6px]">
                <div>
                    <p className="text-[11px] font-[600] text-[var(--adaptive-black500)]">{panelMessages.tabsSectionLabel}</p>
                    <p className="mt-[2px] text-[11px] text-[var(--adaptive-black500)]">{panelMessages.tabsOrderHint}</p>
                </div>
                <TabRows
                    tabs={stableTabs}
                    role={role}
                    selectedTabs={selectedTabs}
                    messages={messages}
                    onToggle={toggleTab}
                    onMove={moveTab}
                />
            </div>

            {experimentalTabs.length > 0 ? (
                <div className="flex flex-col gap-[6px]">
                    <p className="text-[11px] font-[600] text-[var(--adaptive-black500)]">{panelMessages.tabsExperimentalSectionLabel}</p>
                    <TabRows
                        tabs={experimentalTabs}
                        role={role}
                        selectedTabs={selectedTabs}
                        messages={messages}
                        onToggle={toggleTab}
                        onMove={moveTab}
                    />
                </div>
            ) : null}
        </section>
    );
}
