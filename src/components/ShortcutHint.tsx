import type { ShortcutBinding } from "../utils/shortcuts.js";
import { formatShortcutLabel } from "../utils/shortcuts.js";

type ShortcutHintProps = {
    binding: ShortcutBinding;
    visible: boolean;
};

export function ShortcutHint({ binding, visible }: ShortcutHintProps) {
    if (!visible) {
        return null;
    }

    return (
        <kbd className="ml-1 inline-flex items-center rounded border border-[var(--st-border)] bg-[var(--st-bg-muted)] px-1 py-0.5 text-[10px] font-medium text-[var(--st-text-muted)]">
            {formatShortcutLabel(binding)}
        </kbd>
    );
}
