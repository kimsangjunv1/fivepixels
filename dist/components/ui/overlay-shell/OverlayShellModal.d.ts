import { type CSSProperties, type ReactNode } from "react";
export type OverlayShellModalProps = {
    open: boolean;
    onClose: () => void;
    ariaLabel: string;
    dataChrome?: string;
    role?: "dialog" | "alertdialog";
    zIndex?: number;
    backdropClassName?: string;
    backdropStyle?: CSSProperties;
    panelClassName?: string;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    children: ReactNode;
};
export declare function OverlayShellModal({ open, onClose, ariaLabel, dataChrome, role, zIndex, backdropClassName, backdropStyle, panelClassName, closeOnBackdrop, closeOnEscape, children, }: OverlayShellModalProps): import("react").JSX.Element | null;
//# sourceMappingURL=OverlayShellModal.d.ts.map