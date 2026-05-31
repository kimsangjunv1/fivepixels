import type { ShortcutBinding } from "../utils/shortcuts.js";
import { formatShortcutLabel } from "../utils/shortcuts.js";
import { stitchablePartProps } from "./report/parts.js";

type ShortcutHintProps = {
    binding: ShortcutBinding;
    visible: boolean;
};

export function ShortcutHint({ binding, visible }: ShortcutHintProps) {
    if (!visible) {
        return null;
    }

    return <kbd {...stitchablePartProps("shortcut-hint")}>{formatShortcutLabel(binding)}</kbd>;
}
