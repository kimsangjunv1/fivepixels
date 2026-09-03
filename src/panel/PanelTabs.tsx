import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { getPanelTabDefinition, type UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";
import type { ReportMessages } from "@/i18n/types.js";
import type { ReportPanelTab } from "@/types/report-ui.js";

type PanelTabButtonProps = {
    label: string;
    active: boolean;
    onClick: () => void;
};

function PanelTabButton({ label, active, onClick }: PanelTabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-[6px] px-[10px] py-[4px] hover:bg-[var(--adaptive-black200)] ${active ? "bg-[var(--adaptive-fillOpacity400)]" : ""}`}
        >
            <p className={`${active ? "text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black500)]"} font-[500] text-[14px]`}>{label}</p>
            <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${active ? "rotate-180" : ""}`} />
        </button>
    );
}

type PanelTabsProps = {
    tabs: UserSelectablePanelTab[];
    activeTab: ReportPanelTab | null;
    messages: ReportMessages;
    onTabClick: (tab: UserSelectablePanelTab) => void;
};

/** Single visual entry point for panel tab buttons and their styles. */
export function PanelTabs({ tabs, activeTab, messages, onTabClick }: PanelTabsProps) {
    return (
        <div className="flex min-w-0 flex-1 overflow-hidden border-b-[0.1px] border-b-[var(--adaptive-border-subtle)]">
            {tabs.map((tabId, index) => (
                <div
                    key={tabId}
                    className="contents"
                >
                    {index > 0 ? <div className="h-full w-[1px] bg-[var(--adaptive-border-subtle)]" /> : null}
                    <PanelTabButton
                        label={messages.panel[getPanelTabDefinition(tabId).labelKey]}
                        active={activeTab === tabId}
                        onClick={() => onTabClick(tabId)}
                    />
                </div>
            ))}
        </div>
    );
}
