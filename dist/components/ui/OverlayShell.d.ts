import type { ReactNode } from "react";
import { type FloatingWindowProps } from "../../window/FloatingWindow.js";
import { type OverlayShellAnchoredProps } from "../../components/ui/overlay-shell/OverlayShellAnchored.js";
import { type OverlayShellModalProps } from "../../components/ui/overlay-shell/OverlayShellModal.js";
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
export declare function OverlayShell(props: OverlayShellProps): import("react").JSX.Element;
export type { FloatingWindowMode, FloatingWindowControls } from "../../window/FloatingWindow.js";
export type { OverlayShellAnchoredProps } from "../../components/ui/overlay-shell/OverlayShellAnchored.js";
export type { OverlayShellModalProps } from "../../components/ui/overlay-shell/OverlayShellModal.js";
//# sourceMappingURL=OverlayShell.d.ts.map