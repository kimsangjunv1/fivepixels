type DiscreteScaleDialProps<T extends string> = {
    values: readonly T[];
    value: T;
    onChange: (value: T) => void;
    labels: Record<T, string>;
    ariaLabel: string;
};

export function DiscreteScaleDial<T extends string>({ values, value, onChange, labels, ariaLabel }: DiscreteScaleDialProps<T>) {
    const index = Math.max(0, values.indexOf(value));

    return (
        <div className="flex flex-col gap-[6px]">
            <input
                type="range"
                min={0}
                max={values.length - 1}
                step={1}
                value={index}
                aria-label={ariaLabel}
                onChange={(event) => {
                    const next = values[Number(event.target.value)];

                    if (next) {
                        onChange(next);
                    }
                }}
                className="h-[4px] w-full cursor-pointer appearance-none rounded-full bg-[var(--adaptive-black200)] accent-[var(--adaptive-blue500)]"
            />
            <div
                className="grid gap-[4px]"
                style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
            >
                {values.map((scale) => {
                    const active = scale === value;

                    return (
                        <span
                            key={scale}
                            className={`text-center text-[10px] leading-[1.2] ${
                                active ? "font-semibold text-[var(--adaptive-blue500)]" : "font-medium text-[var(--adaptive-black500)]"
                            }`}
                        >
                            {labels[scale]}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
