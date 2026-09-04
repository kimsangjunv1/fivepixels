import type { ButtonHTMLAttributes, ReactNode } from "react";
export type NoticeActionVariant = "primary" | "muted" | "outline" | "choice";
export type NoticeAction = {
    id: string;
    label: string;
    onClick: () => void;
    variant?: NoticeActionVariant;
    disabled?: boolean;
    pressed?: boolean;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};
export type NoticeDialogProps = {
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    /** Optional middle choice chips (e.g. merge / replace). */
    choices?: NoticeAction[];
    /** Footer actions, right-aligned. */
    actions?: NoticeAction[];
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
export declare function NoticeActionButton({ action, className }: {
    action: NoticeAction;
    className?: string;
}): import("react").JSX.Element;
/**
 * Shared panel notice / confirm shell — same visual language as import "확인 필요".
 * Settings/import dialogs stay separate from the floating notification stack.
 */
export declare function NoticeDialog({ title, description, children, choices, actions, footerDividerBeforeLast, sectioned, className, role }: NoticeDialogProps): import("react").JSX.Element;
//# sourceMappingURL=NoticeDialog.d.ts.map