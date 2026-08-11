import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const IOS_TIME = "9:41";
const ANDROID_TIME = "9:41";
function themeColors(appearance) {
    if (appearance === "dark") {
        return {
            background: "#000000",
            foreground: "#ffffff",
        };
    }
    return {
        background: "#F2F2F7",
        foreground: "#000000",
    };
}
function getStatusBarHeight(frame, width) {
    switch (frame) {
        case "home-button":
            return Math.round(width * (20 / 375));
        case "notch":
            return Math.round(width * (47 / 390));
        case "island":
            return Math.round(width * (54 / 393));
        case "punch":
        case "punch-flat":
            return Math.round(width * (24 / 360));
        case "tablet":
        case "tablet-thin":
            return Math.round(width * (24 / 768));
        case "desktop":
            return 0;
        default:
            return Math.round(width * 0.06);
    }
}
/** Match DeviceFrameArtwork cutout sizes for the center column. */
function getCutoutSize(frame, width) {
    if (frame === "notch") {
        return {
            width: Math.round(width * 0.34),
            height: Math.round(Math.max(28, width * 0.08)),
            kind: "notch",
        };
    }
    if (frame === "island") {
        return {
            width: Math.round(Math.min(126, width * 0.32)),
            height: Math.round(Math.max(34, width * 0.085)),
            kind: "island",
        };
    }
    if (frame === "punch" || frame === "punch-flat") {
        const hole = frame === "punch-flat" ? 11 : 12;
        return {
            width: hole * 2 + 8,
            height: hole * 2 + 8,
            kind: "punch",
            hole,
        };
    }
    return null;
}
function CellularIcon({ color, height }) {
    const barW = height * 0.18;
    const gap = height * 0.1;
    const ratios = [0.3, 0.5, 0.72, 1];
    const w = barW * 4 + gap * 3;
    return (_jsx("svg", { width: w, height: height, viewBox: `0 0 ${w} ${height}`, "aria-hidden": true, children: ratios.map((ratio, index) => {
            const h = height * ratio;
            return (_jsx("rect", { x: index * (barW + gap), y: height - h, width: barW, height: h, rx: barW / 2, fill: color }, index));
        }) }));
}
function WifiIcon({ color, size }) {
    return (_jsxs("svg", { width: size, height: size * 0.72, viewBox: "0 0 16 11.5", "aria-hidden": true, children: [_jsx("circle", { cx: "8", cy: "10.15", r: "1.2", fill: color }), _jsx("path", { d: "M5.1 7.25c1.6-1.55 4.2-1.55 5.8 0", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round" }), _jsx("path", { d: "M2.75 4.85c2.9-2.85 7.6-2.85 10.5 0", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round" }), _jsx("path", { d: "M0.55 2.45c4.1-4 10.8-4 14.9 0", fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round" })] }));
}
function BatteryIcon({ color, width }) {
    const h = width * 0.48;
    const bodyW = width * 0.82;
    const tipW = Math.max(1.5, width * 0.075);
    const inset = Math.max(1.15, h * 0.18);
    return (_jsxs("svg", { width: width, height: h, viewBox: `0 0 ${width} ${h}`, "aria-hidden": true, children: [_jsx("rect", { x: "0.7", y: "0.7", width: bodyW - 1.4, height: h - 1.4, rx: h * 0.26, fill: "none", stroke: color, strokeWidth: "1.35", opacity: "0.45" }), _jsx("rect", { x: inset, y: inset, width: bodyW - inset * 2, height: h - inset * 2, rx: h * 0.14, fill: color }), _jsx("path", { d: `M ${bodyW - 0.2} ${h * 0.3}
                    h ${tipW * 0.35}
                    a ${tipW / 2} ${tipW / 2} 0 0 1 0 ${h * 0.4}
                    h ${-tipW * 0.35}
                    z`, fill: color, opacity: "0.45" })] }));
}
function TrailingIcons({ color, iconH }) {
    return (_jsxs("div", { className: "flex items-center justify-center", style: { gap: Math.max(4, iconH * 0.42), color }, children: [_jsx(CellularIcon, { color: color, height: iconH }), _jsx(WifiIcon, { color: color, size: iconH * 1.05 }), _jsx(BatteryIcon, { color: color, width: iconH * 2.05 })] }));
}
function CutoutCenter({ frame, width }) {
    const cutout = getCutoutSize(frame, width);
    if (!cutout) {
        return (_jsx("div", { className: "h-full shrink-0", style: { width: Math.max(8, width * 0.08) } }));
    }
    if (cutout.kind === "notch") {
        return (_jsx("div", { className: "flex shrink-0 items-end justify-center", style: { width: cutout.width, height: "100%" }, children: _jsx("div", { style: {
                    width: cutout.width,
                    height: cutout.height,
                    background: "#000000",
                    borderBottomLeftRadius: cutout.height * 0.45,
                    borderBottomRightRadius: cutout.height * 0.45,
                } }) }));
    }
    if (cutout.kind === "island") {
        return (_jsx("div", { className: "flex shrink-0 items-center justify-center", style: { width: cutout.width, height: "100%" }, children: _jsx("div", { style: {
                    width: cutout.width,
                    height: cutout.height,
                    borderRadius: 999,
                    background: "#000000",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)",
                } }) }));
    }
    const hole = cutout.hole ?? 12;
    return (_jsx("div", { className: "flex shrink-0 items-center justify-center", style: { width: cutout.width, height: "100%" }, children: _jsx("div", { style: {
                width: hole * 2,
                height: hole * 2,
                borderRadius: 999,
                background: "#000000",
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.3)",
            } }) }));
}
function TimeLabel({ color, children }) {
    return (_jsx("span", { style: {
            color,
            WebkitTextFillColor: color,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
        }, children: children }));
}
function StatusRow({ width, frame, color, fontFamily, fontSize, fontWeight, left, right, showCutout, }) {
    return (_jsxs("div", { className: "flex h-full w-full items-center", style: {
            color,
            WebkitTextFillColor: color,
            fontFamily,
            fontSize,
            fontWeight,
            letterSpacing: "-0.02em",
        }, children: [_jsx("div", { className: "flex min-w-0 flex-1 items-center justify-center", children: left }), showCutout ? (_jsx(CutoutCenter, { frame: frame, width: width })) : (_jsx("div", { className: "h-full shrink-0", style: { width: Math.max(8, width * 0.08) } })), _jsx("div", { className: "flex min-w-0 flex-1 items-center justify-center", children: right })] }));
}
export function getDeviceStatusBarHeight(preset, screenWidth, scale = 1) {
    return Math.max(0, Math.round(getStatusBarHeight(preset.frame, screenWidth) * scale));
}
export function DeviceStatusBar({ preset, width, scale = 1, appearance = "light", }) {
    if (preset.frame === "desktop") {
        return null;
    }
    const height = getDeviceStatusBarHeight(preset, width, scale);
    const { background, foreground } = themeColors(appearance);
    const iconH = Math.max(10, Math.min(14, width * 0.032));
    const iosFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
    const androidFont = 'Roboto, "Noto Sans", system-ui, sans-serif';
    let content = null;
    if (preset.frame === "home-button") {
        content = (_jsxs("div", { className: "flex h-full w-full items-center", style: {
                color: foreground,
                WebkitTextFillColor: foreground,
                fontFamily: iosFont,
                fontSize: Math.max(12, width * (12 / 375)),
                fontWeight: 600,
            }, children: [_jsxs("div", { className: "flex min-w-0 flex-1 items-center justify-center", style: { gap: 4 }, children: [_jsx(TimeLabel, { color: foreground, children: "SKT" }), _jsx(CellularIcon, { color: foreground, height: iconH * 0.9 })] }), _jsx("div", { className: "flex shrink-0 items-center justify-center", children: _jsx(TimeLabel, { color: foreground, children: IOS_TIME }) }), _jsx("div", { className: "flex min-w-0 flex-1 items-center justify-center", children: _jsx(TrailingIcons, { color: foreground, iconH: iconH }) })] }));
    }
    else if (preset.frame === "notch" || preset.frame === "island") {
        content = (_jsx(StatusRow, { width: width, frame: preset.frame, color: foreground, fontFamily: iosFont, fontSize: Math.max(15, width * (15 / 393)), fontWeight: 600, showCutout: true, left: _jsx(TimeLabel, { color: foreground, children: IOS_TIME }), right: _jsx(TrailingIcons, { color: foreground, iconH: Math.max(11, width * (12 / 393)) }) }));
    }
    else if (preset.frame === "punch" || preset.frame === "punch-flat") {
        content = (_jsx(StatusRow, { width: width, frame: preset.frame, color: foreground, fontFamily: androidFont, fontSize: Math.max(11, width * (12 / 360)), fontWeight: 500, showCutout: true, left: _jsx(TimeLabel, { color: foreground, children: ANDROID_TIME }), right: _jsxs("div", { className: "flex items-center justify-center", style: { gap: 6, color: foreground }, children: [_jsx(WifiIcon, { color: foreground, size: iconH }), _jsx(CellularIcon, { color: foreground, height: iconH * 0.95 }), _jsx(BatteryIcon, { color: foreground, width: iconH * 2 })] }) }));
    }
    else if (preset.frame === "tablet" || preset.frame === "tablet-thin") {
        content = (_jsx(StatusRow, { width: width, frame: preset.frame, color: foreground, fontFamily: iosFont, fontSize: Math.max(12, width * (13 / 768)), fontWeight: 600, showCutout: false, left: _jsx(TimeLabel, { color: foreground, children: IOS_TIME }), right: _jsx(TrailingIcons, { color: foreground, iconH: Math.max(10, height * 0.4) }) }));
    }
    if (!content) {
        return null;
    }
    return (_jsx("div", { className: "pointer-events-none absolute left-0 right-0 top-0 overflow-hidden", style: { height, background, color: foreground, WebkitTextFillColor: foreground }, "data-fivepixels-device-status-bar": preset.frame, "aria-hidden": true, children: content }));
}
//# sourceMappingURL=DeviceStatusBar.js.map