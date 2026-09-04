import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AskAiIcon, CheckIcon, ChevronDownIcon, DeleteIcon, DevicePreviewIcon, GitHubIcon, LinkIcon, NotificationActiveIcon, SendIcon, SettingsIcon, } from "../shared/components/icons/Icons.js";
import { DEVICE_PREVIEW_PRESETS } from "../shared/constants/devicePreview.js";
import { en } from "../shared/i18n/en.js";
import { ko } from "../shared/i18n/ko.js";
import { MarkerShapeGlyph } from "../surfaces/marker/MarkerShapeGlyph.js";
import { AppearanceThemePicker } from "../surfaces/panel/AppearanceThemePicker.js";
import { MarkerShapePicker } from "../surfaces/panel/MarkerShapePicker.js";
import { PanelStatusBanner } from "../surfaces/panel/PanelStatusBanner.js";
import { PanelTabs } from "../surfaces/panel/PanelTabs.js";
import { DeviceFrameArtwork } from "../surfaces/preview/DeviceFrameArtwork.js";
import { WindowModeControls } from "../surfaces/window/WindowModeControls.js";
const PANEL_SURFACE = "pointer-events-auto overflow-hidden rounded-[18px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity700)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";
const DEMO_DEVICE_PRESETS = DEVICE_PREVIEW_PRESETS.filter((preset) => preset.id === "iphone-14" || preset.id === "galaxy-s24");
function WindowHeader({ title, copy, icon }) {
    const [mode, setMode] = useState("normal");
    return (_jsxs("header", { className: "flex min-h-[44px] items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px]", children: [icon ? _jsx("span", { className: "flex h-[24px] w-[24px] items-center justify-center text-[var(--adaptive-black800)]", children: icon }) : null, _jsx("strong", { className: "min-w-0 flex-1 truncate text-[13px] text-[var(--adaptive-black900)]", children: mode === "minimized" ? "…" : title }), _jsx(WindowModeControls, { closeAriaLabel: copy.close, minimizeAriaLabel: copy.minimize, maximizeAriaLabel: copy.maximize, isMaximized: mode === "maximized", onClose: () => setMode("minimized"), onMinimize: () => setMode((current) => (current === "minimized" ? "normal" : "minimized")), onMaximize: () => setMode((current) => (current === "maximized" ? "normal" : "maximized")) })] }));
}
function MarkerTooltipScene({ copy }) {
    const [open, setOpen] = useState(true);
    return (_jsxs("div", { className: "relative h-full w-full", children: [_jsxs("button", { type: "button", "aria-label": copy.marker.title, "aria-expanded": open, onClick: () => setOpen((current) => !current), className: "absolute bottom-[28px] left-[40px] flex h-[44px] w-[44px] items-center justify-center", children: [_jsx(MarkerShapeGlyph, { shape: "circle", fill: "#ff2d55", width: 40, height: 40, style: { filter: "drop-shadow(0 7px 14px #00000040)" } }), _jsx("span", { className: "absolute text-[12px] font-bold text-white", children: "1" }), _jsx("span", { className: "absolute -right-[1px] -top-[1px] h-[12px] w-[12px] rounded-full border-2 border-white bg-[#7657ff]" })] }), open ? (_jsxs("article", { className: `absolute left-[76px] top-[26px] w-[286px] p-[14px] ${PANEL_SURFACE}`, children: [_jsxs("div", { className: "mb-[10px] flex items-center gap-[8px]", children: [_jsx("strong", { className: "min-w-0 flex-1 truncate text-[14px] text-[var(--adaptive-black900)]", children: copy.marker.title }), _jsx("span", { className: "rounded-full bg-[var(--adaptive-blue100)] px-[8px] py-[4px] text-[10px] text-[var(--adaptive-blue600)]", children: copy.marker.category })] }), _jsxs("div", { className: "flex items-center gap-[6px] text-[11px] text-[var(--adaptive-black500)]", children: [_jsx("span", { children: copy.marker.author }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: copy.marker.age }), _jsxs("span", { className: "ml-auto text-[var(--adaptive-blue600)]", children: [copy.marker.score, " 72"] })] })] })) : null] }));
}
function FeedbackComposerScene({ copy }) {
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState(2);
    const [sent, setSent] = useState(false);
    return (_jsx("div", { className: "flex h-full items-center justify-center p-[10px]", children: _jsxs("article", { className: `w-full ${PANEL_SURFACE}`, children: [_jsxs("div", { className: "flex items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[14px] py-[10px]", children: [_jsx("button", { type: "button", className: "text-[18px] text-[var(--adaptive-black700)]", children: "+" }), _jsxs("button", { type: "button", className: "flex items-center gap-[4px] text-[12px] text-[var(--adaptive-black700)]", children: [copy.composer.caseLabel, _jsx(ChevronDownIcon, { className: "h-[13px] w-[13px]" })] })] }), _jsx("textarea", { value: message, onChange: (event) => {
                        setMessage(event.target.value);
                        setSent(false);
                    }, placeholder: copy.composer.placeholder, className: "h-[96px] w-full resize-none bg-transparent px-[16px] py-[14px] text-[14px] leading-[1.5] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black400)]" }), _jsx("div", { className: "flex flex-wrap gap-[6px] border-t border-[var(--adaptive-border-subtle)] p-[10px]", children: copy.composer.categories.map((label, index) => (_jsx("button", { type: "button", "aria-pressed": category === index, onClick: () => setCategory(index), className: `rounded-[8px] border px-[10px] py-[5px] text-[11px] ${category === index
                            ? "border-[var(--adaptive-black900)] bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]"
                            : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-black600)]"}`, children: label }, label))) }), _jsxs("div", { className: "flex items-center justify-between border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]", children: [_jsx("span", { className: `text-[11px] ${sent ? "text-[var(--adaptive-green500)]" : "text-[var(--adaptive-black400)]"}`, children: sent ? "✓" : `@ ${copy.marker.author}` }), _jsx("button", { type: "button", "aria-label": copy.composer.send, onClick: () => setSent(true), className: "flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]", children: _jsx(SendIcon, { className: "h-[18px] w-[18px]" }) })] })] }) }));
}
function PanelOverviewScene({ copy, locale }) {
    const messages = locale === "ko" ? ko : en;
    const tabs = ["overview", "api-flow"];
    const [activeTab, setActiveTab] = useState("overview");
    const counts = [0, 2, 1, 3, 1, 2, 4];
    return (_jsx("div", { className: "flex h-full items-center justify-center p-[8px]", children: _jsxs("article", { className: `w-full ${PANEL_SURFACE}`, children: [_jsx(WindowHeader, { title: "fivepixels.", copy: copy, icon: _jsx("span", { className: "rounded-[4px] bg-[#ff5a36] px-[3px] text-[10px] font-black text-white", children: "fp." }) }), _jsx("div", { className: "grid grid-cols-3 border-b border-[var(--adaptive-border-subtle)] py-[10px] text-center", children: [
                        [copy.panel.created, 6],
                        [copy.panel.replied, 2],
                        [copy.panel.assigned, 1],
                    ].map(([label, value]) => (_jsxs("div", { className: "border-r border-[var(--adaptive-border-subtle)] last:border-r-0", children: [_jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: label }), _jsx("p", { className: "mt-[4px] text-[18px] font-bold text-[var(--adaptive-black900)]", children: value })] }, label))) }), _jsx(PanelTabs, { tabs: tabs, activeTab: activeTab, messages: messages, onTabClick: setActiveTab }), activeTab === "overview" ? (_jsxs("div", { className: "p-[12px]", children: [_jsxs("div", { className: "mb-[8px] grid grid-cols-[1fr_64px_64px] gap-[4px] text-[10px] text-[var(--adaptive-black500)]", children: [_jsx("span", { children: "/" }), _jsx("span", { children: copy.panel.today }), _jsx("span", { children: copy.panel.yesterday })] }), copy.panel.statuses.map((label, index) => (_jsxs("div", { className: "grid grid-cols-[1fr_64px_64px] items-center border-t border-[var(--adaptive-border-subtle)] py-[9px] text-[12px]", children: [_jsx("span", { className: "text-[var(--adaptive-black600)]", children: label }), _jsx("strong", { children: counts[index] }), _jsx("span", { className: "text-[var(--adaptive-black500)]", children: index % 3 })] }, label)))] })) : (_jsx("div", { className: "space-y-[8px] p-[14px]", children: ["GET /feedbacks 200", "POST /feedbacks 201", "PATCH /cases/1 200", "GET /members 200"].map((item, index) => (_jsxs("div", { className: "flex items-center gap-[8px] rounded-[8px] bg-[var(--adaptive-black100)] px-[10px] py-[9px] text-[11px]", children: [_jsx("span", { className: `h-[7px] w-[7px] rounded-full ${index === 2 ? "bg-amber-400" : "bg-[var(--adaptive-green500)]"}` }), _jsx("code", { children: item }), _jsxs("span", { className: "ml-auto text-[var(--adaptive-black400)]", children: [32 + index * 18, "ms"] })] }, item))) })), _jsxs("footer", { className: "flex justify-center gap-[10px] border-t border-[var(--adaptive-border-subtle)] px-[10px] py-[8px] text-[10px] text-[var(--adaptive-black400)]", children: [_jsx("span", { children: copy.panel.project }), _jsx("span", { children: "0.2.23" }), _jsx("span", { children: copy.panel.environment })] })] }) }));
}
function ElementInspectorScene({ copy }) {
    const [padding, setPadding] = useState(8);
    const [accent, setAccent] = useState(false);
    return (_jsxs("div", { className: "flex h-full flex-col justify-center gap-[12px] px-[12px]", children: [_jsxs("article", { className: `p-[14px] ${PANEL_SURFACE}`, children: [_jsxs("div", { className: "mb-[10px] flex items-center gap-[8px] text-[12px] text-[var(--adaptive-black500)]", children: [_jsx("strong", { className: "text-[var(--adaptive-black900)]", children: copy.notifications.activity }), _jsx("span", { className: "ml-auto rounded-full bg-[var(--adaptive-blue100)] px-[7px] py-[3px] text-[10px] text-[var(--adaptive-blue600)]", children: "3" })] }), copy.inspector.recent.map((item) => (_jsxs("button", { type: "button", className: "flex w-full items-center gap-[8px] border-t border-[var(--adaptive-border-subtle)] py-[8px] text-left text-[11px] text-[var(--adaptive-black700)]", children: [_jsx("span", { className: "h-[6px] w-[6px] shrink-0 rounded-full bg-[#ff5a36]" }), _jsx("span", { className: "min-w-0 flex-1 truncate", children: item }), _jsx("span", { className: "text-[10px] text-[var(--adaptive-black400)]", children: copy.marker.category })] }, item)))] }), _jsxs("article", { className: `p-[14px] ${PANEL_SURFACE}`, children: [_jsxs("div", { className: "mb-[10px] flex items-center justify-between", children: [_jsx("code", { className: "text-[13px] text-[var(--adaptive-blue600)]", children: "<div>" }), _jsx("button", { type: "button", onClick: () => { setPadding(8); setAccent(false); }, className: "text-[11px] text-[var(--adaptive-black500)] underline", children: copy.inspector.reset })] }), _jsx("dl", { className: "space-y-[7px] text-[12px]", children: [
                            [copy.inspector.tag, "div"],
                            [copy.inspector.size, `${640 + padding}px × ${45 + padding}px`],
                            [copy.inspector.display, "flex"],
                            [copy.inspector.padding, `${padding}px`],
                            [copy.inspector.margin, "0px"],
                            [copy.inspector.reportId, "checkout-actions"],
                        ].map(([label, value]) => (_jsxs("div", { className: "flex gap-[12px]", children: [_jsx("dt", { className: "w-[112px] text-[var(--adaptive-black500)]", children: label }), _jsx("dd", { className: "min-w-0 flex-1 truncate text-right text-[var(--adaptive-black800)]", children: value })] }, label))) }), _jsxs("div", { className: "mt-[12px] flex items-center gap-[8px] border-t border-[var(--adaptive-border-subtle)] pt-[12px]", children: [_jsx("button", { type: "button", onClick: () => setPadding((value) => Math.max(0, value - 2)), className: "h-[30px] w-[30px] rounded-[7px] bg-[var(--adaptive-black100)]", children: "\u2212" }), _jsxs("span", { className: "text-[11px] text-[var(--adaptive-black600)]", children: [copy.inspector.spacing, " ", padding, "px"] }), _jsx("button", { type: "button", onClick: () => setPadding((value) => value + 2), className: "h-[30px] w-[30px] rounded-[7px] bg-[var(--adaptive-black100)]", children: "+" }), _jsx("button", { type: "button", "aria-pressed": accent, onClick: () => setAccent((value) => !value), className: `ml-auto h-[30px] rounded-[7px] px-[10px] text-[11px] ${accent ? "bg-[#ff5a36] text-white" : "bg-[var(--adaptive-black100)]"}`, children: copy.inspector.color })] })] })] }));
}
function scaleChrome(chrome, scale) {
    const scaleButtons = (buttons) => buttons?.map((button) => ({ ...button, height: button.height * scale }));
    const scaleHorizontalButtons = (buttons) => buttons?.map((button) => ({ ...button, width: button.width * scale }));
    return {
        frameRadius: chrome.frameRadius * scale,
        screenRadius: chrome.screenRadius * scale,
        bezel: {
            top: chrome.bezel.top * scale,
            right: chrome.bezel.right * scale,
            bottom: chrome.bezel.bottom * scale,
            left: chrome.bezel.left * scale,
        },
        buttons: chrome.buttons
            ? {
                left: scaleButtons(chrome.buttons.left),
                right: scaleButtons(chrome.buttons.right),
                top: scaleHorizontalButtons(chrome.buttons.top),
                bottom: scaleHorizontalButtons(chrome.buttons.bottom),
            }
            : undefined,
    };
}
function DevicePreviewScene({ copy }) {
    const [presetId, setPresetId] = useState("iphone-14");
    const preset = (DEMO_DEVICE_PRESETS.find((item) => item.id === presetId) ?? DEMO_DEVICE_PRESETS[0]);
    const scale = 0.55;
    const screenWidth = preset.width * scale;
    const screenHeight = preset.height * scale;
    const chrome = scaleChrome(preset.chrome, scale);
    const frameWidth = screenWidth + chrome.bezel.left + chrome.bezel.right;
    const frameHeight = screenHeight + chrome.bezel.top + chrome.bezel.bottom;
    return (_jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-[14px]", children: [_jsxs("article", { className: `w-[360px] ${PANEL_SURFACE}`, children: [_jsxs("div", { className: "flex items-center gap-[8px] px-[12px] py-[9px]", children: [_jsx(DevicePreviewIcon, { className: "h-[17px] w-[17px]" }), _jsx("select", { value: presetId, onChange: (event) => setPresetId(event.target.value), className: "min-w-0 flex-1 bg-transparent text-[12px] outline-none", children: DEMO_DEVICE_PRESETS.map((item) => _jsx("option", { value: item.id, children: item.label }, item.id)) }), _jsx(WindowModeControls, { closeAriaLabel: copy.close, minimizeAriaLabel: copy.minimize, maximizeAriaLabel: copy.maximize, isMaximized: false, showMaximize: false, onClose: () => undefined, onMinimize: () => undefined })] }), _jsxs("div", { className: "flex items-center border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]", children: [_jsx("code", { className: "min-w-0 flex-1 truncate text-[11px] text-[var(--adaptive-black500)]", children: copy.device.url }), _jsx("button", { type: "button", className: "text-[11px] text-[var(--adaptive-blue600)]", children: copy.device.go })] })] }), _jsxs("div", { className: "relative", style: { width: frameWidth, height: frameHeight }, children: [_jsx("div", { className: "absolute overflow-hidden bg-[var(--adaptive-surface)]", style: {
                            left: chrome.bezel.left,
                            top: chrome.bezel.top,
                            width: screenWidth,
                            height: screenHeight,
                            borderRadius: chrome.screenRadius,
                        }, children: _jsxs("div", { className: "flex h-full flex-col px-[12px] pb-[12px] pt-[34px]", children: [_jsx("strong", { className: "text-[14px] text-[var(--adaptive-black900)]", children: copy.device.previewTitle }), _jsx("div", { className: "mt-[14px] grid gap-[8px]", children: copy.device.cards.map((label, index) => (_jsxs("div", { className: "rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[10px]", children: [_jsx("p", { className: "text-[9px] text-[var(--adaptive-black500)]", children: label }), _jsxs("p", { className: "mt-[6px] text-[16px] font-bold text-[var(--adaptive-black900)]", children: [[18.4, 12, 34][index], index === 0 ? "%" : ""] }), _jsx("div", { className: "mt-[8px] h-[3px] overflow-hidden rounded-full bg-[var(--adaptive-black100)]", children: _jsx("div", { className: "h-full rounded-full bg-[var(--adaptive-blue500)]", style: { width: `${45 + index * 18}%` } }) })] }, label))) })] }) }), _jsx(DeviceFrameArtwork, { preset: preset, chrome: chrome, screenWidth: screenWidth, screenHeight: screenHeight })] })] }));
}
function FeedbackThreadScene({ copy }) {
    const [reply, setReply] = useState("");
    const [addedReplies, setAddedReplies] = useState([]);
    const [selected, setSelected] = useState("case");
    const replies = [copy.thread.reply, ...addedReplies];
    return (_jsx("div", { className: "flex h-full items-center justify-center p-[8px]", children: _jsxs("article", { className: `grid h-[486px] w-full grid-cols-[210px_1fr] ${PANEL_SURFACE}`, children: [_jsxs("aside", { className: "flex flex-col border-r border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[14px]", children: [_jsx(WindowModeControls, { closeAriaLabel: copy.close, minimizeAriaLabel: copy.minimize, maximizeAriaLabel: copy.maximize, isMaximized: false, onClose: () => undefined, onMinimize: () => undefined, onMaximize: () => undefined }), [copy.thread.newCase, copy.thread.share, copy.thread.askAi].map((label, index) => (_jsxs("button", { type: "button", className: "mt-[10px] flex items-center gap-[8px] rounded-[8px] px-[8px] py-[7px] text-left text-[12px] hover:bg-[var(--adaptive-black100)]", children: [index === 0 ? "+" : index === 1 ? _jsx(LinkIcon, { className: "h-[14px] w-[14px]" }) : _jsx(AskAiIcon, { className: "h-[14px] w-[14px]" }), label] }, label))), _jsx("div", { className: "mt-[18px] text-[10px] uppercase text-[var(--adaptive-black400)]", children: copy.thread.caseLabel }), _jsxs("button", { type: "button", "aria-pressed": selected === "case", onClick: () => setSelected("case"), className: "mt-[6px] rounded-[10px] bg-[var(--adaptive-surface)] p-[10px] text-left shadow-sm", children: [_jsx("p", { className: "truncate text-[12px] text-[var(--adaptive-black900)]", children: copy.thread.title }), _jsx("p", { className: "mt-[6px] text-[10px] text-[var(--adaptive-black400)]", children: copy.marker.age })] }), _jsxs("button", { type: "button", className: "mt-auto flex items-center gap-[6px] text-[11px] text-[var(--adaptive-black500)]", children: [_jsx(DeleteIcon, { className: "h-[14px] w-[14px]", fill: "currentColor" }), copy.thread.delete] })] }), _jsxs("section", { className: "flex min-w-0 flex-col", children: [_jsxs("header", { className: "border-b border-[var(--adaptive-border-subtle)] px-[16px] py-[14px]", children: [_jsx("strong", { className: "block truncate text-[14px] text-[var(--adaptive-black900)]", children: copy.thread.title }), _jsx("span", { className: "mt-[5px] block text-[10px] text-[var(--adaptive-black400)]", children: copy.thread.unassigned })] }), _jsxs("div", { className: "min-h-0 flex-1 space-y-[12px] overflow-auto p-[16px]", children: [_jsxs("div", { className: "ml-auto max-w-[320px] rounded-[14px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] p-[12px]", children: [_jsxs("div", { className: "flex items-center gap-[6px] text-[10px] text-[var(--adaptive-black400)]", children: [_jsx("span", { children: copy.thread.score }), _jsx("span", { className: "ml-auto rounded-full bg-[var(--adaptive-blue100)] px-[6px] py-[2px] text-[var(--adaptive-blue600)]", children: copy.thread.mine }), _jsx("span", { children: copy.thread.creator })] }), _jsx("p", { className: "mt-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-black800)]", children: copy.thread.message }), _jsxs("div", { className: "mt-[10px] text-right text-[10px] text-[var(--adaptive-green500)]", children: ["\u25CF ", copy.thread.askAi] })] }), replies.map((item, index) => (_jsxs("div", { className: "max-w-[340px] rounded-[14px] bg-[var(--adaptive-black100)] p-[12px]", children: [_jsxs("div", { className: "mb-[6px] flex items-center gap-[6px] text-[10px] text-[var(--adaptive-black400)]", children: [_jsx("strong", { className: "text-[var(--adaptive-black700)]", children: copy.marker.author }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: copy.panel.today })] }), _jsx("p", { className: "text-[12px] leading-[1.5] text-[var(--adaptive-black800)]", children: item })] }, `${item}-${index}`)))] }), _jsxs("form", { className: "flex items-center gap-[8px] border-t border-[var(--adaptive-border-subtle)] p-[12px]", onSubmit: (event) => {
                                event.preventDefault();
                                if (reply.trim()) {
                                    setAddedReplies((items) => [...items, reply.trim()]);
                                    setReply("");
                                }
                            }, children: [_jsx("input", { value: reply, onChange: (event) => setReply(event.target.value), placeholder: copy.thread.replyPlaceholder, className: "h-[36px] min-w-0 flex-1 rounded-full bg-[var(--adaptive-black100)] px-[14px] text-[12px] outline-none" }), _jsx("button", { type: "submit", "aria-label": copy.composer.send, className: "flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]", children: _jsx(SendIcon, { className: "h-[17px] w-[17px]" }) })] })] })] }) }));
}
function SettingsScene({ copy }) {
    const [appearance, setAppearance] = useState("light");
    const [shape, setShape] = useState("circle");
    const [size, setSize] = useState(1);
    return (_jsx("div", { className: "flex h-full items-center justify-center p-[12px]", children: _jsxs("article", { className: `w-full p-[16px] ${PANEL_SURFACE}`, children: [_jsxs("div", { className: "mb-[16px] flex items-center gap-[8px]", children: [_jsx(SettingsIcon, { className: "h-[17px] w-[17px]" }), _jsx("strong", { className: "text-[14px] text-[var(--adaptive-black900)]", children: copy.settings.title })] }), _jsxs("section", { children: [_jsx("p", { className: "mb-[8px] text-[11px] text-[var(--adaptive-black500)]", children: copy.settings.appearance }), _jsx(AppearanceThemePicker, { options: ["light", "dark", "system"].map((value, index) => ({ value, label: copy.settings.themeOptions[index] })), value: appearance, onChange: setAppearance, ariaLabel: copy.settings.appearance })] }), _jsxs("section", { className: "mt-[16px] border-t border-[var(--adaptive-border-subtle)] pt-[14px]", children: [_jsx("p", { className: "mb-[8px] text-[11px] text-[var(--adaptive-black500)]", children: copy.settings.markerShape }), _jsx(MarkerShapePicker, { value: shape, onChange: setShape, labels: copy.settings.shapeLabels, ariaLabel: copy.settings.markerShape, previewColor: "#ff5a36" })] }), _jsxs("section", { className: "mt-[16px] border-t border-[var(--adaptive-border-subtle)] pt-[14px]", children: [_jsxs("div", { className: "mb-[8px] flex items-center justify-between text-[11px] text-[var(--adaptive-black500)]", children: [_jsx("span", { children: copy.settings.markerSize }), _jsx("strong", { children: copy.settings.sizes[size] })] }), _jsx("input", { type: "range", min: "0", max: "2", step: "1", value: size, onChange: (event) => setSize(Number(event.target.value)), "aria-label": copy.settings.markerSize, className: "w-full accent-[#ff5a36]" })] })] }) }));
}
function NotificationsScene({ copy }) {
    const [hidden, setHidden] = useState(true);
    const [networkError, setNetworkError] = useState(true);
    return (_jsxs("div", { className: "flex h-full flex-col justify-center gap-[10px] px-[10px]", children: [_jsxs("div", { className: PANEL_SURFACE, children: [_jsx(PanelStatusBanner, { message: copy.notifications.editMode, roundedTop: true, actions: [
                            { id: "reset", label: copy.notifications.reset, onClick: () => undefined },
                            { id: "undo", label: "↶", ariaLabel: copy.notifications.undo, onClick: () => undefined },
                            { id: "redo", label: "↷", ariaLabel: copy.notifications.redo, onClick: () => undefined },
                        ] }), hidden ? (_jsx(PanelStatusBanner, { message: copy.notifications.hiddenMarkers, actions: [{ id: "show", label: copy.notifications.show, onClick: () => setHidden(false) }] })) : null, networkError ? (_jsxs("div", { className: "flex items-center gap-[8px] bg-rose-500/10 px-[12px] py-[10px] text-[11px] text-rose-600", children: [_jsx("span", { className: "min-w-0 flex-1", children: copy.notifications.networkError }), _jsx("button", { type: "button", onClick: () => setNetworkError(false), className: "rounded-[6px] bg-rose-500 px-[8px] py-[4px] text-white", children: copy.notifications.retry })] })) : null] }), _jsxs("article", { className: `p-[14px] ${PANEL_SURFACE}`, children: [_jsxs("div", { className: "mb-[8px] flex items-center gap-[8px]", children: [_jsx(NotificationActiveIcon, { className: "h-[17px] w-[17px] text-[#ff5a36]" }), _jsx("strong", { className: "text-[13px] text-[var(--adaptive-black900)]", children: copy.notifications.activity })] }), copy.notifications.activityItems.map((item, index) => (_jsxs("div", { className: "flex items-start gap-[9px] border-t border-[var(--adaptive-border-subtle)] py-[9px]", children: [_jsx("span", { className: `mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${index === 2 ? "bg-[var(--adaptive-black900)] text-white" : "bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue600)]"}`, children: index === 2 ? _jsx(GitHubIcon, { className: "h-[10px] w-[10px]" }) : _jsx(CheckIcon, { className: "h-[10px] w-[10px]" }) }), _jsx("span", { className: "text-[11px] leading-[1.45] text-[var(--adaptive-black700)]", children: item })] }, item)))] })] }));
}
export function DemoScene({ scene, locale, copy }) {
    switch (scene) {
        case "marker-tooltip":
            return _jsx(MarkerTooltipScene, { copy: copy });
        case "feedback-composer":
            return _jsx(FeedbackComposerScene, { copy: copy });
        case "panel-overview":
            return _jsx(PanelOverviewScene, { copy: copy, locale: locale });
        case "element-inspector":
            return _jsx(ElementInspectorScene, { copy: copy });
        case "device-preview":
            return _jsx(DevicePreviewScene, { copy: copy });
        case "feedback-thread":
            return _jsx(FeedbackThreadScene, { copy: copy });
        case "settings":
            return _jsx(SettingsScene, { copy: copy });
        case "notifications":
            return _jsx(NotificationsScene, { copy: copy });
    }
}
//# sourceMappingURL=DemoScenes.js.map