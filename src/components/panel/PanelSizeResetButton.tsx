import { HoverTooltip } from "@/components/ui/HoverTooltip.js";

type PanelSizeResetButtonProps = {
    collapsed: boolean;
    disabled?: boolean;
    label: string;
    onClick: () => void;
};

export function PanelSizeResetButton({ collapsed, disabled = false, label, onClick }: PanelSizeResetButtonProps) {
    if (collapsed) {
        return null;
    }

    return (
        <HoverTooltip label={label}>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={label}
                className="flex items-center justify-center px-[4px] py-[6px] text-[var(--adaptive-text-muted)] disabled:opacity-40"
            >
                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[var(--adaptive-border-subtle)] text-[10px] font-bold leading-none">
                    ↺
                </span>
            </button>
        </HoverTooltip>
    );
}
