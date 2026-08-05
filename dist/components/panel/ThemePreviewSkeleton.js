import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const GRAIN_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
    </svg>`)}")`;
const LIGHT_SHELL = {
    outer: "linear-gradient(145deg, #f8f8f9 0%, #ececee 42%, #f4f4f5 78%, #e8e8ea 100%)",
    grainOpacity: 0.28,
    card: "#ffffff",
    cardShadow: "0 4px 12px rgba(15, 23, 42, 0.14), 0 1px 2px rgba(15, 23, 42, 0.06)",
    ink: "#3f3f46",
    inkSoft: "#d4d4d8",
    inkMuted: "#a1a1aa",
};
const DARK_SHELL = {
    outer: "linear-gradient(145deg, #3a3a3c 0%, #1a1a1c 48%, #111113 100%)",
    grainOpacity: 0.4,
    card: "#2c2c2e",
    cardShadow: "0 4px 12px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.35)",
    ink: "#f4f4f5",
    inkSoft: "#52525b",
    inkMuted: "#71717a",
};
function GrainLayer({ opacity }) {
    return (_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 mix-blend-overlay", style: {
            opacity,
            backgroundImage: GRAIN_BACKGROUND,
            backgroundSize: "120px 120px",
        } }));
}
function PanelCardContent({ ink, inkSoft, inkMuted }) {
    return (_jsxs("div", { className: "relative h-full w-full", children: [_jsx("span", { className: "absolute top-[12%] left-[12%] h-[9px] w-[9px] rounded-full", style: { backgroundColor: ink } }), _jsx("span", { className: "absolute top-[15%] right-[12%] h-[5px] w-[22%] rounded-full", style: { backgroundColor: inkSoft } }), _jsx("span", { className: "absolute top-[40%] left-[12%] h-[4px] w-[76%] rounded-full", style: { backgroundColor: inkSoft } }), _jsx("span", { className: "absolute top-[54%] left-[12%] h-[4px] w-[58%] rounded-full", style: { backgroundColor: inkSoft } }), _jsx("span", { className: "absolute top-[68%] left-[12%] h-[4px] w-[46%] rounded-full", style: { backgroundColor: inkMuted } }), _jsx("span", { className: "absolute right-[12%] bottom-[12%] h-[8px] w-[8px] rounded-full", style: { backgroundColor: ink } })] }));
}
function PanelShell({ palette }) {
    return (_jsxs("div", { className: "relative h-full w-full overflow-hidden", style: { background: palette.outer }, children: [_jsx(GrainLayer, { opacity: palette.grainOpacity }), _jsx("div", { className: "absolute inset-[12%] overflow-hidden rounded-[8px]", style: { backgroundColor: palette.card, boxShadow: palette.cardShadow }, children: _jsx(PanelCardContent, { ink: palette.ink, inkSoft: palette.inkSoft, inkMuted: palette.inkMuted }) })] }));
}
function PanelSystemShell() {
    return (_jsxs("div", { className: "relative h-full w-full overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 flex", children: [_jsx("div", { className: "relative min-w-0 flex-1 overflow-hidden", style: { background: DARK_SHELL.outer }, children: _jsx(GrainLayer, { opacity: DARK_SHELL.grainOpacity }) }), _jsx("div", { className: "relative min-w-0 flex-1 overflow-hidden", style: { background: LIGHT_SHELL.outer }, children: _jsx(GrainLayer, { opacity: LIGHT_SHELL.grainOpacity }) })] }), _jsxs("div", { className: "absolute inset-[12%] overflow-hidden rounded-[8px]", style: { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.22), 0 1px 2px rgba(15, 23, 42, 0.08)" }, children: [_jsxs("div", { className: "absolute inset-0 flex", children: [_jsx("div", { className: "min-w-0 flex-1", style: { backgroundColor: DARK_SHELL.card } }), _jsx("div", { className: "min-w-0 flex-1", style: { backgroundColor: LIGHT_SHELL.card } })] }), _jsxs("div", { className: "relative h-full w-full", children: [_jsx("span", { className: "absolute top-[12%] left-[12%] h-[9px] w-[9px] rounded-full", style: { backgroundColor: DARK_SHELL.ink } }), _jsx("span", { className: "absolute top-[15%] right-[12%] h-[5px] w-[22%] rounded-full", style: { backgroundColor: LIGHT_SHELL.inkSoft } }), _jsxs("div", { className: "absolute top-[40%] right-[12%] left-[12%] flex h-[4px] overflow-hidden rounded-full", children: [_jsx("span", { className: "h-full flex-1", style: { backgroundColor: DARK_SHELL.inkSoft } }), _jsx("span", { className: "h-full flex-1", style: { backgroundColor: LIGHT_SHELL.inkSoft } })] }), _jsxs("div", { className: "absolute top-[54%] left-[12%] flex h-[4px] w-[58%] overflow-hidden rounded-full", children: [_jsx("span", { className: "h-full w-1/2", style: { backgroundColor: DARK_SHELL.inkSoft } }), _jsx("span", { className: "h-full w-1/2", style: { backgroundColor: LIGHT_SHELL.inkSoft } })] }), _jsxs("div", { className: "absolute top-[68%] left-[12%] flex h-[4px] w-[46%] overflow-hidden rounded-full", children: [_jsx("span", { className: "h-full w-[55%]", style: { backgroundColor: DARK_SHELL.inkMuted } }), _jsx("span", { className: "h-full flex-1", style: { backgroundColor: LIGHT_SHELL.inkMuted } })] }), _jsx("span", { className: "absolute right-[12%] bottom-[12%] h-[8px] w-[8px] rounded-full", style: { backgroundColor: LIGHT_SHELL.ink } })] })] })] }));
}
function TooltipBubbleContent({ ink, inkSoft, inkMuted }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-[8px] flex items-center gap-[6px]", children: [_jsx("span", { className: "block h-[7px] w-[7px] shrink-0 rounded-full", style: { backgroundColor: ink } }), _jsx("span", { className: "block h-[4px] flex-1 rounded-full", style: { backgroundColor: inkSoft } })] }), _jsxs("div", { className: "flex flex-col gap-[5px]", children: [_jsx("span", { className: "block h-[3px] w-full rounded-full", style: { backgroundColor: inkSoft } }), _jsx("span", { className: "block h-[3px] w-[82%] rounded-full", style: { backgroundColor: inkSoft } }), _jsx("span", { className: "block h-[3px] w-[58%] rounded-full", style: { backgroundColor: inkMuted } })] })] }));
}
function TooltipShell({ palette }) {
    return (_jsxs("div", { className: "relative h-full w-full overflow-hidden", style: { background: palette.outer }, children: [_jsx(GrainLayer, { opacity: palette.grainOpacity }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center px-[10%]", children: [_jsxs("div", { className: "relative w-full max-w-[78%]", children: [_jsx("div", { className: "overflow-hidden rounded-[8px] px-[10px] py-[9px]", style: { backgroundColor: palette.card, boxShadow: palette.cardShadow }, children: _jsx(TooltipBubbleContent, { ink: palette.ink, inkSoft: palette.inkSoft, inkMuted: palette.inkMuted }) }), _jsx("span", { "aria-hidden": true, className: "absolute top-full left-1/2 -mt-px h-[7px] w-[10px] -translate-x-1/2", style: {
                                    backgroundColor: palette.card,
                                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                                    filter: "drop-shadow(0 1px 1px rgba(15, 23, 42, 0.12))",
                                } })] }), _jsx("span", { className: "mt-[10px] block h-[5px] w-[30%] rounded-full opacity-65", style: { backgroundColor: palette.inkMuted } })] })] }));
}
function TooltipSystemShell() {
    return (_jsxs("div", { className: "relative h-full w-full overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 flex", children: [_jsx("div", { className: "relative min-w-0 flex-1 overflow-hidden", style: { background: DARK_SHELL.outer }, children: _jsx(GrainLayer, { opacity: DARK_SHELL.grainOpacity }) }), _jsx("div", { className: "relative min-w-0 flex-1 overflow-hidden", style: { background: LIGHT_SHELL.outer }, children: _jsx(GrainLayer, { opacity: LIGHT_SHELL.grainOpacity }) })] }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center px-[10%]", children: [_jsx("div", { className: "relative w-full max-w-[78%] overflow-hidden rounded-[8px]", style: { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.22)" }, children: _jsxs("div", { className: "flex", children: [_jsxs("div", { className: "min-w-0 flex-1 px-[10px] py-[9px]", style: { backgroundColor: DARK_SHELL.card }, children: [_jsxs("div", { className: "mb-[8px] flex items-center gap-[6px]", children: [_jsx("span", { className: "block h-[7px] w-[7px] shrink-0 rounded-full", style: { backgroundColor: DARK_SHELL.ink } }), _jsx("span", { className: "block h-[4px] flex-1 rounded-full", style: { backgroundColor: DARK_SHELL.inkSoft } })] }), _jsxs("div", { className: "flex flex-col gap-[5px]", children: [_jsx("span", { className: "block h-[3px] w-full rounded-full", style: { backgroundColor: DARK_SHELL.inkSoft } }), _jsx("span", { className: "block h-[3px] w-[82%] rounded-full", style: { backgroundColor: DARK_SHELL.inkSoft } })] })] }), _jsxs("div", { className: "min-w-0 flex-1 px-[10px] py-[9px]", style: { backgroundColor: LIGHT_SHELL.card }, children: [_jsx("div", { className: "mb-[8px] h-[7px]" }), _jsxs("div", { className: "flex flex-col gap-[5px]", children: [_jsx("span", { className: "block h-[3px] w-full rounded-full", style: { backgroundColor: LIGHT_SHELL.inkSoft } }), _jsx("span", { className: "block h-[3px] w-[58%] rounded-full", style: { backgroundColor: LIGHT_SHELL.inkMuted } })] })] })] }) }), _jsx("span", { className: "mt-[10px] block h-[5px] w-[30%] rounded-full bg-[#71717a] opacity-65" })] })] }));
}
export function ThemePreviewSkeleton({ variant, kind = "panel" }) {
    if (kind === "tooltip") {
        if (variant === "system") {
            return _jsx(TooltipSystemShell, {});
        }
        return _jsx(TooltipShell, { palette: variant === "dark" ? DARK_SHELL : LIGHT_SHELL });
    }
    if (variant === "system") {
        return _jsx(PanelSystemShell, {});
    }
    return _jsx(PanelShell, { palette: variant === "dark" ? DARK_SHELL : LIGHT_SHELL });
}
//# sourceMappingURL=ThemePreviewSkeleton.js.map