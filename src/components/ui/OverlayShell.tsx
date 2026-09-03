import type { ReactNode } from "react";
import { FloatingWindow, type FloatingWindowProps } from "@/window/FloatingWindow.js";
import { OverlayShellAnchored, type OverlayShellAnchoredProps } from "@/components/ui/overlay-shell/OverlayShellAnchored.js";
import { OverlayShellModal, type OverlayShellModalProps } from "@/components/ui/overlay-shell/OverlayShellModal.js";

export type OverlayShellMode = "floating" | "anchored" | "modal";

export type OverlayShellFloatingProps = {
    shell?: "floating";
    children?: ReactNode;
} & FloatingWindowProps;

export type OverlayShellAnchoredModeProps = {
    shell: "anchored";
    children?: ReactNode;
} & OverlayShellAnchoredProps;

export type OverlayShellModalModeProps = {
    shell: "modal";
    children?: ReactNode;
} & OverlayShellModalProps;

export type OverlayShellProps = OverlayShellFloatingProps | OverlayShellAnchoredModeProps | OverlayShellModalModeProps;

export function OverlayShell(props: OverlayShellProps) {
    if (props.shell === "anchored") {
        const { shell: _shell, children, ...anchoredProps } = props;
        return <OverlayShellAnchored {...anchoredProps}>{children}</OverlayShellAnchored>;
    }

    if (props.shell === "modal") {
        const { shell: _shell, children, ...modalProps } = props;
        return <OverlayShellModal {...modalProps}>{children}</OverlayShellModal>;
    }

    const { shell: _shell, children, ...floatingProps } = props;
    return <FloatingWindow {...floatingProps}>{children}</FloatingWindow>;
}

export type { FloatingWindowMode, FloatingWindowControls } from "@/window/FloatingWindow.js";
export type { OverlayShellAnchoredProps } from "@/components/ui/overlay-shell/OverlayShellAnchored.js";
export type { OverlayShellModalProps } from "@/components/ui/overlay-shell/OverlayShellModal.js";
