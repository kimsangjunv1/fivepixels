import { useCallback, type KeyboardEvent } from "react";
import type { ReportAppearance } from "@/types/report.js";
import { CheckIcon } from "@/components/icons/Icons.js";
import { ThemePreviewSkeleton } from "./ThemePreviewSkeleton.js";

type AppearanceThemeOption = {
    value: ReportAppearance;
    label: string;
};

type AppearanceThemePickerProps = {
    options: readonly AppearanceThemeOption[];
    value: ReportAppearance;
    onChange: (value: ReportAppearance) => void;
    disabled?: boolean;
    ariaLabel?: string;
};

export function AppearanceThemePicker({ options, value, onChange, disabled = false, ariaLabel }: AppearanceThemePickerProps) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
            if (disabled) {
                return;
            }

            let nextIndex: number | null = null;

            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                nextIndex = (index + 1) % options.length;
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                nextIndex = (index - 1 + options.length) % options.length;
            }

            if (nextIndex === null) {
                return;
            }

            event.preventDefault();
            onChange(options[nextIndex]!.value);
        },
        [disabled, onChange, options],
    );

    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className="grid grid-cols-3 gap-[6px]"
        >
            {options.map((option, index) => {
                const active = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        className={`group relative flex flex-col items-center gap-[5px] rounded-[8px] p-[4px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            active
                                ? "ring-2 ring-[var(--adaptive-blue500)] ring-offset-1 ring-offset-[var(--adaptive-black50)]"
                                : "ring-1 ring-[var(--adaptive-black200)] hover:ring-[var(--adaptive-black300)]"
                        }`}
                    >
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[5px] bg-[var(--adaptive-black100)]">
                            <ThemePreviewSkeleton variant={option.value} />
                            {active ? (
                                <span className="absolute right-[3px] bottom-[3px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-white shadow-[0_1px_2px_rgba(15,23,42,0.2)]">
                                    <CheckIcon className="h-[9px] w-[9px]" />
                                </span>
                            ) : null}
                        </div>
                        <span
                            className={`w-full truncate text-center text-[10px] leading-[1.2] ${
                                active ? "font-semibold text-[var(--adaptive-blue500)]" : "font-medium text-[var(--adaptive-black600)] group-hover:text-[var(--adaptive-black800)]"
                            }`}
                        >
                            {option.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
