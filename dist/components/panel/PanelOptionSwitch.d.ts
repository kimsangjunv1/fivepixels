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
export declare function PanelOptionSwitch<T extends string>({ options, value, onChange, disabled, ariaLabel, }: PanelOptionSwitchProps<T>): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanelOptionSwitch.d.ts.map