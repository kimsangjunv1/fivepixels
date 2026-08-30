import { useState, type ReactNode } from "react";
import type { ReportAppearance, QuestionThreadDisplay, ThreadLayoutStyle } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { APPEARANCE_OPTION_VALUES } from "@/constants/appearance.js";
import { resolveFivePixelsSync, resolveRequireAuth, usesRemoteAuthLogin } from "@/constants/loginMethod.js";
import { DEFAULT_FEEDBACK_MODE_DOT_COLORS, FONT_FAMILY_SUGGESTIONS, MARKER_FILL_STYLE_VALUES } from "@/constants/markerAppearance.js";
import type { AppearanceScale, MarkerFillStyle, MarkerShape } from "@/constants/markerAppearance.js";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import { formatPresentationViewerLabel } from "@/utils/report/reportTeam.js";
import { ChevronLeftIcon, ChevronRightIcon, LockIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { useIntegrationLock } from "@/components/ui/IntegrationLock.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { HexColorField } from "./HexColorField.js";
import { MarkerShapePicker } from "./MarkerShapePicker.js";
import { PanelIntegrationSettings } from "./PanelIntegrationSettings.js";
import { PanelMarkerDisplayControls } from "./PanelMarkerDisplayControls.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";
import { PanelTabSelector } from "./PanelTabSelector.js";
import { PanelTeamSettings } from "./PanelTeamSettings.js";

type PanelSettingsProps = {
    transferDisabled?: boolean;
    panelAppearance: ReportAppearance;
    onPanelAppearanceChange: (appearance: ReportAppearance) => void;
    tooltipAppearance: ReportAppearance;
    onTooltipAppearanceChange: (appearance: ReportAppearance) => void;
    questionThreadDisplay: QuestionThreadDisplay;
    onQuestionThreadDisplayChange: (display: QuestionThreadDisplay) => void;
    threadLayout: ThreadLayoutStyle;
    onThreadLayoutChange: (layout: ThreadLayoutStyle) => void;
    onExport: () => void;
    onImport: () => void;
    onCommand: () => void;
    hasPersonalKey: boolean;
    onKeyCopy: () => void;
    onPublicKeyCopy: () => void;
    onKeyInsert: () => void;
    onKeyRotate: () => void;
};

type SettingsCategory = "preview" | "appearance" | "display" | "tabs" | "team" | "data-and-keys" | "advanced" | "api-integration";
type AppearanceSection = "theme-language" | "thread-layout" | "feedback-mode" | "marker";

const LOCALE_OPTIONS = ["en", "ko"] as const satisfies readonly ReportLocale[];
const QUESTION_THREAD_OPTIONS = ["expanded", "collapsed"] as const satisfies readonly QuestionThreadDisplay[];
const THREAD_LAYOUT_OPTIONS = ["classic", "feed"] as const satisfies readonly ThreadLayoutStyle[];

function SettingsSection({ label, children }: { label: string; children: ReactNode }) {
    return (
        <section className="flex flex-col border-b border-[var(--adaptive-border-subtle)] last:border-b-0">
            <p className="px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{label}</p>
            <div className="flex flex-col py-[2px]">{children}</div>
        </section>
    );
}

function SettingsActionButton({
    disabled = false,
    locked = false,
    lockLabel,
    onClick,
    children,
}: {
    disabled?: boolean;
    locked?: boolean;
    lockLabel?: string;
    onClick: () => void;
    children: ReactNode;
}) {
    const button = (
        <button
            type="button"
            disabled={disabled || locked}
            onClick={onClick}
            className="w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="inline-flex items-center gap-[6px]">
                {locked ? <LockIcon className="h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black500)]" /> : null}
                {children}
            </span>
        </button>
    );

    if (!locked || !lockLabel) {
        return button;
    }

    return (
        <HoverTooltip
            label={lockLabel}
            multiline
            className="w-full"
        >
            {button}
        </HoverTooltip>
    );
}

function SettingsHubRow({
    title,
    subtitle,
    onClick,
    locked = false,
    lockLabel,
}: {
    title: string;
    subtitle: string;
    onClick: () => void;
    locked?: boolean;
    lockLabel?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-[10px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] text-left last:border-b-0 hover:bg-[var(--adaptive-black100)]"
        >
            <div className="min-w-0 flex-1 flex flex-col gap-[4px]">
                <p className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[var(--adaptive-black900)]">
                    {title}
                    {locked ? (
                        <HoverTooltip
                            label={lockLabel}
                            multiline
                        >
                            <span className="inline-flex text-[var(--adaptive-black500)]">
                                <LockIcon className="h-[12px] w-[12px]" />
                            </span>
                        </HoverTooltip>
                    ) : null}
                </p>
                <p className="truncate text-[10px] text-[var(--adaptive-black700)]">{subtitle}</p>
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
        case "team":
            return messages.settings.categoryTeam;
        case "data-and-keys":
            return messages.settings.categoryDataAndKeys;
        case "advanced":
            return messages.settings.categoryAdvanced;
        case "api-integration":
            return messages.settings.categoryApiIntegration;
    }
}

function getAppearanceSectionTitle(section: AppearanceSection, messages: ReturnType<typeof useReportPreferences>["messages"]) {
    switch (section) {
        case "theme-language":
            return messages.settings.appearanceThemeLanguage;
        case "thread-layout":
            return messages.settings.appearanceThreadLayout;
        case "feedback-mode":
            return messages.settings.sectionFeedbackMode;
        case "marker":
            return messages.settings.sectionMarkerAppearance;
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
    threadLayout,
    onThreadLayoutChange,
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
    const [activeAppearanceSection, setActiveAppearanceSection] = useState<AppearanceSection | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const transferLock = useIntegrationLock("dataTransfer");
    const teamManageLock = useIntegrationLock("teamManage");
    const {
        locale,
        setLocale,
        messages,
        showMarkerTargetPreview,
        setShowMarkerTargetPreview,
        isPresentationMode,
        presentationViewers,
        markerAppearance,
        setMarkerSize,
        setMarkerShape,
        setMarkerFillStyle,
        setMarkerColor,
        setMarkerStrokeColor,
        setFeedbackModeDotColors,
        setFeedbackModeDotColor,
        typography,
        setFontFamily,
        panelRole,
        visiblePanelTabs,
        visiblePanelTabsSummary,
        resolvedTabAvailabilityContext,
        setVisiblePanelTabs,
        resetVisibleTabsToRoleDefault,
        canAccessTeamSettings,
        integrationCapabilities,
        adapterIntegrationStatus,
        loginMethod,
        requireAuth: requireAuthProp,
        logoutWithApi,
    } = useReportPreferences();
    const { presentationViewerId, setPresentationViewerId, setErrorMessage } = useReportSession();
    const sync = resolveFivePixelsSync(loginMethod);
    const requireAuth = resolveRequireAuth(sync, requireAuthProp);
    const showAccountLogout = usesRemoteAuthLogin(sync, requireAuth);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await logoutWithApi();
        } catch {
            setErrorMessage(messages.moreMenu.logoutFailed);
        } finally {
            setIsLoggingOut(false);
        }
    };
    const scaleLabels: Record<AppearanceScale, string> = {
        "2xs": messages.settings.scale2xs,
        xs: messages.settings.scaleXs,
        sm: messages.settings.scaleSm,
        md: messages.settings.scaleMd,
        lg: messages.settings.scaleLg,
        xl: messages.settings.scaleXl,
        "2xl": messages.settings.scale2xl,
    };
    const shapeLabels: Record<MarkerShape, string> = {
        circle: messages.settings.markerShapeCircle,
        square: messages.settings.markerShapeSquare,
        cookie4: messages.settings.markerShapeCookie4,
        sunny: messages.settings.markerShapeSunny,
        cookie6: messages.settings.markerShapeCookie6,
        clover4: messages.settings.markerShapeClover4,
        flower: messages.settings.markerShapeFlower,
        ghostish: messages.settings.markerShapeGhostish,
        bun: messages.settings.markerShapeBun,
        gem: messages.settings.markerShapeGem,
        pill: messages.settings.markerShapePill,
        pentagon: messages.settings.markerShapePentagon,
        puffy: messages.settings.markerShapePuffy,
    };
    const fillStyleLabels: Record<MarkerFillStyle, string> = {
        filled: messages.settings.markerFillStyleFilled,
        outlined: messages.settings.markerFillStyleOutlined,
        both: messages.settings.markerFillStyleBoth,
    };
    const showFillColorSettings = markerAppearance.fillStyle === "filled" || markerAppearance.fillStyle === "both";
    const showStrokeStatusColorSettings = markerAppearance.fillStyle === "outlined";
    const showBothStrokeColorSetting = markerAppearance.fillStyle === "both";
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
    const threadLayoutOptions = THREAD_LAYOUT_OPTIONS.map((value) => ({
        value,
        label: messages.threadLayoutOption[value],
    }));
    const viewerOptions = presentationViewers.map((viewer) => ({
        value: viewer.id,
        label: viewer.isCreator ? `${formatPresentationViewerLabel(viewer)} (${messages.author.creatorLabel})` : formatPresentationViewerLabel(viewer),
        disabled: !viewer.privateKey,
    }));
    const showPreviewCategory = isPresentationMode && viewerOptions.length > 0;
    const activeViewerLabel = viewerOptions.find((option) => option.value === (presentationViewerId ?? viewerOptions[0]?.value))?.label ?? "";
    const appearanceSummary = `${messages.appearance[panelAppearance]} · ${messages.localeOption[locale]}`;
    const feedbackModeSummary = `${markerAppearance.feedbackModeDotColors.light} · ${markerAppearance.feedbackModeDotColors.dark}`;
    const markerSummary = `${scaleLabels[markerAppearance.size]} · ${shapeLabels[markerAppearance.shape]} · ${fillStyleLabels[markerAppearance.fillStyle]}`;
    const displaySummary = showMarkerTargetPreview ? messages.settings.markerTargetsOn : messages.settings.markerTargetsOff;
    const tabsSummary = visiblePanelTabsSummary || messages.settings.categoryTabsSummary;
    const showApiIntegrationCategory = integrationCapabilities.sync === "api" || integrationCapabilities.sync === "artemis";
    const apiIntegrationSummary = adapterIntegrationStatus
        ? messages.settings.categoryApiIntegrationSummary(adapterIntegrationStatus.connectedCount, adapterIntegrationStatus.totalCount)
        : messages.settings.integrationLocalModeHint;

    if (activeCategory === "appearance" && !activeAppearanceSection) {
        return (
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
                <SettingsDetailHeader
                    title={messages.settings.categoryAppearance}
                    backAriaLabel={messages.settings.backAriaLabel}
                    onBack={() => setActiveCategory(null)}
                />

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <SettingsHubRow
                        title={messages.settings.appearanceThemeLanguage}
                        subtitle={appearanceSummary}
                        onClick={() => setActiveAppearanceSection("theme-language")}
                    />
                    <SettingsHubRow
                        title={messages.settings.appearanceThreadLayout}
                        subtitle={`${messages.threadLayoutOption[threadLayout]} · ${messages.questionThreadOption[questionThreadDisplay]}`}
                        onClick={() => setActiveAppearanceSection("thread-layout")}
                    />
                    <SettingsHubRow
                        title={messages.settings.sectionFeedbackMode}
                        subtitle={feedbackModeSummary}
                        onClick={() => setActiveAppearanceSection("feedback-mode")}
                    />
                    <SettingsHubRow
                        title={messages.settings.sectionMarkerAppearance}
                        subtitle={markerSummary}
                        onClick={() => setActiveAppearanceSection("marker")}
                    />
                </div>
            </section>
        );
    }

    if (activeCategory) {
        const isAppearanceDetail = activeCategory === "appearance" && activeAppearanceSection != null;
        const detailTitle =
            activeCategory === "appearance" && activeAppearanceSection
                ? getAppearanceSectionTitle(activeAppearanceSection, messages)
                : getCategoryTitle(activeCategory, messages);
        const detailBackAriaLabel = isAppearanceDetail ? messages.settings.appearanceBackAriaLabel : messages.settings.backAriaLabel;

        return (
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--adaptive-black50)]">
                <SettingsDetailHeader
                    title={detailTitle}
                    backAriaLabel={detailBackAriaLabel}
                    onBack={() => {
                        if (isAppearanceDetail) {
                            setActiveAppearanceSection(null);
                            return;
                        }

                        setActiveCategory(null);
                    }}
                />

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {activeCategory === "preview" ? (
                        <SettingsSection label={messages.settings.sectionViewerSwitch}>
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

                    {activeAppearanceSection === "theme-language" ? (
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
                                            previewKind="panel"
                                        />
                                    </div>
                                    <div>
                                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.moreMenu.tooltipTheme}</p>
                                        <AppearanceThemePicker
                                            options={appearanceOptions}
                                            value={tooltipAppearance}
                                            onChange={onTooltipAppearanceChange}
                                            ariaLabel={messages.moreMenu.tooltipThemeAriaLabel}
                                            previewKind="tooltip"
                                        />
                                    </div>
                                </div>
                            </SettingsSection>

                            <SettingsSection label={messages.settings.sectionLanguage}>
                                <div className="px-[12px] pb-[10px]">
                                    <PanelOptionSwitch
                                        options={localeOptions}
                                        value={locale}
                                        onChange={setLocale}
                                        ariaLabel={messages.moreMenu.languageAriaLabel}
                                    />
                                </div>
                            </SettingsSection>
                        </>
                    ) : null}

                    {activeAppearanceSection === "thread-layout" ? (
                        <>
                            <SettingsSection label={messages.settings.sectionThreadLayout}>
                                <div className="px-[12px] pb-[10px]">
                                    <PanelOptionSwitch
                                        options={threadLayoutOptions}
                                        value={threadLayout}
                                        onChange={onThreadLayoutChange}
                                        ariaLabel={messages.settings.sectionThreadLayout}
                                    />
                                </div>
                            </SettingsSection>

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
                        </>
                    ) : null}

                    {activeAppearanceSection === "feedback-mode" ? (
                        <SettingsSection label={messages.settings.sectionFeedbackMode}>
                            <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
                                <HexColorField
                                    label={messages.settings.feedbackModeDotColorLight}
                                    value={markerAppearance.feedbackModeDotColors.light}
                                    onChange={(color) => setFeedbackModeDotColor("light", color)}
                                />
                                <HexColorField
                                    label={messages.settings.feedbackModeDotColorDark}
                                    value={markerAppearance.feedbackModeDotColors.dark}
                                    onChange={(color) => setFeedbackModeDotColor("dark", color)}
                                />
                                <SettingsActionButton onClick={() => setFeedbackModeDotColors(DEFAULT_FEEDBACK_MODE_DOT_COLORS)}>
                                    {messages.settings.resetFeedbackModeDotColors}
                                </SettingsActionButton>
                            </div>
                        </SettingsSection>
                    ) : null}

                    {activeAppearanceSection === "marker" ? (
                        <>
                            <SettingsSection label={messages.settings.sectionMarkerForm}>
                                <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
                                    <PanelMarkerDisplayControls
                                        markerSize={markerAppearance.size}
                                        onMarkerSizeChange={setMarkerSize}
                                        scaleLabels={scaleLabels}
                                        markerSizeLabel={messages.settings.markerSize}
                                        markerSizeAriaLabel={messages.settings.markerSizeAriaLabel}
                                    />
                                    <div>
                                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.settings.markerFillStyle}</p>
                                        <PanelOptionSwitch
                                            options={MARKER_FILL_STYLE_VALUES.map((value) => ({
                                                value,
                                                label: fillStyleLabels[value],
                                            }))}
                                            value={markerAppearance.fillStyle}
                                            onChange={setMarkerFillStyle}
                                            ariaLabel={messages.settings.markerFillStyleAriaLabel}
                                        />
                                    </div>
                                    <div>
                                        <p className="mb-[6px] text-[11px] font-medium text-[var(--adaptive-black600)]">{messages.settings.markerShape}</p>
                                        <MarkerShapePicker
                                            value={markerAppearance.shape}
                                            onChange={setMarkerShape}
                                            labels={shapeLabels}
                                            ariaLabel={messages.settings.markerShapeAriaLabel}
                                            previewColor={markerAppearance.colors.open}
                                            fillStyle={markerAppearance.fillStyle}
                                            strokeColor={markerAppearance.strokeColor}
                                        />
                                    </div>
                                </div>
                            </SettingsSection>

                            {showFillColorSettings ? (
                                <SettingsSection label={messages.settings.sectionMarkerFillColors}>
                                    <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
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
                            ) : null}

                            {showStrokeStatusColorSettings ? (
                                <SettingsSection label={messages.settings.sectionMarkerStrokeColors}>
                                    <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
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
                            ) : null}

                            {showBothStrokeColorSetting ? (
                                <SettingsSection label={messages.settings.sectionMarkerStrokeColors}>
                                    <div className="flex flex-col gap-[12px] px-[12px] pb-[10px]">
                                        <HexColorField
                                            label={messages.settings.markerStrokeColor}
                                            value={markerAppearance.strokeColor}
                                            onChange={setMarkerStrokeColor}
                                        />
                                    </div>
                                </SettingsSection>
                            ) : null}

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

                    {activeCategory === "team" ? <PanelTeamSettings /> : null}

                    {activeCategory === "data-and-keys" ? (
                        <>
                            {showAccountLogout ? (
                                <SettingsSection label={messages.moreMenu.sectionAccount}>
                                    <SettingsActionButton
                                        disabled={isLoggingOut}
                                        onClick={() => void handleLogout()}
                                    >
                                        {messages.moreMenu.logout}
                                    </SettingsActionButton>
                                </SettingsSection>
                            ) : null}

                            <SettingsSection label={messages.moreMenu.sectionTransfer}>
                                <SettingsActionButton
                                    disabled={transferDisabled}
                                    locked={transferLock.locked}
                                    lockLabel={transferLock.tooltipLabel}
                                    onClick={onImport}
                                >
                                    {messages.moreMenu.import}
                                </SettingsActionButton>
                                <SettingsActionButton
                                    disabled={transferDisabled}
                                    locked={transferLock.locked}
                                    lockLabel={transferLock.tooltipLabel}
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
                                locked={transferLock.locked}
                                lockLabel={transferLock.tooltipLabel}
                                onClick={onCommand}
                            >
                                {messages.moreMenu.command}
                            </SettingsActionButton>
                        </SettingsSection>
                    ) : null}

                    {activeCategory === "api-integration" ? <PanelIntegrationSettings /> : null}
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
                onClick={() => {
                    setActiveAppearanceSection(null);
                    setActiveCategory("appearance");
                }}
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

            {canAccessTeamSettings ? (
                <SettingsHubRow
                    title={messages.settings.categoryTeam}
                    subtitle={messages.settings.categoryTeamSummary}
                    locked={teamManageLock.locked}
                    lockLabel={teamManageLock.tooltipLabel}
                    onClick={() => setActiveCategory("team")}
                />
            ) : null}

            {showApiIntegrationCategory ? (
                <SettingsHubRow
                    title={messages.settings.categoryApiIntegration}
                    subtitle={apiIntegrationSummary}
                    onClick={() => setActiveCategory("api-integration")}
                />
            ) : null}

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
