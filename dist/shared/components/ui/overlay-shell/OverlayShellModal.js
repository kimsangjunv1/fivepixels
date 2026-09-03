import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
export function OverlayShellModal({ open, onClose, ariaLabel, dataChrome, role = "dialog", zIndex, backdropClassName = "pointer-events-auto fixed inset-0", backdropStyle, panelClassName = "", closeOnBackdrop = true, closeOnEscape = true, children, }) {
    useEffect(() => {
        if (!open || !closeOnEscape) {
            return;
        }
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return () => {
            window.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [closeOnEscape, onClose, open]);
    if (!open) {
        return null;
    }
    const handleBackdropPointerDown = (event) => {
        if (!closeOnBackdrop) {
            return;
        }
        if (event.target === event.currentTarget) {
            onClose();
        }
    };
    return (_jsx("div", { "data-fp-chrome": dataChrome, role: role, "aria-modal": "true", "aria-label": ariaLabel, "data-fivepixels-interactive": "", className: backdropClassName, style: { zIndex, ...backdropStyle }, onPointerDown: handleBackdropPointerDown, children: _jsx("div", { className: panelClassName, onPointerDown: (event) => event.stopPropagation(), children: children }) }));
}
//# sourceMappingURL=OverlayShellModal.js.map