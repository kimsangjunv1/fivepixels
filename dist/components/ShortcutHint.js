import { jsx as _jsx } from "react/jsx-runtime";
import { formatShortcutLabel } from "../utils/shortcuts.js";
import { reportStyles } from "./report/styles.js";
export function ShortcutHint({ binding, visible, palette }) {
    if (!visible) {
        return null;
    }
    return (_jsx("kbd", { style: {
            ...reportStyles.shortcutHint,
            backgroundColor: palette.chip,
            color: palette.muted,
        }, children: formatShortcutLabel(binding) }));
}
//# sourceMappingURL=ShortcutHint.js.map