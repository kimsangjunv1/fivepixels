type DiscreteScaleDialProps<T extends string> = {
    values: readonly T[];
    value: T;
    onChange: (value: T) => void;
    labels: Record<T, string>;
    ariaLabel: string;
};
export declare function DiscreteScaleDial<T extends string>({ values, value, onChange, labels, ariaLabel }: DiscreteScaleDialProps<T>): import("react").JSX.Element;
export {};
//# sourceMappingURL=DiscreteScaleDial.d.ts.map