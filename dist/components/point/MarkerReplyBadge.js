import { jsx as _jsx } from "react/jsx-runtime";
/** Satellite badge on the top-right of a marker when the thread has replies. */
export function MarkerReplyBadge({ size, accentColor }) {
    const offset = Math.max(1, Math.round(size * 0.15));
    return (_jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute rounded-full border-2 border-white", style: {
            width: size,
            height: size,
            top: -offset,
            right: -offset,
            backgroundColor: "#ffffff",
            boxShadow: `0 0 0 1.5px ${accentColor}88, 0 1px 4px #00000055`,
        } }));
}
//# sourceMappingURL=MarkerReplyBadge.js.map