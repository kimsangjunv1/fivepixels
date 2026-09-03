type ReportPersonalKeyDialogProps = {
    mode: "required" | "insert" | "rotate";
    onCancel: () => void;
    onComplete: (message: string) => void;
};
export declare function ReportPersonalKeyDialog({ mode, onCancel, onComplete }: ReportPersonalKeyDialogProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ReportPersonalKeyDialog.d.ts.map