import type { ShortcutBinding } from "../utils/shortcuts.js";
type ShortcutHintProps = {
    binding: ShortcutBinding;
    visible: boolean;
    palette: {
        chip: string;
        muted: string;
    };
};
export declare function ShortcutHint({ binding, visible, palette }: ShortcutHintProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ShortcutHint.d.ts.map