import { en } from "../i18n/en.js";
import { getDefaultFields } from "../i18n/index.js";
// Marker base dot size used for hitbox + positioning math.
// Updated from 14px to 20px to make the default marker size visibly larger.
export const DOT_SIZE = 20;
export const TARGET_SELECTOR = "[data-report-id]";
export const TARGET_COLOR = {
    group: "#0ed1b4",
    item: "#f6572d",
};
export const TARGET_SURFACE = {
    group: "#0ed1b41c",
    item: "#0ed1b41c",
};
export const FEEDBACK_HIGHLIGHT = {
    outline: "#8b5cf6",
    surface: "#8b5cf61c",
    label: "#8b5cf6",
};
export const DEFAULT_FIELDS = getDefaultFields(en);
//# sourceMappingURL=report.js.map