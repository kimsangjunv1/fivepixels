import type { ButtonHTMLAttributes, ReactNode } from "react";
import { MOTION } from "@/shared/constants/motionClasses.js";

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

function choiceClassName(pressed: boolean) {
    return pressed ? "border-[var(--adaptive-blue500)] bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue500)]" : "border-[var(--adaptive-grey300)] bg-transparent text-[var(--adaptive-black700)]";
}

function actionClassName(variant: NoticeActionVariant = "primary") {
    switch (variant) {
        case "outline":
            return "border border-[var(--adaptive-grey300)] bg-transparent font-semibold text-[var(--adaptive-black700)]";
        case "muted":
            return "border border-transparent bg-[var(--adaptive-grey300)] font-semibold text-[var(--adaptive-black700)]";
        case "choice":
            return "border border-[var(--adaptive-grey300)] bg-transparent font-semibold text-[var(--adaptive-black700)]";
        case "primary":
        default:
            return "border border-transparent bg-[var(--adaptive-blue100)] font-bold text-[var(--adaptive-blue500)]";
    }
}

export function NoticeActionButton({ action, className = "" }: { action: NoticeAction; className?: string }) {
    const variant = action.variant ?? "primary";
    const pressed = Boolean(action.pressed);

    return (
        <button
            type={action.type ?? "button"}
            onClick={action.onClick}
            disabled={action.disabled}
            aria-pressed={variant === "choice" ? pressed : undefined}
            className={`rounded-[8px] p-[4px_8px] text-[12px] disabled:cursor-not-allowed disabled:opacity-50 ${
                variant === "choice" ? `font-semibold ${choiceClassName(pressed)}` : actionClassName(variant)
            } ${className}`}
        >
            {action.label}
        </button>
    );
}

function NoticeFooter({ actions, footerDividerBeforeLast, className = "" }: { actions: NoticeAction[]; footerDividerBeforeLast: number; className?: string }) {
    const dividerIndex = footerDividerBeforeLast > 0 && actions.length > footerDividerBeforeLast ? actions.length - footerDividerBeforeLast : -1;

    return (
        <div className={`flex items-center justify-end gap-[10px] ${className}`}>
            {actions.map((action, index) => (
                <div
                    key={action.id}
                    className="flex items-center gap-[10px]"
                >
                    {index === dividerIndex ? <div className="h-[16px] w-[1px] bg-[var(--adaptive-black400)]" /> : null}
                    <NoticeActionButton action={action} />
                </div>
            ))}
        </div>
    );
}

/**
 * Shared panel notice / confirm shell — same visual language as import "확인 필요".
 * Settings/import dialogs stay separate from the floating notification stack.
 */
export function NoticeDialog({
    title,
    description,
    children,
    choices,
    actions,
    footerDividerBeforeLast = 0,
    sectioned = false,
    className = "",
    role = "dialog",
}: NoticeDialogProps) {
    const footerActions = actions ?? [];
    const hasChoices = Boolean(choices && choices.length > 0);
    const hasFooter = footerActions.length > 0;

    const header = (
        <>
            <p className="text-[14px] font-bold text-[var(--adaptive-black900)]">{title}</p>
            {description ? <div className="mt-[8px] leading-[1.4] whitespace-break-spaces text-[var(--adaptive-black700)]">{description}</div> : null}
            {hasChoices ? (
                <div className="mt-[12px] flex flex-wrap gap-[8px]">
                    {choices!.map((choice) => (
                        <NoticeActionButton
                            key={choice.id}
                            action={{ ...choice, variant: "choice" }}
                        />
                    ))}
                </div>
            ) : null}
        </>
    );

    if (sectioned) {
        return (
            <section
                role={role}
                className={`bg-[var(--adaptive-black50)] ${MOTION.dialogIn} ${className}`}
                data-fivepixels-interactive=""
            >
                <div className="p-[16px]">{header}</div>
                {children}
                {hasFooter ? (
                    <NoticeFooter
                        actions={footerActions}
                        footerDividerBeforeLast={footerDividerBeforeLast}
                        className="p-[16px]"
                    />
                ) : null}
            </section>
        );
    }

    return (
        <section
            role={role}
            className={`bg-[var(--adaptive-black50)] ${MOTION.dialogIn} ${className}`}
            data-fivepixels-interactive=""
        >
            <div className="p-[16px]">
                {header}
                {children ? <div className={hasChoices || description ? "mt-[12px]" : "mt-[8px]"}>{children}</div> : null}
                {hasFooter ? (
                    <NoticeFooter
                        actions={footerActions}
                        footerDividerBeforeLast={footerDividerBeforeLast}
                        className="mt-[14px]"
                    />
                ) : null}
            </div>
        </section>
    );
}
