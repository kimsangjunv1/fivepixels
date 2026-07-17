import { useState, type ReactNode } from "react";
import type { ReportAppearance, QuestionThreadDisplay } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { APPEARANCE_OPTION_VALUES } from "@/constants/appearance.js";
import { FONT_FAMILY_SUGGESTIONS } from "@/constants/markerAppearance.js";
import type { AppearanceScale, MarkerFontSize, MarkerShape } from "@/constants/markerAppearance.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { formatPresentationViewerLabel } from "@/utils/report/reportTeam.js";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/Icons.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { HexColorField } from "./HexColorField.js";
import { MarkerShapePicker } from "./MarkerShapePicker.js";
import { PanelMarkerDisplayControls } from "./PanelMarkerDisplayControls.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
import { PanelTabSelector } from "./PanelTabSelector.js";

type PanelSettingsProps = {
    transferDisabled?: boolean;
    panelAppearance: ReportAppearance;
    onPanelAppearanceChange: (appearance: ReportAppearance) => void;
    tooltipAppearance: ReportAppearance;
    onTooltipAppearanceChange: (appearance: ReportAppearance) => void;
    questionThreadDisplay: QuestionThreadDisplay;
    onQuestionThreadDisplayChange: (display: QuestionThreadDisplay) => void;
    onExport: () => void;
    onImport: () => void;
    onCommand: () => void;
    hasPersonalKey: boolean;
    onKeyCopy: () => void;
    onPublicKeyCopy: () => void;
    onKeyInsert: () => void;
    onKeyRotate: () => void;
};

type SettingsCategory = "preview" | "appearance" | "display" | "tabs" | "data-and-keys" | "advanced";

const LOCALE_OPTIONS = ["en", "ko"] as const satisfies readonly ReportLocale[];
const QUESTION_THREAD_OPTIONS = ["expanded", "collapsed"] as const satisfies readonly QuestionThreadDisplay[];

function SettingsSection({ label, children }: { label: string; children: ReactNode }) {
    return (
        <section className="flex flex-col border-b border-[var(--adaptive-border-subtle)] last:border-b-0">
            <p className="px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{label}</p>
            <div className="flex flex-col py-[2px]">{children}</div>
        </section>
    );
}

function SettingsActionButton({ disabled = false, onClick, children }: { disabled?: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50"
        >
            {children}
        </button>
    );
}

function SettingsHubRow({ title, subtitle, onClick }: { title: string; subtitle: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-[10px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left last:border-b-0 hover:bg-[var(--adaptive-black100)]"
        >
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--adaptive-black900)]">{title}</p>
                <p className="mt-[2px] truncate text-[11px] text-[var(--adaptive-black500)]">{subtitle}</p>
            </div>
            <ChevronRightIcon className="h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black400)]" />
        </button>
    );
}

function SettingsDetailHeader({ title, backAriaLabel, onBack }: { title: string; backAriaLabel: string; onBack: () => void }) {
    return (
        <div className="sticky top-0 z-[1] flex shrink-0 items-center border-b border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)]">
            <button
                type="button"
                onClick={onBack}
                aria-label={backAriaLabel}
                className="flex h-[28px] w-[28px] shrink-0 items-center justify-center text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black200)] border-r border-r-[var(--adaptive-black200)]"
            >
                <ChevronLeftIcon className="h-[16px] w-[16px]" />
            </button>

            <p className="px-[12px] min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--adaptive-black900)]">{title}</p>
        </div>
    );
}

function getCategoryTitle(category: SettingsCategory, messages: ReturnType<typeof useReportPreferences>["messages"]) {
    switch (category) {
        case "preview":
            return messages.settings.categoryPreview;
        case "appearance":
            return messages.settings.categoryAppearance;
        case "display":
            return messages.settings.categoryDisplay;
        case "tabs":
            return messages.settings.categoryTabs;
        case "data-and-keys":
            return messages.settings.categoryDataAndKeys;
        case "advanced":
            return messages.settings.categoryAdvanced;
    }
}

export function PanelSettings({
    transferDisabled = false,
    panelAppearance,
    onPanelAppearanceChange,
    tooltipAppearance,
    onTooltipAppearanceChange,
    questionThreadDisplay,
    onQuestionThreadDisplayChange,
    onExport,
    onImport,
    onCommand,
    hasPersonalKey,
    onKeyCopy,
    onPublicKeyCopy,
    onKeyInsert,
    onKeyRotate,
}: PanelSettingsProps) {
    const [activeCategory, setActiveCategory] = useState<SettingsCategory | null>(null);
    const { locale, setLocale, messages, showMarkerTargetPreview, setShowMarkerTargetPreview, isPresentationMode, presentationViewers, markerAppearance, setMarkerSize, setMarkerShape, setMarkerColor, typography, setFontSize, setFontFamily, panelRole, visiblePanelTabs, visiblePanelTabsSummary, resolvedTabAvailabilityContext, setVisiblePanelTabs, resetVisibleTabsToRoleDefault } = useReportPreferences();
    const { presentationViewerId, setPresentationViewerId } = useReportSession();
    const scaleLabels: Record<AppearanceScale, string> = {
        sm: messages.settings.scaleSm,
        md: messages.settings.scaleMd,
        lg: messages.settings.scaleLg,
        xl: messages.settings.scaleXl,
    };
    const markerFontSizeLabels: Record<MarkerFontSize, string> = {
        none: messages.settings.scaleNone,
        ...scaleLabels,
    };
    const markerShapeLabels: Record<MarkerShape, string> = {
        circle: messages.settings.markerShapeCircle,
        square: messages.settings.markerShapeSquare,
        pill: messages.settings.markerShapePill,
        pin: messages.settings.markerShapePin,
    };
    const appearanceOptions = APPEARANCE_OPTION_VALUES.map((value) => ({
        value,
        label: messages.appearance[value],
    }));
    const localeOptions = LOCALE_OPTIONS.map((value) => ({
        value,
        label: messages.localeOption[value],
    }));
    const questionThreadOptions = QUESTION_THREAD_OPTIONS.map((value) => ({
        value,
        label: messages.questionThreadOption[value],
    }));
    const viewerOptions = presentationViewers.map((viewer) => ({
        value: viewer.id,
        label: viewer.isCreator ? `${formatPresentationViewerLabel(viewer)} (${messages.author.creatorLabel})` : formatPresentationViewerLabel(viewer),
        disabled: !viewer.privateKey,
    }));
    const showPreviewCategory = isPresentationMode && viewerOptions.length > 0;
    const activeViewerLabel = viewerOptions.find((option) => option.value === (presentationViewerId ?? viewerOptions[0]?.value))?.label ?? "";
    const appearanceSummary = `${messages.appearance[panelAppearance]} · ${messages.localeOption[locale]}`;
    const displaySummary = `${messages.questionThreadOption[questionThreadDisplay]} · ${showMarkerTargetPreview ? messages.settings.markerTargetsOn : messages.settings.markerTargetsOff}`;
    const tabsSummary = visiblePanelTabsSummary || messages.settings.categoryTabsSummary;

    if (activeCategory) {
        return (
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
                <SettingsDetailHeader
                    title={getCategoryTitle(activeCategory, messages)}
                    backAriaLabel={messages.settings.backAriaLabel}
                    onBack={() => setActiveCategory(null)}
                />

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {activeCategory === "preview" ? (
                        <SettingsSection label={messages.settings.sectionViewerSwitch}>
                            {/* <div className="px-[12px] pb-[10px]">
                            </div> */}
                            <p className="mb-[8px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]">{messages.settings.viewerSwitchHint}</p>

                            <div
                                role="radiogroup"
                                aria-label={messages.settings.viewerSwitchAriaLabel}
                                className="flex flex-col gap-[4px]"
                            >
                                {viewerOptions.map((option) => {
                                    const active = option.value === (presentationViewerId ?? viewerOptions[0]?.value);

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            disabled={option.disabled}
                                            onClick={() => {
                                                if (option.disabled) {
                                                    return;
                                                }

                                                void setPresentationViewerId(option.value);
                                            }}
                                            className={`rounded-[8px] px-[12px] py-[8px] text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                                active
                                                    ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                                    : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </SettingsSection>
                    ) : null}

                    {activeCategory === "appearance" ? (
                        <>
                            <SettingsSection label={messages.settings.sectionTheme}>
                                <div className="flex flex-col gap-[10px] px-[12px] pb-[10px]">
                                    <div>
                                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.moreMenu.panelTheme}</p>
                                        <AppearanceThemePicker
                                            options={appearanceOptions}
                                            value={panelAppearance}
                                            onChange={onPanelAppearanceChange}
                                            ariaLabel={messages.moreMenu.panelThemeAriaLabel}
                                        />
                                    </div>
                                    <div>
                                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.moreMenu.tooltipTheme}</p>
                                        <AppearanceThemePicker
                                            options={appearanceOptions}
                                            value={tooltipAppearance}
                                            onChange={onTooltipAppearanceChange}
                                            ariaLabel={messages.moreMenu.tooltipThemeAriaLabel}
                                        />
                                    </div>
                                    <div>
                                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.moreMenu.language}</p>
                                        <PanelOptionSwitch
                                            options={localeOptions}
                                            value={locale}
                                            onChange={setLocale}
                                            ariaLabel={messages.moreMenu.languageAriaLabel}
                                        />
                                    </div>
                                </div>
                            </SettingsSection>

                            <SettingsSection label={messages.settings.sectionMarkerAppearance}>
                                <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
                                    <PanelMarkerDisplayControls
                                        markerSize={markerAppearance.size}
                                        fontSize={typography.fontSize}
                                        onMarkerSizeChange={setMarkerSize}
                                        onFontSizeChange={setFontSize}
                                        scaleLabels={scaleLabels}
                                        markerFontSizeLabels={markerFontSizeLabels}
                                        markerSizeLabel={messages.settings.markerSize}
                                        markerFontSizeLabel={messages.settings.markerFontSize}
                                        markerSizeAriaLabel={messages.settings.markerSizeAriaLabel}
                                        markerFontSizeAriaLabel={messages.settings.markerFontSizeAriaLabel}
                                    />
                                    <div>
                                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.settings.markerShape}</p>
                                        <MarkerShapePicker
                                            value={markerAppearance.shape}
                                            onChange={setMarkerShape}
                                            labels={markerShapeLabels}
                                            ariaLabel={messages.settings.markerShapeAriaLabel}
                                        />
                                    </div>
                                    <HexColorField
                                        label={messages.settings.markerColorOpen}
                                        value={markerAppearance.colors.open}
                                        onChange={(color) => setMarkerColor("open", color)}
                                    />
                                    <HexColorField
                                        label={messages.settings.markerColorResolved}
                                        value={markerAppearance.colors.resolved}
                                        onChange={(color) => setMarkerColor("resolved", color)}
                                    />
                                    <HexColorField
                                        label={messages.settings.markerColorGitIssued}
                                        value={markerAppearance.colors.gitIssued}
                                        onChange={(color) => setMarkerColor("gitIssued", color)}
                                    />
                                </div>
                            </SettingsSection>

                            <SettingsSection label={messages.settings.sectionTypography}>
                                <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
                                    <label className="flex flex-col gap-[4px] text-[11px]">
                                        <span className="font-medium text-[var(--adaptive-black500)]">{messages.settings.fontFamily}</span>
                                        <input
                                            type="text"
                                            list="fivepixels-font-family-suggestions"
                                            value={typography.fontFamily}
                                            onChange={(event) => setFontFamily(event.target.value)}
                                            aria-label={messages.settings.fontFamilyAriaLabel}
                                            className="w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] text-[12px] text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]"
                                        />
                                        <datalist id="fivepixels-font-family-suggestions">
                                            {FONT_FAMILY_SUGGESTIONS.map((family) => (
                                                <option
                                                    key={family}
                                                    value={family}
                                                />
                                            ))}
                                        </datalist>
                                    </label>
                                </div>
                            </SettingsSection>
                        </>
                    ) : null}

                    {activeCategory === "display" ? (
                        <>
                            <SettingsSection label={messages.moreMenu.questionThread}>
                                <div className="px-[12px] pb-[10px]">
                                    <PanelOptionSwitch
                                        options={questionThreadOptions}
                                        value={questionThreadDisplay}
                                        onChange={onQuestionThreadDisplayChange}
                                        ariaLabel={messages.moreMenu.questionThreadAriaLabel}
                                    />
                                </div>
                            </SettingsSection>

                            <SettingsSection label={messages.settings.sectionMarker}>
                                <div className="px-[12px] pb-[10px]">
                                    <PanelOptionSwitch
                                        options={[
                                            { value: "off", label: messages.settings.markerTargetsOff },
                                            { value: "on", label: messages.settings.markerTargetsOn },
                                        ]}
                                        value={showMarkerTargetPreview ? "on" : "off"}
                                        onChange={(value) => setShowMarkerTargetPreview(value === "on")}
                                        ariaLabel={messages.settings.markerTargetsAriaLabel}
                                    />
                                </div>
                            </SettingsSection>
                        </>
                    ) : null}

                    {activeCategory === "tabs" ? (
                        <SettingsSection label={messages.settings.categoryTabs}>
                            <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
                                <PanelTabSelector
                                    role={panelRole}
                                    selectedTabs={visiblePanelTabs}
                                    context={resolvedTabAvailabilityContext}
                                    messages={messages}
                                    onChange={setVisiblePanelTabs}
                                />
                                <SettingsActionButton onClick={resetVisibleTabsToRoleDefault}>{messages.settings.resetTabsToRoleDefault}</SettingsActionButton>
                            </div>
                        </SettingsSection>
                    ) : null}

                    {activeCategory === "data-and-keys" ? (
                        <>
                            <SettingsSection label={messages.moreMenu.sectionTransfer}>
                                <SettingsActionButton
                                    disabled={transferDisabled}
                                    onClick={onImport}
                                >
                                    {messages.moreMenu.import}
                                </SettingsActionButton>
                                <SettingsActionButton
                                    disabled={transferDisabled}
                                    onClick={onExport}
                                >
                                    {messages.moreMenu.export}
                                </SettingsActionButton>
                            </SettingsSection>

                            <SettingsSection label={messages.moreMenu.sectionKey}>
                                <SettingsActionButton
                                    disabled={!hasPersonalKey}
                                    onClick={onPublicKeyCopy}
                                >
                                    {messages.moreMenu.publicKeyCopy}
                                </SettingsActionButton>
                                <SettingsActionButton
                                    disabled={!hasPersonalKey}
                                    onClick={onKeyCopy}
                                >
                                    {messages.moreMenu.keyCopy}
                                </SettingsActionButton>
                                <SettingsActionButton onClick={onKeyInsert}>{messages.moreMenu.keyInsert}</SettingsActionButton>
                                <SettingsActionButton
                                    disabled={!hasPersonalKey}
                                    onClick={onKeyRotate}
                                >
                                    {messages.moreMenu.keyRotate}
                                </SettingsActionButton>
                            </SettingsSection>
                        </>
                    ) : null}

                    {activeCategory === "advanced" ? (
                        <SettingsSection label={messages.moreMenu.sectionAdvanced}>
                            <SettingsActionButton
                                disabled={transferDisabled}
                                onClick={onCommand}
                            >
                                {messages.moreMenu.command}
                            </SettingsActionButton>
                        </SettingsSection>
                    ) : null}
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]">
            <p className="shrink-0 border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-[13px] font-semibold text-[var(--adaptive-black900)]">{messages.settings.hubTitle}</p>

            {showPreviewCategory ? (
                <SettingsHubRow
                    title={messages.settings.categoryPreview}
                    subtitle={activeViewerLabel}
                    onClick={() => setActiveCategory("preview")}
                />
            ) : null}

            <SettingsHubRow
                title={messages.settings.categoryAppearance}
                subtitle={appearanceSummary}
                onClick={() => setActiveCategory("appearance")}
            />

            <SettingsHubRow
                title={messages.settings.categoryDisplay}
                subtitle={displaySummary}
                onClick={() => setActiveCategory("display")}
            />

            <SettingsHubRow
                title={messages.settings.categoryTabs}
                subtitle={tabsSummary}
                onClick={() => setActiveCategory("tabs")}
            />

            <SettingsHubRow
                title={messages.settings.categoryDataAndKeys}
                subtitle={messages.settings.categoryDataAndKeysSummary}
                onClick={() => setActiveCategory("data-and-keys")}
            />

            <SettingsHubRow
                title={messages.settings.categoryAdvanced}
                subtitle={messages.moreMenu.command}
                onClick={() => setActiveCategory("advanced")}
            />
        </section>
    );
}
