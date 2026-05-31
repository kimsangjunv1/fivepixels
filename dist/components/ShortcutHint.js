import { jsx as _jsx } from "react/jsx-runtime";
import { formatShortcutLabel } from "../utils/shortcuts.js";
import { stitchablePartProps } from "./report/parts.js";
export function ShortcutHint({ binding, visible }) {
    if (!visible) {
        return null;
    }
    return _jsx("kbd", { ...stitchablePartProps("shortcut-hint"), children: formatShortcutLabel(binding) });
}
//# sourceMappingURL=ShortcutHint.js.map