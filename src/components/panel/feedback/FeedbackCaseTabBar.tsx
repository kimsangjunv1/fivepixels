import type { ReactNode } from "react";
import type { ReportCase } from "@/types/report.js";
import { useReport } from "@/providers/reportContext.js";

export const CASE_TAB_ACTIVE_CLASS = "bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)]";
export const CASE_TAB_INACTIVE_CLASS =
    "border-transparent bg-[var(--adaptive-surface-muted)]/60 text-[var(--adaptive-text-muted)] hover:bg-[var(--adaptive-surface-muted)] hover:text-[var(--adaptive-text-primary)]";

export const CASE_SELECTOR_ALL_TAB = "all" as const;
export type CaseSelectorTab = typeof CASE_SELECTOR_ALL_TAB | string;

type FeedbackCaseTabBarBaseProps = {
    cases: ReportCase[];
    onSelectCase: (caseId: string) => void;
    idPrefix?: string;
    invalidCaseIds?: string[];
};

type FeedbackCaseTabBarEditorProps = FeedbackCaseTabBarBaseProps & {
    variant: "editor";
    activeCaseId: string | null;
    onAddCase: () => void;
    onRemoveCase: (caseId: string) => void;
};

type FeedbackCaseTabBarSelectorProps = FeedbackCaseTabBarBaseProps & {
    variant: "selector";
    activeTab: CaseSelectorTab;
    onSelectAll: () => void;
    showResolvedStatus?: boolean;
    trailing?: ReactNode;
};

export type FeedbackCaseTabBarProps = FeedbackCaseTabBarEditorProps | FeedbackCaseTabBarSelectorProps;

export function CaseResolvedBadge({ resolvedLabel, openLabel, resolved }: { resolvedLabel: string; openLabel: string; resolved: boolean }) {
    if (!resolved) {
        return null;
    }

    return (
        <span
            className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-[var(--adaptive-green500)] text-[10px] font-bold leading-none text-white"
            aria-label={resolved ? resolvedLabel : openLabel}
        >
            ✓
        </span>
    );
}

export function FeedbackCaseTabBar(props: FeedbackCaseTabBarProps) {
    const { cases, onSelectCase, idPrefix = "fivepixels-case", invalidCaseIds = [] } = props;
    const { messages } = useReport();
    const isEditor = props.variant === "editor";
    const invalidCaseIdSet = new Set(invalidCaseIds);

    if (cases.length === 0) {
        return null;
    }

    const tabList = (
        <>
            {!isEditor ? (
                <div className={`flex shrink-0 items-stretch rounded-[8px] border border-b-0 ${props.activeTab === CASE_SELECTOR_ALL_TAB ? CASE_TAB_ACTIVE_CLASS : CASE_TAB_INACTIVE_CLASS}`}>
                    <button
                        type="button"
                        role="tab"
                        data-fivepixels-interactive=""
                        aria-selected={props.activeTab === CASE_SELECTOR_ALL_TAB}
                        aria-controls={`${idPrefix}-panel-all`}
                        id={`${idPrefix}-tab-all`}
                        onClick={props.onSelectAll}
                        aria-label={messages.cases.allTabAriaLabel}
                        className="inline-flex min-w-0 items-center px-[10px] py-[6px] text-[12px] font-semibold leading-none"
                    >
                        {messages.cases.allTabLabel}
                    </button>
                </div>
            ) : null}

            {cases.map((item, index) => {
                const isActive = isEditor ? item.id === props.activeCaseId : item.id === props.activeTab;
                const isInvalid = invalidCaseIdSet.has(item.id);
                const tabId = `${idPrefix}-tab-${item.id}`;
                const panelId = `${idPrefix}-panel-${item.id}`;

                return (
                    <div
                        key={item.id}
                        className={
                            `flex max-w-[180px] shrink-0 items-stretch rounded-[8px] ` +
                            (isInvalid
                                ? "fivepixels-validation-attention border border-rose-400 bg-rose-500/10 text-rose-500"
                                : isActive
                                  ? CASE_TAB_ACTIVE_CLASS
                                  : CASE_TAB_INACTIVE_CLASS)
                        }
                    >
                        <button
                            type="button"
                            role="tab"
                            data-fivepixels-interactive=""
                            aria-selected={isActive}
                            aria-controls={panelId}
                            aria-invalid={isInvalid || undefined}
                            id={tabId}
                            onClick={() => onSelectCase(item.id)}
                            aria-label={messages.composer.selectCaseTabAriaLabel(index + 1)}
                            className={` inline-flex min-w-0 flex-1 items-center gap-[4px] truncate px-[10px] py-[6px] text-left leading-none`}
                            title={messages.composer.caseTabLabel(index + 1)}
                        >
                            <span
                                className={`${
                                    isInvalid ? "text-rose-500" : isActive ? "text-[var(--adaptive-blue500)]" : "text-[var(--adaptive-black700)]"
                                } font-medium text-[12px] min-w-0 truncate`}
                            >
                                {messages.composer.caseTabLabel(index + 1)}
                            </span>
                            {!isEditor && props.showResolvedStatus !== false ? (
                                <CaseResolvedBadge
                                    resolved={item.status === "resolved"}
                                    resolvedLabel={messages.cases.resolved}
                                    openLabel={messages.cases.open}
                                />
                            ) : null}
                        </button>

                        {isEditor && cases.length > 1 ? (
                            <button
                                type="button"
                                data-fivepixels-interactive=""
                                onClick={() => props.onRemoveCase(item.id)}
                                aria-label={messages.composer.removeCaseAriaLabel(index + 1)}
                                className="inline-flex w-[22px] shrink-0 items-center justify-center rounded-tr-[8px] text-[14px] leading-none text-[var(--adaptive-text-muted)] hover:bg-[var(--adaptive-surface-muted)] hover:text-[var(--adaptive-text-primary)]"
                            >
                                ×
                            </button>
                        ) : null}
                    </div>
                );
            })}

            {isEditor ? (
                <button
                    type="button"
                    data-fivepixels-interactive=""
                    onClick={props.onAddCase}
                    aria-label={messages.composer.addCaseTabAriaLabel}
                    className="mb-[1px] inline-flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[8px] border border-dashed border-[var(--adaptive-border-subtle)] text-[16px] font-medium leading-none text-[var(--adaptive-blue500)] hover:bg-[var(--adaptive-blue100)]"
                >
                    +
                </button>
            ) : null}
        </>
    );

    if (isEditor) {
        return (
            <div
                className="flex min-h-0 shrink-0 items-end gap-[2px] overflow-x-auto border-b border-[var(--adaptive-border-subtle)] p-[4px]"
                role="tablist"
                aria-label={messages.cases.title}
            >
                {tabList}
            </div>
        );
    }

    return (
        <div className="mx-[4px] shrink-0 border-b border-[var(--adaptive-border-subtle)]">
            <div className="flex items-end gap-[4px]">
                <div
                    className="flex min-w-0 flex-1 items-end gap-[2px] overflow-x-auto p-[4px]"
                    role="tablist"
                    aria-label={messages.cases.title}
                >
                    {tabList}
                </div>
                {props.trailing ? <div className="shrink-0 self-center pr-[4px]">{props.trailing}</div> : null}
            </div>
        </div>
    );
}
