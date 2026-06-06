import type { ReportAppearance } from "../types/report.js";

export const APPEARANCE_OPTIONS: ReadonlyArray<{ value: ReportAppearance; label: string }> = [
    { value: "system", label: "system" },
    { value: "light", label: "light" },
    { value: "dark", label: "dark" },
];
