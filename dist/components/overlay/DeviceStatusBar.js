import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DEVICE_CHROME_COLOR, getDeviceSafeAreaTop, scaleStatusBarMetrics } from "../../constants/devicePreview.js";
const IOS_TIME = "9:41";
const ANDROID_TIME = "9:41";
const BATTERY_PERCENT = 80;
function themeColors(appearance) {
    switch (appearance) {
        case "dark":
            return { foreground: "#ffffff" };
        case "light":
        default:
            return { foreground: "#000000" };
    }
}
function CellularIcon({ color, height }) {
    const barW = Math.max(2.2, height * 0.22);
    const gap = Math.max(1.4, height * 0.12);
    const ratios = [0.28, 0.48, 0.7, 1];
    const w = barW * 4 + gap * 3;
    return (_jsx("svg", { width: w, height: height, viewBox: `0 0 ${w} ${height}`, style: { overflow: "visible", display: "block" }, "aria-hidden": true, children: ratios.map((ratio, index) => {
            const h = height * ratio;
            return (_jsx("rect", { x: index * (barW + gap), y: height - h, width: barW, height: h, rx: barW / 2, fill: color }, index));
        }) }));
}
function WifiIcon({ color, size }) {
    const h = size * 0.78;
    return (_jsxs("svg", { width: size, height: h, viewBox: "-1.2 -1.2 18.4 14", style: { overflow: "visible", display: "block" }, "aria-hidden": true, children: [_jsx("circle", { cx: "8", cy: "10.35", r: "1.25", fill: color }), _jsx("path", { d: "M5.1 7.35c1.6-1.55 4.2-1.55 5.8 0", fill: "none", stroke: color, strokeWidth: "1.7", strokeLinecap: "round" }), _jsx("path", { d: "M2.75 4.95c2.9-2.85 7.6-2.85 10.5 0", fill: "none", stroke: color, strokeWidth: "1.7", strokeLinecap: "round" }), _jsx("path", { d: "M0.7 2.55c4-3.8 10.6-3.8 14.6 0", fill: "none", stroke: color, strokeWidth: "1.7", strokeLinecap: "round" })] }));
}
function BatteryIcon({ color, width, height }) {
    const stroke = 1.5;
    const tipW = 2.2;
    const tipGap = 1.1;
    const bodyW = width - tipW - tipGap;
    const ox = stroke / 2 + 0.25;
    const oy = stroke / 2 + 0.25;
    const ow = bodyW - ox * 2;
    const oh = height - oy * 2;
    const fillInset = Math.max(ox + 1.1, height * 0.22);
    return (_jsxs("svg", { width: width, height: height, viewBox: `0 0 ${width} ${height}`, style: { overflow: "visible", display: "block" }, "aria-hidden": true, children: [_jsx("rect", { x: ox, y: oy, width: ow, height: oh, rx: oh * 0.28, fill: "none", stroke: color, strokeWidth: stroke, opacity: "0.4" }), _jsx("rect", { x: fillInset, y: fillInset, width: bodyW - fillInset * 2, height: height - fillInset * 2, rx: (height - fillInset * 2) * 0.2, fill: color }), _jsx("rect", { x: bodyW + tipGap * 0.15, y: height * 0.3, width: tipW, height: height * 0.4, rx: tipW / 2, fill: color, opacity: "0.4" })] }));
}
function BatteryWithPercent({ color, width, height }) {
    const stroke = 1.5;
    const tipW = 2.4;
    const tipGap = 1.1;
    const bodyW = width - tipW - tipGap;
    const ox = stroke / 2 + 0.35;
    const oy = stroke / 2 + 0.35;
    const ow = bodyW - ox * 2;
    const oh = height - oy * 2;
    const fillInset = ox + 1.15;
    const fillW = Math.max(2, (bodyW - fillInset * 2) * (BATTERY_PERCENT / 100));
    const fontSize = Math.max(9, height * 0.62);
    return (_jsxs("svg", { width: width, height: height, viewBox: `0 0 ${width} ${height}`, style: { overflow: "visible", display: "block" }, "aria-hidden": true, children: [_jsx("rect", { x: ox, y: oy, width: ow, height: oh, rx: oh * 0.3, fill: "none", stroke: color, strokeWidth: stroke, opacity: "0.4" }), _jsx("rect", { x: fillInset, y: fillInset, width: fillW, height: height - fillInset * 2, rx: (height - fillInset * 2) * 0.22, fill: "#34C759" }), _jsx("text", { x: bodyW / 2, y: height / 2 + 0.35, textAnchor: "middle", dominantBaseline: "middle", fill: "#ffffff", fontSize: fontSize, fontWeight: "700", fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', children: BATTERY_PERCENT }), _jsx("rect", { x: bodyW + tipGap * 0.15, y: height * 0.3, width: tipW, height: height * 0.4, rx: tipW / 2, fill: color, opacity: "0.4" })] }));
}
function TrailingIcons({ color, cellularH, wifiSize, batteryW, batteryH, gap, withPercent, }) {
    return (_jsxs("div", { className: "flex items-center", style: { gap, color, overflow: "visible", lineHeight: 0 }, children: [_jsx(CellularIcon, { color: color, height: cellularH }), _jsx(WifiIcon, { color: color, size: wifiSize }), withPercent ? (_jsx(BatteryWithPercent, { color: color, width: batteryW, height: batteryH })) : (_jsx(BatteryIcon, { color: color, width: batteryW, height: batteryH }))] }));
}
function TimeLabel({ color, fontSize, children }) {
    return (_jsx("span", { style: {
            color,
            WebkitTextFillColor: color,
            fontSize,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
        }, children: children }));
}
function CutoutVisual({ cutout, layout = "horizontal" }) {
    switch (cutout.kind) {
        case "notch": {
            const width = layout === "vertical" ? cutout.height : cutout.width;
            const height = layout === "vertical" ? cutout.width : cutout.height;
            return (_jsx("div", { className: "relative shrink-0", style: {
                    width,
                    height,
                    background: DEVICE_CHROME_COLOR,
                    ...(layout === "vertical"
                        ? {
                            borderTopRightRadius: width * 0.45,
                            borderBottomRightRadius: width * 0.45,
                        }
                        : {
                            borderBottomLeftRadius: height * 0.45,
                            borderBottomRightRadius: height * 0.45,
                        }),
                }, children: _jsx("div", { className: "absolute rounded-full", style: {
                        width: 6.4,
                        height: 6.4,
                        background: DEVICE_CHROME_COLOR,
                        ...(layout === "vertical" ? { left: "42%", top: "50%", transform: "translate(-50%, -50%)" } : { left: "50%", top: "42%", transform: "translate(-50%, -50%)" }),
                    } }) }));
        }
        case "island": {
            const width = layout === "vertical" ? cutout.height : cutout.width;
            const height = layout === "vertical" ? cutout.width : cutout.height;
            return (_jsx("div", { className: "relative shrink-0", style: {
                    width,
                    height,
                    borderRadius: 999,
                    background: DEVICE_CHROME_COLOR,
                }, children: _jsx("div", { className: "absolute rounded-full", style: {
                        width: 8,
                        height: 8,
                        background: DEVICE_CHROME_COLOR,
                        ...(layout === "vertical" ? { bottom: 12, left: "50%", transform: "translateX(-50%)" } : { top: "50%", right: 12, transform: "translateY(-50%)" }),
                    } }) }));
        }
        case "punch":
            return (_jsx("div", { className: "relative shrink-0 rounded-full", style: {
                    width: cutout.radius * 2,
                    height: cutout.radius * 2,
                    background: DEVICE_CHROME_COLOR,
                }, children: _jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full", style: {
                        width: cutout.radius * 0.7,
                        height: cutout.radius * 0.7,
                        background: DEVICE_CHROME_COLOR,
                    } }) }));
        case "none":
        default:
            return null;
    }
}
function CenterColumn({ cutout }) {
    if (cutout.kind === "none") {
        return (_jsx("div", { className: "flex h-full shrink-0 items-center justify-center", style: { width: cutout.width } }));
    }
    return (_jsx("div", { className: "flex h-full shrink-0 items-center justify-center", style: { width: cutout.width }, "data-fivepixels-device-cutout": cutout.kind, children: _jsx(CutoutVisual, { cutout: cutout }) }));
}
function StatusThreeColumn({ color, fontFamily, fontSize, fontWeight, padLeft, padRight, cutout, left, right, center, }) {
    return (_jsxs("div", { className: "flex h-full w-full items-center", style: {
            color,
            WebkitTextFillColor: color,
            fontFamily,
            fontSize,
            fontWeight,
            letterSpacing: "-0.02em",
        }, children: [_jsx("div", { className: "flex min-w-0 flex-1 items-center justify-center", style: { paddingLeft: padLeft || undefined, overflow: "visible" }, children: left ?? null }), center ?? _jsx(CenterColumn, { cutout: cutout }), _jsx("div", { className: "flex min-w-0 flex-1 items-center justify-center", style: { paddingRight: padRight || undefined, overflow: "visible" }, children: right })] }));
}
function renderClassic(color, metrics) {
    const iosFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
    return (_jsx(StatusThreeColumn, { color: color, fontFamily: iosFont, fontSize: metrics.timeSize, fontWeight: 600, padLeft: metrics.padLeft, padRight: metrics.padRight, cutout: metrics.cutout, left: _jsxs("div", { className: "flex items-center", style: { gap: 4 }, children: [_jsx(TimeLabel, { color: color, fontSize: metrics.timeSize, children: "SKT" }), _jsx(CellularIcon, { color: color, height: metrics.cellularH })] }), center: _jsx("div", { className: "flex shrink-0 items-center justify-center", children: _jsx(TimeLabel, { color: color, fontSize: metrics.timeSize, children: IOS_TIME }) }), right: _jsx(TrailingIcons, { color: color, cellularH: metrics.cellularH, wifiSize: metrics.wifi, batteryW: metrics.batteryW, batteryH: metrics.batteryH, gap: metrics.iconGap, withPercent: metrics.batteryPercent }) }));
}
function renderFaceId(color, metrics, orientation) {
    const iosFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
    if (orientation === "landscape") {
        return (_jsx(StatusThreeColumn, { color: color, fontFamily: iosFont, fontSize: metrics.timeSize, fontWeight: 600, padLeft: metrics.padLeft, padRight: metrics.padRight, cutout: { kind: "none", width: 0, height: 0, top: 0 }, center: _jsx(TimeLabel, { color: color, fontSize: metrics.timeSize, children: IOS_TIME }), right: _jsx(TrailingIcons, { color: color, cellularH: metrics.cellularH, wifiSize: metrics.wifi, batteryW: metrics.batteryW, batteryH: metrics.batteryH, gap: metrics.iconGap, withPercent: metrics.batteryPercent }) }));
    }
    return (_jsx(StatusThreeColumn, { color: color, fontFamily: iosFont, fontSize: metrics.timeSize, fontWeight: 600, padLeft: metrics.padLeft, padRight: metrics.padRight, cutout: metrics.cutout, left: _jsx(TimeLabel, { color: color, fontSize: metrics.timeSize, children: IOS_TIME }), right: _jsx(TrailingIcons, { color: color, cellularH: metrics.cellularH, wifiSize: metrics.wifi, batteryW: metrics.batteryW, batteryH: metrics.batteryH, gap: metrics.iconGap, withPercent: metrics.batteryPercent }) }));
}
function renderAndroid(color, metrics) {
    const androidFont = 'Roboto, "Noto Sans", system-ui, sans-serif';
    return (_jsx(StatusThreeColumn, { color: color, fontFamily: androidFont, fontSize: metrics.timeSize, fontWeight: 500, padLeft: metrics.padLeft, padRight: metrics.padRight, cutout: metrics.cutout, left: _jsx(TimeLabel, { color: color, fontSize: metrics.timeSize, children: ANDROID_TIME }), right: _jsx(TrailingIcons, { color: color, cellularH: metrics.cellularH, wifiSize: metrics.wifi, batteryW: metrics.batteryW, batteryH: metrics.batteryH, gap: metrics.iconGap, withPercent: metrics.batteryPercent }) }));
}
function renderTablet(color, metrics) {
    const iosFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
    return (_jsx(StatusThreeColumn, { color: color, fontFamily: iosFont, fontSize: metrics.timeSize, fontWeight: 600, padLeft: metrics.padLeft, padRight: metrics.padRight, cutout: metrics.cutout, left: _jsx(TimeLabel, { color: color, fontSize: metrics.timeSize, children: IOS_TIME }), right: _jsx(TrailingIcons, { color: color, cellularH: metrics.cellularH, wifiSize: metrics.wifi, batteryW: metrics.batteryW, batteryH: metrics.batteryH, gap: metrics.iconGap, withPercent: metrics.batteryPercent }) }));
}
export function getDeviceStatusBarHeight(preset, screenWidth, scale = 1, referenceLogicalWidth = preset.width) {
    return Math.max(0, Math.round(getDeviceSafeAreaTop(preset, screenWidth, referenceLogicalWidth) * scale));
}
export function DeviceStatusBar({ preset, width, screenHeight, scale = 1, appearance = "light", showCutout = true, orientation = "portrait", referenceLogicalWidth = preset.width, }) {
    const metrics = scaleStatusBarMetrics(preset, width, referenceLogicalWidth);
    const height = Math.max(0, Math.round(metrics.safeAreaTop * scale));
    const { foreground } = themeColors(appearance);
    const cutout = showCutout ? metrics.cutout : { kind: "none", width: metrics.cutout.width, height: 0, top: 0 };
    let content = null;
    switch (metrics.layout) {
        case "classic":
            content = renderClassic(foreground, { ...metrics, cutout });
            break;
        case "faceId":
            content = renderFaceId(foreground, { ...metrics, cutout }, orientation);
            break;
        case "android":
            content = renderAndroid(foreground, { ...metrics, cutout });
            break;
        case "tablet":
            content = renderTablet(foreground, { ...metrics, cutout });
            break;
        case "none":
        default:
            return null;
    }
    const statusBarRow = (_jsx("div", { className: "pointer-events-none absolute left-0 right-0 top-0 overflow-hidden bg-[var(--adaptive-neutralTintOpacity700)] backdrop-blur-[10px]", style: { height, color: foreground, WebkitTextFillColor: foreground }, "data-fivepixels-device-status-bar": metrics.layout, "aria-hidden": true, children: content }));
    const showLandscapeEdgeCutout = orientation === "landscape" && showCutout && cutout.kind !== "none" && cutout.height > 0;
    if (!showLandscapeEdgeCutout) {
        return statusBarRow;
    }
    return (_jsxs("div", { className: "pointer-events-none absolute inset-0 overflow-visible", style: screenHeight ? { height: screenHeight } : undefined, "aria-hidden": true, children: [statusBarRow, _jsx("div", { "data-fivepixels-device-cutout": cutout.kind, "data-fivepixels-device-cutout-placement": "landscape-edge", style: {
                    position: "absolute",
                    top: "50%",
                    left: "14px",
                    transform: "translate(0%, -50%)",
                }, children: _jsx(CutoutVisual, { cutout: cutout, layout: "vertical" }) })] }));
}
//# sourceMappingURL=DeviceStatusBar.js.map