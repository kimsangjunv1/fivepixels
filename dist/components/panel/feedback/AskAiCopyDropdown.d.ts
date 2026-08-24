import { type ReactNode } from "react";
export type AskAiCopyMenuItem = {
    id: string;
    label: string;
    onSelect: () => void | Promise<void>;
    disabled?: boolean;
};
type AskAiCopyDropdownProps = {
    items: AskAiCopyMenuItem[];
    trigger: (state: {
        open: boolean;
        copied: boolean;
        toggle: () => void;
    }) => ReactNode;
    align?: "left" | "right";
    menuClassName?: string;
};
export declare function AskAiCopyDropdown({ items, trigger, align, menuClassName }: AskAiCopyDropdownProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AskAiCopyDropdown.d.ts.map