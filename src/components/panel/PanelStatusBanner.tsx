import type { ReactNode } from "react";

export type PanelStatusBannerAction = {
    id: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    /** Highlight the currently active option (e.g. 표기 vs 숨기기). */
    active?: boolean;
    ariaLabel?: string;
    title?: string;
    children?: ReactNode;
};

type PanelStatusBannerProps = {
    message: string;
    actions: PanelStatusBannerAction[];
    leading?: ReactNode;
    trailing?: ReactNode;
    /** First banner in a stack keeps the panel's top radius. */
    roundedTop?: boolean;
};

function BannerDivider() {
    return <span className="shrink-0 text-[11px] text-white/50">|</span>;
}

/**
 * Shared panel notice bar: message on the left, action controls on the right.
 */
export function PanelStatusBanner({ message, actions, leading, trailing, roundedTop = false }: PanelStatusBannerProps) {
    return (
        <section
            className={`flex shrink-0 items-center gap-[8px] bg-[var(--adaptive-black900)] px-[10px] py-[6px] text-[var(--adaptive-black50)] ${roundedTop ? "rounded-t-[12px]" : ""}`}
            data-fivepixels-interactive=""
        >
            {leading}
            <p className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-[1.3] text-[var(--adaptive-black50)]">{message}</p>
            {actions.length > 0 ? (
                <>
                    <BannerDivider />
                    <div className="flex shrink-0 items-center gap-[6px]">
                        {actions.map((action, index) => (
                            <div
                                key={action.id}
                                className="flex items-center gap-[6px]"
                            >
                                {index > 0 ? <BannerDivider /> : null}
                                <button
                                    type="button"
                                    data-fivepixels-interactive=""
                                    aria-label={action.ariaLabel ?? action.label}
                                    title={action.title ?? action.label}
                                    disabled={action.disabled}
                                    aria-pressed={action.active}
                                    onClick={action.onClick}
                                    className={`inline-flex shrink-0 items-center justify-center rounded-[4px] text-[var(--adaptive-black50)] text-[11px] font-semibold transition-opacity enabled:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35 ${
                                        action.children ? "p-[2px]" : "px-[4px] py-[1px]"
                                    } ${action.active ? "bg-white/20 underline underline-offset-2" : "underline-offset-2 hover:underline"}`}
                                >
                                    {action.children ?? action.label}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : null}
            {trailing}
        </section>
    );
}
