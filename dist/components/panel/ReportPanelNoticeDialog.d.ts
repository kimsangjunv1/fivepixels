import type { ButtonHTMLAttributes, ReactNode } from "react";
export type ReportPanelNoticeActionVariant = "primary" | "muted" | "outline" | "choice";
export type ReportPanelNoticeAction = {
    id: string;
    label: string;
    onClick: () => void;
    variant?: ReportPanelNoticeActionVariant;
    disabled?: boolean;
    pressed?: boolean;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};
export type ReportPanelNoticeDialogProps = {
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    /** Optional middle choice chips (e.g. merge / replace). */
    choices?: ReportPanelNoticeAction[];
    /** Footer actions, right-aligned. */
    actions?: ReportPanelNoticeAction[];
    /**
     * Insert a vertical divider before the last N footer actions.
     * Import confirm uses 2 (cancel + primary after the divider).
     */
    footerDividerBeforeLast?: number;
    /**
     * When true, children render as full-width blocks between header and footer
     * (for comparison tables / conflict lists).
     */
    sectioned?: boolean;
    className?: string;
    role?: "dialog" | "alertdialog" | "alert" | "status";
};
export declare function ReportPanelNoticeActionButton({ action, className, }: {
    action: ReportPanelNoticeAction;
    className?: string;
}): import("react").JSX.Element;
/**
 * Shared panel notice / confirm shell — same visual language as import "확인 필요".
 * Status banners (PanelStatusBanner) intentionally stay separate.
 */
export declare function ReportPanelNoticeDialog({ title, description, children, choices, actions, footerDividerBeforeLast, sectioned, className, role, }: ReportPanelNoticeDialogProps): import("react").JSX.Element;
//# sourceMappingURL=ReportPanelNoticeDialog.d.ts.map