import type { ReactNode } from "react";
import type { ReportCase } from "../../../types/report.js";
export declare const CASE_TAB_ACTIVE_CLASS = "bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)]";
export declare const CASE_TAB_INACTIVE_CLASS = "border-transparent bg-[var(--adaptive-surface-muted)]/60 text-[var(--adaptive-text-muted)] hover:bg-[var(--adaptive-surface-muted)] hover:text-[var(--adaptive-text-primary)]";
export declare const CASE_SELECTOR_ALL_TAB: "all";
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
export declare function CaseResolvedBadge({ resolvedLabel, openLabel, resolved }: {
    resolvedLabel: string;
    openLabel: string;
    resolved: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function FeedbackCaseTabBar(props: FeedbackCaseTabBarProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=FeedbackCaseTabBar.d.ts.map