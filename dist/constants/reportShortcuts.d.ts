export declare const REPORT_SHORTCUTS: {
    readonly toggleReportMode: {
        readonly key: "m";
        readonly mod: true;
        readonly shift: true;
    };
    readonly toggleTargetPreview: {
        readonly key: "e";
        readonly mod: true;
        readonly shift: true;
    };
    readonly toggleViewMode: {
        readonly key: "l";
        readonly mod: true;
        readonly shift: true;
    };
    readonly cancel: {
        readonly key: "Escape";
    };
    readonly submit: {
        readonly key: "Enter";
        readonly mod: true;
    };
};
export type ReportShortcutAction = keyof typeof REPORT_SHORTCUTS;
//# sourceMappingURL=reportShortcuts.d.ts.map