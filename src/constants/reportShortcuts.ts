import type { ShortcutBinding } from "../utils/shortcuts.js";

export const REPORT_SHORTCUTS = {
    toggleReportMode: { key: "m", mod: true, shift: true },
    toggleTargetPreview: { key: "e", mod: true, shift: true },
    toggleViewMode: { key: "l", mod: true, shift: true },
    cancel: { key: "Escape" },
    submit: { key: "Enter", mod: true },
} as const satisfies Record<string, ShortcutBinding>;

export type ReportShortcutAction = keyof typeof REPORT_SHORTCUTS;
