type DiscreteScaleDialProps<T extends string> = {
    values: readonly T[];
    value: T;
    onChange: (value: T) => void;
    labels: Record<T, string>;
    ariaLabel: string;
};

export function DiscreteScaleDial<T extends string>({ values, value, onChange, labels, ariaLabel }: DiscreteScaleDialProps<T>) {
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className="grid gap-[4px]"
            style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
        >
            {values.map((scale) => {
                const active = scale === value;

                return (
                    <button
                        key={scale}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(scale)}
                        className={`rounded-[6px] px-[2px] py-[6px] text-center text-[10px] leading-[1.2] transition-colors ${
                            active
                                ? "bg-[var(--adaptive-blue500)] font-semibold text-white"
                                : "bg-[var(--adaptive-black100)] font-medium text-[var(--adaptive-black600)] ring-1 ring-[var(--adaptive-black200)] hover:bg-[var(--adaptive-black200)] hover:text-[var(--adaptive-black800)]"
                        }`}
                    >
                        {labels[scale]}
                    </button>
                );
            })}
        </div>
    );
}
