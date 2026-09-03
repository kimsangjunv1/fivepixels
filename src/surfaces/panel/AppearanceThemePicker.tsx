import { useCallback, type KeyboardEvent } from "react";
import type { ReportAppearance } from "@/shared/types/report.js";
import { ThemePreviewSkeleton, type ThemePreviewKind } from "./ThemePreviewSkeleton.js";

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
    previewKind?: ThemePreviewKind;
};

export function AppearanceThemePicker({
    options,
    value,
    onChange,
    disabled = false,
    ariaLabel,
    previewKind = "panel",
}: AppearanceThemePickerProps) {
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
            className="grid grid-cols-3 gap-[8px]"
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
                        className="group flex flex-col items-center gap-[6px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <div
                            className={`aspect-[5/4] w-full overflow-hidden rounded-[12px] transition-[box-shadow] ${
                                active
                                    ? "shadow-[0_0_0_1.5px_#111113]"
                                    : "shadow-[0_0_0_1px_transparent] group-hover:shadow-[0_0_0_1px_var(--adaptive-black300)]"
                            }`}
                        >
                            <ThemePreviewSkeleton
                                variant={option.value}
                                kind={previewKind}
                            />
                        </div>
                        <span
                            className={`w-full truncate text-center text-[11px] leading-[1.2] ${
                                active
                                    ? "font-semibold text-[var(--adaptive-black900)]"
                                    : "font-medium text-[var(--adaptive-black600)] group-hover:text-[var(--adaptive-black800)]"
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
