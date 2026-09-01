type PanelOptionSwitchOption<T extends string> = {
    value: T;
    label: string;
};

type PanelOptionSwitchProps<T extends string> = {
    options: readonly PanelOptionSwitchOption<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    ariaLabel?: string;
};

export function PanelOptionSwitch<T extends string>({ options, value, onChange, disabled = false, ariaLabel }: PanelOptionSwitchProps<T>) {
    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className="flex w-full overflow-hidden rounded-[10px] border border-[var(--adaptive-border-subtle)] p-[2px]"
        >
            {options.map((option) => {
                const active = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={`min-w-0 flex-1 rounded-[8px] p-[4px] text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            active ? "bg-[var(--adaptive-border-subtle)] shadow-[var(--adaptive-popup-shadow)]" : "text-[var(--adaptive-black300)] hover:text-[var(--adaptive-black800)]"
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
