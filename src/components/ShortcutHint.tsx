import type { ShortcutBinding } from "@/utils/shortcuts.js";
import { formatShortcutLabel } from "@/utils/shortcuts.js";

type ShortcutHintProps = {
    binding: ShortcutBinding;
    visible: boolean;
};

export function ShortcutHint({ binding, visible }: ShortcutHintProps) {
    if (!visible) {
        return null;
    }

    return (
        <kbd className="ml-1 inline-flex items-center rounded border border-[var(--adaptive-hairlineBorder)] bg-[var(--adaptive-black100)] px-1 py-0.5 text-[10px] font-medium text-[var(--adaptive-black500)]">
            {formatShortcutLabel(binding)}
        </kbd>
    );
}
