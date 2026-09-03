type OptionSwitchOption<T extends string> = {
    value: T;
    label: string;
};
type OptionSwitchProps<T extends string> = {
    options: readonly OptionSwitchOption<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    ariaLabel?: string;
};
export declare function OptionSwitch<T extends string>({ options, value, onChange, disabled, ariaLabel }: OptionSwitchProps<T>): import("react").JSX.Element;
export {};
//# sourceMappingURL=OptionSwitch.d.ts.map