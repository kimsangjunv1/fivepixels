import { jsx as _jsx } from "react/jsx-runtime";
import { formatShortcutLabel } from "../utils/shortcuts.js";
export function ShortcutHint({ binding, visible }) {
    if (!visible) {
        return null;
    }
    return (_jsx("kbd", { className: "ml-1 inline-flex items-center rounded border border-[var(--adaptive-hairlineBorder)] bg-[var(--adaptive-grey100)] px-1 py-0.5 text-[10px] font-medium text-[var(--adaptive-grey500)]", children: formatShortcutLabel(binding) }));
}
//# sourceMappingURL=ShortcutHint.js.map