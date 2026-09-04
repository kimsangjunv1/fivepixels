import { useState, type ReactNode } from "react";
import {
    AskAiIcon,
    CheckIcon,
    ChevronDownIcon,
    DeleteIcon,
    DevicePreviewIcon,
    EditIcon,
    GitHubIcon,
    LinkIcon,
    NotificationActiveIcon,
    SendIcon,
    SettingsIcon,
} from "@/shared/components/icons/Icons.js";
import { DEVICE_PREVIEW_PRESETS, type DeviceChromeSpec, type DevicePreviewPreset } from "@/shared/constants/devicePreview.js";
import type { MarkerShape } from "@/shared/constants/markerAppearance.js";
import type { UserSelectablePanelTab } from "@/shared/constants/panelTabRegistry.js";
import { en } from "@/shared/i18n/en.js";
import { ko } from "@/shared/i18n/ko.js";
import type { ReportLocale } from "@/shared/i18n/types.js";
import type { ReportAppearance } from "@/shared/types/report.js";
import type { ReportPanelTab } from "@/shared/types/report-ui.js";
import { MarkerShapeGlyph } from "@/surfaces/marker/MarkerShapeGlyph.js";
import { AppearanceThemePicker } from "@/surfaces/panel/AppearanceThemePicker.js";
import { MarkerShapePicker } from "@/surfaces/panel/MarkerShapePicker.js";
import { PanelStatusBanner } from "@/surfaces/panel/PanelStatusBanner.js";
import { PanelTabs } from "@/surfaces/panel/PanelTabs.js";
import { DeviceFrameArtwork } from "@/surfaces/preview/DeviceFrameArtwork.js";
import { WindowModeControls } from "@/surfaces/window/WindowModeControls.js";
import type { DemoCopy } from "./fixtures.js";
import type { FivePixelsDemoScene } from "./types.js";

type DemoSceneProps = {
    scene: FivePixelsDemoScene;
    locale: ReportLocale;
    copy: DemoCopy;
};

const PANEL_SURFACE =
    "pointer-events-auto overflow-hidden rounded-[18px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-fillOpacity700)] shadow-[var(--adaptive-popup-shadow)] backdrop-blur-[20px]";

const DEMO_DEVICE_PRESETS = DEVICE_PREVIEW_PRESETS.filter(
    (preset) => preset.id === "iphone-14" || preset.id === "galaxy-s24",
);

function WindowHeader({ title, copy, icon }: { title: string; copy: DemoCopy; icon?: ReactNode }) {
    const [mode, setMode] = useState<"normal" | "minimized" | "maximized">("normal");

    return (
        <header className="flex min-h-[44px] items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px]">
            {icon ? <span className="flex h-[24px] w-[24px] items-center justify-center text-[var(--adaptive-black800)]">{icon}</span> : null}
            <strong className="min-w-0 flex-1 truncate text-[13px] text-[var(--adaptive-black900)]">{mode === "minimized" ? "…" : title}</strong>
            <WindowModeControls
                closeAriaLabel={copy.close}
                minimizeAriaLabel={copy.minimize}
                maximizeAriaLabel={copy.maximize}
                isMaximized={mode === "maximized"}
                onClose={() => setMode("minimized")}
                onMinimize={() => setMode((current) => (current === "minimized" ? "normal" : "minimized"))}
                onMaximize={() => setMode((current) => (current === "maximized" ? "normal" : "maximized"))}
            />
        </header>
    );
}

function MarkerTooltipScene({ copy }: { copy: DemoCopy }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="relative h-full w-full">
            <button
                type="button"
                aria-label={copy.marker.title}
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className="absolute bottom-[28px] left-[40px] flex h-[44px] w-[44px] items-center justify-center"
            >
                <MarkerShapeGlyph
                    shape="circle"
                    fill="#ff2d55"
                    width={40}
                    height={40}
                    style={{ filter: "drop-shadow(0 7px 14px #00000040)" }}
                />
                <span className="absolute text-[12px] font-bold text-white">1</span>
                <span className="absolute -right-[1px] -top-[1px] h-[12px] w-[12px] rounded-full border-2 border-white bg-[#7657ff]" />
            </button>

            {open ? (
                <article className={`absolute left-[76px] top-[26px] w-[286px] p-[14px] ${PANEL_SURFACE}`}>
                    <div className="mb-[10px] flex items-center gap-[8px]">
                        <strong className="min-w-0 flex-1 truncate text-[14px] text-[var(--adaptive-black900)]">{copy.marker.title}</strong>
                        <span className="rounded-full bg-[var(--adaptive-blue100)] px-[8px] py-[4px] text-[10px] text-[var(--adaptive-blue600)]">{copy.marker.category}</span>
                    </div>
                    <div className="flex items-center gap-[6px] text-[11px] text-[var(--adaptive-black500)]">
                        <span>{copy.marker.author}</span>
                        <span>·</span>
                        <span>{copy.marker.age}</span>
                        <span className="ml-auto text-[var(--adaptive-blue600)]">{copy.marker.score} 72</span>
                    </div>
                </article>
            ) : null}
        </div>
    );
}

function FeedbackComposerScene({ copy }: { copy: DemoCopy }) {
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState(2);
    const [sent, setSent] = useState(false);

    return (
        <div className="flex h-full items-center justify-center p-[10px]">
            <article className={`w-full ${PANEL_SURFACE}`}>
                <div className="flex items-center gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[14px] py-[10px]">
                    <button type="button" className="text-[18px] text-[var(--adaptive-black700)]">+</button>
                    <button type="button" className="flex items-center gap-[4px] text-[12px] text-[var(--adaptive-black700)]">
                        {copy.composer.caseLabel}
                        <ChevronDownIcon className="h-[13px] w-[13px]" />
                    </button>
                </div>
                <textarea
                    value={message}
                    onChange={(event) => {
                        setMessage(event.target.value);
                        setSent(false);
                    }}
                    placeholder={copy.composer.placeholder}
                    className="h-[96px] w-full resize-none bg-transparent px-[16px] py-[14px] text-[14px] leading-[1.5] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black400)]"
                />
                <div className="flex flex-wrap gap-[6px] border-t border-[var(--adaptive-border-subtle)] p-[10px]">
                    {copy.composer.categories.map((label, index) => (
                        <button
                            key={label}
                            type="button"
                            aria-pressed={category === index}
                            onClick={() => setCategory(index)}
                            className={`rounded-[8px] border px-[10px] py-[5px] text-[11px] ${
                                category === index
                                    ? "border-[var(--adaptive-black900)] bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]"
                                    : "border-[var(--adaptive-border-subtle)] text-[var(--adaptive-black600)]"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center justify-between border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                    <span className={`text-[11px] ${sent ? "text-[var(--adaptive-green500)]" : "text-[var(--adaptive-black400)]"}`}>
                        {sent ? "✓" : `@ ${copy.marker.author}`}
                    </span>
                    <button
                        type="button"
                        aria-label={copy.composer.send}
                        onClick={() => setSent(true)}
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]"
                    >
                        <SendIcon className="h-[18px] w-[18px]" />
                    </button>
                </div>
            </article>
        </div>
    );
}

function PanelOverviewScene({ copy, locale }: { copy: DemoCopy; locale: ReportLocale }) {
    const messages = locale === "ko" ? ko : en;
    const tabs: UserSelectablePanelTab[] = ["overview", "api-flow"];
    const [activeTab, setActiveTab] = useState<ReportPanelTab>("overview");
    const counts = [0, 2, 1, 3, 1, 2, 4];

    return (
        <div className="flex h-full items-center justify-center p-[8px]">
            <article className={`w-full ${PANEL_SURFACE}`}>
                <WindowHeader
                    title="fivepixels."
                    copy={copy}
                    icon={<span className="rounded-[4px] bg-[#ff5a36] px-[3px] text-[10px] font-black text-white">fp.</span>}
                />
                <div className="grid grid-cols-3 border-b border-[var(--adaptive-border-subtle)] py-[10px] text-center">
                    {[
                        [copy.panel.created, 6],
                        [copy.panel.replied, 2],
                        [copy.panel.assigned, 1],
                    ].map(([label, value]) => (
                        <div key={label} className="border-r border-[var(--adaptive-border-subtle)] last:border-r-0">
                            <p className="text-[11px] text-[var(--adaptive-black500)]">{label}</p>
                            <p className="mt-[4px] text-[18px] font-bold text-[var(--adaptive-black900)]">{value}</p>
                        </div>
                    ))}
                </div>
                <PanelTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    messages={messages}
                    onTabClick={setActiveTab}
                />
                {activeTab === "overview" ? (
                    <div className="p-[12px]">
                        <div className="mb-[8px] grid grid-cols-[1fr_64px_64px] gap-[4px] text-[10px] text-[var(--adaptive-black500)]">
                            <span>/</span><span>{copy.panel.today}</span><span>{copy.panel.yesterday}</span>
                        </div>
                        {copy.panel.statuses.map((label, index) => (
                            <div key={label} className="grid grid-cols-[1fr_64px_64px] items-center border-t border-[var(--adaptive-border-subtle)] py-[9px] text-[12px]">
                                <span className="text-[var(--adaptive-black600)]">{label}</span>
                                <strong>{counts[index]}</strong>
                                <span className="text-[var(--adaptive-black500)]">{index % 3}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-[8px] p-[14px]">
                        {["GET /feedbacks 200", "POST /feedbacks 201", "PATCH /cases/1 200", "GET /members 200"].map((item, index) => (
                            <div key={item} className="flex items-center gap-[8px] rounded-[8px] bg-[var(--adaptive-black100)] px-[10px] py-[9px] text-[11px]">
                                <span className={`h-[7px] w-[7px] rounded-full ${index === 2 ? "bg-amber-400" : "bg-[var(--adaptive-green500)]"}`} />
                                <code>{item}</code>
                                <span className="ml-auto text-[var(--adaptive-black400)]">{32 + index * 18}ms</span>
                            </div>
                        ))}
                    </div>
                )}
                <footer className="flex justify-center gap-[10px] border-t border-[var(--adaptive-border-subtle)] px-[10px] py-[8px] text-[10px] text-[var(--adaptive-black400)]">
                    <span>{copy.panel.project}</span><span>0.2.23</span><span>{copy.panel.environment}</span>
                </footer>
            </article>
        </div>
    );
}

function ElementInspectorScene({ copy }: { copy: DemoCopy }) {
    const [padding, setPadding] = useState(8);
    const [accent, setAccent] = useState(false);

    return (
        <div className="flex h-full flex-col justify-center gap-[12px] px-[12px]">
            <article className={`p-[14px] ${PANEL_SURFACE}`}>
                <div className="mb-[10px] flex items-center gap-[8px] text-[12px] text-[var(--adaptive-black500)]">
                    <strong className="text-[var(--adaptive-black900)]">{copy.notifications.activity}</strong>
                    <span className="ml-auto rounded-full bg-[var(--adaptive-blue100)] px-[7px] py-[3px] text-[10px] text-[var(--adaptive-blue600)]">3</span>
                </div>
                {copy.inspector.recent.map((item) => (
                    <button key={item} type="button" className="flex w-full items-center gap-[8px] border-t border-[var(--adaptive-border-subtle)] py-[8px] text-left text-[11px] text-[var(--adaptive-black700)]">
                        <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#ff5a36]" />
                        <span className="min-w-0 flex-1 truncate">{item}</span>
                        <span className="text-[10px] text-[var(--adaptive-black400)]">{copy.marker.category}</span>
                    </button>
                ))}
            </article>

            <article className={`p-[14px] ${PANEL_SURFACE}`}>
                <div className="mb-[10px] flex items-center justify-between">
                    <code className="text-[13px] text-[var(--adaptive-blue600)]">&lt;div&gt;</code>
                    <button type="button" onClick={() => { setPadding(8); setAccent(false); }} className="text-[11px] text-[var(--adaptive-black500)] underline">{copy.inspector.reset}</button>
                </div>
                <dl className="space-y-[7px] text-[12px]">
                    {[
                        [copy.inspector.tag, "div"],
                        [copy.inspector.size, `${640 + padding}px × ${45 + padding}px`],
                        [copy.inspector.display, "flex"],
                        [copy.inspector.padding, `${padding}px`],
                        [copy.inspector.margin, "0px"],
                        [copy.inspector.reportId, "checkout-actions"],
                    ].map(([label, value]) => (
                        <div key={label} className="flex gap-[12px]">
                            <dt className="w-[112px] text-[var(--adaptive-black500)]">{label}</dt>
                            <dd className="min-w-0 flex-1 truncate text-right text-[var(--adaptive-black800)]">{value}</dd>
                        </div>
                    ))}
                </dl>
                <div className="mt-[12px] flex items-center gap-[8px] border-t border-[var(--adaptive-border-subtle)] pt-[12px]">
                    <button type="button" onClick={() => setPadding((value) => Math.max(0, value - 2))} className="h-[30px] w-[30px] rounded-[7px] bg-[var(--adaptive-black100)]">−</button>
                    <span className="text-[11px] text-[var(--adaptive-black600)]">{copy.inspector.spacing} {padding}px</span>
                    <button type="button" onClick={() => setPadding((value) => value + 2)} className="h-[30px] w-[30px] rounded-[7px] bg-[var(--adaptive-black100)]">+</button>
                    <button
                        type="button"
                        aria-pressed={accent}
                        onClick={() => setAccent((value) => !value)}
                        className={`ml-auto h-[30px] rounded-[7px] px-[10px] text-[11px] ${accent ? "bg-[#ff5a36] text-white" : "bg-[var(--adaptive-black100)]"}`}
                    >
                        {copy.inspector.color}
                    </button>
                </div>
            </article>
        </div>
    );
}

function scaleChrome(chrome: DeviceChromeSpec, scale: number): DeviceChromeSpec {
    const scaleButtons = (buttons?: Array<{ topRatio: number; height: number }>) => buttons?.map((button) => ({ ...button, height: button.height * scale }));
    const scaleHorizontalButtons = (buttons?: Array<{ leftRatio: number; width: number }>) => buttons?.map((button) => ({ ...button, width: button.width * scale }));

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

function DevicePreviewScene({ copy }: { copy: DemoCopy }) {
    const [presetId, setPresetId] = useState("iphone-14");
    const preset = (DEMO_DEVICE_PRESETS.find((item) => item.id === presetId) ?? DEMO_DEVICE_PRESETS[0]) as DevicePreviewPreset;
    const scale = 0.55;
    const screenWidth = preset.width * scale;
    const screenHeight = preset.height * scale;
    const chrome = scaleChrome(preset.chrome, scale);
    const frameWidth = screenWidth + chrome.bezel.left + chrome.bezel.right;
    const frameHeight = screenHeight + chrome.bezel.top + chrome.bezel.bottom;

    return (
        <div className="flex h-full flex-col items-center justify-center gap-[14px]">
            <article className={`w-[360px] ${PANEL_SURFACE}`}>
                <div className="flex items-center gap-[8px] px-[12px] py-[9px]">
                    <DevicePreviewIcon className="h-[17px] w-[17px]" />
                    <select value={presetId} onChange={(event) => setPresetId(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[12px] outline-none">
                        {DEMO_DEVICE_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                    <WindowModeControls
                        closeAriaLabel={copy.close}
                        minimizeAriaLabel={copy.minimize}
                        maximizeAriaLabel={copy.maximize}
                        isMaximized={false}
                        showMaximize={false}
                        onClose={() => undefined}
                        onMinimize={() => undefined}
                    />
                </div>
                <div className="flex items-center border-t border-[var(--adaptive-border-subtle)] px-[12px] py-[8px]">
                    <code className="min-w-0 flex-1 truncate text-[11px] text-[var(--adaptive-black500)]">{copy.device.url}</code>
                    <button type="button" className="text-[11px] text-[var(--adaptive-blue600)]">{copy.device.go}</button>
                </div>
            </article>

            <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
                <div
                    className="absolute overflow-hidden bg-[var(--adaptive-surface)]"
                    style={{
                        left: chrome.bezel.left,
                        top: chrome.bezel.top,
                        width: screenWidth,
                        height: screenHeight,
                        borderRadius: chrome.screenRadius,
                    }}
                >
                    <div className="flex h-full flex-col px-[12px] pb-[12px] pt-[34px]">
                        <strong className="text-[14px] text-[var(--adaptive-black900)]">{copy.device.previewTitle}</strong>
                        <div className="mt-[14px] grid gap-[8px]">
                            {copy.device.cards.map((label, index) => (
                                <div key={label} className="rounded-[10px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[10px]">
                                    <p className="text-[9px] text-[var(--adaptive-black500)]">{label}</p>
                                    <p className="mt-[6px] text-[16px] font-bold text-[var(--adaptive-black900)]">{[18.4, 12, 34][index]}{index === 0 ? "%" : ""}</p>
                                    <div className="mt-[8px] h-[3px] overflow-hidden rounded-full bg-[var(--adaptive-black100)]">
                                        <div className="h-full rounded-full bg-[var(--adaptive-blue500)]" style={{ width: `${45 + index * 18}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DeviceFrameArtwork preset={preset} chrome={chrome} screenWidth={screenWidth} screenHeight={screenHeight} />
            </div>
        </div>
    );
}

function FeedbackThreadScene({ copy }: { copy: DemoCopy }) {
    const [reply, setReply] = useState("");
    const [addedReplies, setAddedReplies] = useState<string[]>([]);
    const [selected, setSelected] = useState("case");
    const replies = [copy.thread.reply, ...addedReplies];

    return (
        <div className="flex h-full items-center justify-center p-[8px]">
            <article className={`grid h-[486px] w-full grid-cols-[210px_1fr] ${PANEL_SURFACE}`}>
                <aside className="flex flex-col border-r border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] p-[14px]">
                    <WindowModeControls
                        closeAriaLabel={copy.close}
                        minimizeAriaLabel={copy.minimize}
                        maximizeAriaLabel={copy.maximize}
                        isMaximized={false}
                        onClose={() => undefined}
                        onMinimize={() => undefined}
                        onMaximize={() => undefined}
                    />
                    {[copy.thread.newCase, copy.thread.share, copy.thread.askAi].map((label, index) => (
                        <button key={label} type="button" className="mt-[10px] flex items-center gap-[8px] rounded-[8px] px-[8px] py-[7px] text-left text-[12px] hover:bg-[var(--adaptive-black100)]">
                            {index === 0 ? "+" : index === 1 ? <LinkIcon className="h-[14px] w-[14px]" /> : <AskAiIcon className="h-[14px] w-[14px]" />}
                            {label}
                        </button>
                    ))}
                    <div className="mt-[18px] text-[10px] uppercase text-[var(--adaptive-black400)]">{copy.thread.caseLabel}</div>
                    <button
                        type="button"
                        aria-pressed={selected === "case"}
                        onClick={() => setSelected("case")}
                        className="mt-[6px] rounded-[10px] bg-[var(--adaptive-surface)] p-[10px] text-left shadow-sm"
                    >
                        <p className="truncate text-[12px] text-[var(--adaptive-black900)]">{copy.thread.title}</p>
                        <p className="mt-[6px] text-[10px] text-[var(--adaptive-black400)]">{copy.marker.age}</p>
                    </button>
                    <button type="button" className="mt-auto flex items-center gap-[6px] text-[11px] text-[var(--adaptive-black500)]">
                        <DeleteIcon className="h-[14px] w-[14px]" fill="currentColor" />{copy.thread.delete}
                    </button>
                </aside>
                <section className="flex min-w-0 flex-col">
                    <header className="border-b border-[var(--adaptive-border-subtle)] px-[16px] py-[14px]">
                        <strong className="block truncate text-[14px] text-[var(--adaptive-black900)]">{copy.thread.title}</strong>
                        <span className="mt-[5px] block text-[10px] text-[var(--adaptive-black400)]">{copy.thread.unassigned}</span>
                    </header>
                    <div className="min-h-0 flex-1 space-y-[12px] overflow-auto p-[16px]">
                        <div className="ml-auto max-w-[320px] rounded-[14px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] p-[12px]">
                            <div className="flex items-center gap-[6px] text-[10px] text-[var(--adaptive-black400)]">
                                <span>{copy.thread.score}</span><span className="ml-auto rounded-full bg-[var(--adaptive-blue100)] px-[6px] py-[2px] text-[var(--adaptive-blue600)]">{copy.thread.mine}</span>
                                <span>{copy.thread.creator}</span>
                            </div>
                            <p className="mt-[8px] text-[12px] leading-[1.5] text-[var(--adaptive-black800)]">{copy.thread.message}</p>
                            <div className="mt-[10px] text-right text-[10px] text-[var(--adaptive-green500)]">● {copy.thread.askAi}</div>
                        </div>
                        {replies.map((item, index) => (
                            <div key={`${item}-${index}`} className="max-w-[340px] rounded-[14px] bg-[var(--adaptive-black100)] p-[12px]">
                                <div className="mb-[6px] flex items-center gap-[6px] text-[10px] text-[var(--adaptive-black400)]">
                                    <strong className="text-[var(--adaptive-black700)]">{copy.marker.author}</strong><span>·</span><span>{copy.panel.today}</span>
                                </div>
                                <p className="text-[12px] leading-[1.5] text-[var(--adaptive-black800)]">{item}</p>
                            </div>
                        ))}
                    </div>
                    <form
                        className="flex items-center gap-[8px] border-t border-[var(--adaptive-border-subtle)] p-[12px]"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (reply.trim()) {
                                setAddedReplies((items) => [...items, reply.trim()]);
                                setReply("");
                            }
                        }}
                    >
                        <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder={copy.thread.replyPlaceholder} className="h-[36px] min-w-0 flex-1 rounded-full bg-[var(--adaptive-black100)] px-[14px] text-[12px] outline-none" />
                        <button type="submit" aria-label={copy.composer.send} className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--adaptive-black900)] text-[var(--adaptive-surface)]"><SendIcon className="h-[17px] w-[17px]" /></button>
                    </form>
                </section>
            </article>
        </div>
    );
}

function SettingsScene({ copy }: { copy: DemoCopy }) {
    const [appearance, setAppearance] = useState<ReportAppearance>("light");
    const [shape, setShape] = useState<MarkerShape>("circle");
    const [size, setSize] = useState(1);

    return (
        <div className="flex h-full items-center justify-center p-[12px]">
            <article className={`w-full p-[16px] ${PANEL_SURFACE}`}>
                <div className="mb-[16px] flex items-center gap-[8px]">
                    <SettingsIcon className="h-[17px] w-[17px]" />
                    <strong className="text-[14px] text-[var(--adaptive-black900)]">{copy.settings.title}</strong>
                </div>
                <section>
                    <p className="mb-[8px] text-[11px] text-[var(--adaptive-black500)]">{copy.settings.appearance}</p>
                    <AppearanceThemePicker
                        options={(["light", "dark", "system"] as const).map((value, index) => ({ value, label: copy.settings.themeOptions[index] }))}
                        value={appearance}
                        onChange={setAppearance}
                        ariaLabel={copy.settings.appearance}
                    />
                </section>
                <section className="mt-[16px] border-t border-[var(--adaptive-border-subtle)] pt-[14px]">
                    <p className="mb-[8px] text-[11px] text-[var(--adaptive-black500)]">{copy.settings.markerShape}</p>
                    <MarkerShapePicker
                        value={shape}
                        onChange={setShape}
                        labels={copy.settings.shapeLabels}
                        ariaLabel={copy.settings.markerShape}
                        previewColor="#ff5a36"
                    />
                </section>
                <section className="mt-[16px] border-t border-[var(--adaptive-border-subtle)] pt-[14px]">
                    <div className="mb-[8px] flex items-center justify-between text-[11px] text-[var(--adaptive-black500)]"><span>{copy.settings.markerSize}</span><strong>{copy.settings.sizes[size]}</strong></div>
                    <input type="range" min="0" max="2" step="1" value={size} onChange={(event) => setSize(Number(event.target.value))} aria-label={copy.settings.markerSize} className="w-full accent-[#ff5a36]" />
                </section>
            </article>
        </div>
    );
}

function NotificationsScene({ copy }: { copy: DemoCopy }) {
    const [hidden, setHidden] = useState(true);
    const [networkError, setNetworkError] = useState(true);

    return (
        <div className="flex h-full flex-col justify-center gap-[10px] px-[10px]">
            <div className={PANEL_SURFACE}>
                <PanelStatusBanner
                    message={copy.notifications.editMode}
                    roundedTop
                    actions={[
                        { id: "reset", label: copy.notifications.reset, onClick: () => undefined },
                        { id: "undo", label: "↶", ariaLabel: copy.notifications.undo, onClick: () => undefined },
                        { id: "redo", label: "↷", ariaLabel: copy.notifications.redo, onClick: () => undefined },
                    ]}
                />
                {hidden ? (
                    <PanelStatusBanner
                        message={copy.notifications.hiddenMarkers}
                        actions={[{ id: "show", label: copy.notifications.show, onClick: () => setHidden(false) }]}
                    />
                ) : null}
                {networkError ? (
                    <div className="flex items-center gap-[8px] bg-rose-500/10 px-[12px] py-[10px] text-[11px] text-rose-600">
                        <span className="min-w-0 flex-1">{copy.notifications.networkError}</span>
                        <button type="button" onClick={() => setNetworkError(false)} className="rounded-[6px] bg-rose-500 px-[8px] py-[4px] text-white">{copy.notifications.retry}</button>
                    </div>
                ) : null}
            </div>
            <article className={`p-[14px] ${PANEL_SURFACE}`}>
                <div className="mb-[8px] flex items-center gap-[8px]">
                    <NotificationActiveIcon className="h-[17px] w-[17px] text-[#ff5a36]" />
                    <strong className="text-[13px] text-[var(--adaptive-black900)]">{copy.notifications.activity}</strong>
                </div>
                {copy.notifications.activityItems.map((item, index) => (
                    <div key={item} className="flex items-start gap-[9px] border-t border-[var(--adaptive-border-subtle)] py-[9px]">
                        <span className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${index === 2 ? "bg-[var(--adaptive-black900)] text-white" : "bg-[var(--adaptive-blue100)] text-[var(--adaptive-blue600)]"}`}>
                            {index === 2 ? <GitHubIcon className="h-[10px] w-[10px]" /> : <CheckIcon className="h-[10px] w-[10px]" />}
                        </span>
                        <span className="text-[11px] leading-[1.45] text-[var(--adaptive-black700)]">{item}</span>
                    </div>
                ))}
            </article>
        </div>
    );
}

export function DemoScene({ scene, locale, copy }: DemoSceneProps) {
    switch (scene) {
        case "marker-tooltip":
            return <MarkerTooltipScene copy={copy} />;
        case "feedback-composer":
            return <FeedbackComposerScene copy={copy} />;
        case "panel-overview":
            return <PanelOverviewScene copy={copy} locale={locale} />;
        case "element-inspector":
            return <ElementInspectorScene copy={copy} />;
        case "device-preview":
            return <DevicePreviewScene copy={copy} />;
        case "feedback-thread":
            return <FeedbackThreadScene copy={copy} />;
        case "settings":
            return <SettingsScene copy={copy} />;
        case "notifications":
            return <NotificationsScene copy={copy} />;
    }
}
