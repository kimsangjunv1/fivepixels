import { jsx as _jsx } from "react/jsx-runtime";
import { FloatingWindow } from "../../window/FloatingWindow.js";
import { OverlayShellAnchored } from "../../components/ui/overlay-shell/OverlayShellAnchored.js";
import { OverlayShellModal } from "../../components/ui/overlay-shell/OverlayShellModal.js";
export function OverlayShell(props) {
    if (props.shell === "anchored") {
        const { shell: _shell, children, ...anchoredProps } = props;
        return _jsx(OverlayShellAnchored, { ...anchoredProps, children: children });
    }
    if (props.shell === "modal") {
        const { shell: _shell, children, ...modalProps } = props;
        return _jsx(OverlayShellModal, { ...modalProps, children: children });
    }
    const { shell: _shell, children, ...floatingProps } = props;
    return _jsx(FloatingWindow, { ...floatingProps, children: children });
}
//# sourceMappingURL=OverlayShell.js.map