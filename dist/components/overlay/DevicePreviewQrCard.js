import { jsx as _jsx } from "react/jsx-runtime";
import { DevicePreviewQrPanel } from "./DevicePreviewQrPanel.js";
export function DevicePreviewQrCard({ left, maxWidth, ...panelProps }) {
    const pageHref = typeof window !== "undefined" ? window.location.href : "";
    const width = Math.max(168, Math.min(220, maxWidth));
    return (_jsx("div", { className: "pointer-events-auto fixed z-[1000001] top-[50%]", style: {
            left,
            width,
            maxWidth: Math.max(0, maxWidth),
            transform: "translateY(-50%)",
        }, children: _jsx(DevicePreviewQrPanel, { ...panelProps, pageHref: pageHref, width: width }) }));
}
//# sourceMappingURL=DevicePreviewQrCard.js.map