import type { ShortcutBinding } from "../utils/shortcuts.js";
import { formatShortcutLabel } from "../utils/shortcuts.js";
import { reportStyles } from "./report/styles.js";

type ShortcutHintProps = {
    binding: ShortcutBinding;
    visible: boolean;
    palette: {
        chip: string;
        muted: string;
    };
};

export function ShortcutHint({ binding, visible, palette }: ShortcutHintProps) {
    if (!visible) {
        return null;
    }

    return (
        <kbd
            style={{
                ...reportStyles.shortcutHint,
                backgroundColor: palette.chip,
                color: palette.muted,
            }}
        >
            {formatShortcutLabel(binding)}
        </kbd>
    );
}
