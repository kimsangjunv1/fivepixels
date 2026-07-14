import type { ReportAppearance } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { APPEARANCE_OPTION_VALUES } from "@/constants/appearance.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { SettingsIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { AppearanceThemePicker } from "./AppearanceThemePicker.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";

type PanelMoreMenuProps = {
    open: boolean;
    transferDisabled?: boolean;
    panelAppearance: ReportAppearance;
    onPanelAppearanceChange: (appearance: ReportAppearance) => void;
    tooltipAppearance: ReportAppearance;
    onTooltipAppearanceChange: (appearance: ReportAppearance) => void;
    onToggle: () => void;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    onCommand: () => void;
    hasPersonalKey: boolean;
    onKeyCopy: () => void;
    onPublicKeyCopy: () => void;
    onKeyInsert: () => void;
    onKeyRotate: () => void;
};

const LOCALE_OPTIONS = ["en", "ko"] as const satisfies readonly ReportLocale[];

export function PanelMoreMenu({
    open,
    transferDisabled = false,
    panelAppearance,
    onPanelAppearanceChange,
    tooltipAppearance,
    onTooltipAppearanceChange,
    onToggle,
    onClose,
    onExport,
    onImport,
    onCommand,
    hasPersonalKey,
    onKeyCopy,
    onPublicKeyCopy,
    onKeyInsert,
    onKeyRotate,
}: PanelMoreMenuProps) {
    const { locale, setLocale, messages } = useReportPreferences();
    const appearanceOptions = APPEARANCE_OPTION_VALUES.map((value) => ({
        value,
        label: messages.appearance[value],
    }));
    const localeOptions = LOCALE_OPTIONS.map((value) => ({
        value,
        label: messages.localeOption[value],
    }));

    return (
        <PanelDropdownMenu
            open={open}
            onClose={onClose}
            trigger={
                <HoverTooltip label={messages.moreMenu.settings}>
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-expanded={open}
                        aria-haspopup="menu"
                        aria-label={messages.moreMenu.settings}
                        className={`flex h-full items-center justify-center gap-[4px] px-[12px_16px] py-[0px] text-[var(--adaptive-black700)] hover:text-[var(--adaptive-black900)] disabled:cursor-not-allowed disabled:opacity-50 ${open ? "bg-[var(--adaptive-grey200)]" : "bg-transparent"}`}
                    >
                        <SettingsIcon className={`${open ? "rotate-45" : ""} w-[16px] transition-transform`} />
                    </button>
                </HoverTooltip>
            }
        >
            <PanelDropdownMenuItem disabled={transferDisabled} onClick={onImport}>{messages.moreMenu.import}</PanelDropdownMenuItem>
            <PanelDropdownMenuItem disabled={transferDisabled} onClick={onExport}>{messages.moreMenu.export}</PanelDropdownMenuItem>
            <PanelDropdownMenuItem
                disabled={!hasPersonalKey}
                onClick={onPublicKeyCopy}
            >
                {messages.moreMenu.publicKeyCopy}
            </PanelDropdownMenuItem>
            <PanelDropdownMenuItem
                disabled={!hasPersonalKey}
                onClick={onKeyCopy}
            >
                {messages.moreMenu.keyCopy}
            </PanelDropdownMenuItem>
            <PanelDropdownMenuItem onClick={onKeyInsert}>{messages.moreMenu.keyInsert}</PanelDropdownMenuItem>
            <PanelDropdownMenuItem disabled={!hasPersonalKey} onClick={onKeyRotate}>
                {messages.moreMenu.keyRotate}
            </PanelDropdownMenuItem>
            <div className="w-full h-[1px] bg-[var(--adaptive-black300)]" />
            <div className="w-[min(100%,300px)] px-[12px] py-[8px]">
                <p className="mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{messages.moreMenu.panelTheme}</p>
                <AppearanceThemePicker
                    options={appearanceOptions}
                    value={panelAppearance}
                    onChange={onPanelAppearanceChange}
                    ariaLabel={messages.moreMenu.panelThemeAriaLabel}
                />
            </div>
            <div className="w-[min(100%,300px)] px-[12px] py-[8px]">
                <p className="mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{messages.moreMenu.tooltipTheme}</p>
                <AppearanceThemePicker
                    options={appearanceOptions}
                    value={tooltipAppearance}
                    onChange={onTooltipAppearanceChange}
                    ariaLabel={messages.moreMenu.tooltipThemeAriaLabel}
                />
            </div>
            <div className="px-[12px] py-[8px]">
                <p className="mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{messages.moreMenu.language}</p>
                <PanelOptionSwitch
                    options={localeOptions}
                    value={locale}
                    onChange={setLocale}
                    ariaLabel={messages.moreMenu.languageAriaLabel}
                />
            </div>
            <div className="w-full h-[1px] bg-[var(--adaptive-black300)]" />
            <PanelDropdownMenuItem disabled={transferDisabled} onClick={onCommand}>{messages.moreMenu.command}</PanelDropdownMenuItem>
        </PanelDropdownMenu>
    );
}
