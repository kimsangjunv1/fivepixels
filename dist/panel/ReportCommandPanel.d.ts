export type CommandExecuteResult = {
    status: "success";
    message: string;
} | {
    status: "pending";
};
type ReportCommandPanelProps = {
    onExecute: (raw: string) => Promise<CommandExecuteResult>;
    onClose: () => void;
    notice?: {
        message: string;
        isError: boolean;
    } | null;
    onNoticeClear?: () => void;
};
export declare function ReportCommandPanel({ onExecute, onClose, notice, onNoticeClear }: ReportCommandPanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ReportCommandPanel.d.ts.map