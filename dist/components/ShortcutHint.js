import { jsx as _jsx } from "react/jsx-runtime";
import { formatShortcutLabel } from "../utils/shortcuts.js";
import { shortcutHint } from "./report/classes.js";
export function ShortcutHint({ binding, visible }) {
    if (!visible) {
        return null;
    }
    return _jsx("kbd", { className: shortcutHint, children: formatShortcutLabel(binding) });
}
//# sourceMappingURL=ShortcutHint.js.map