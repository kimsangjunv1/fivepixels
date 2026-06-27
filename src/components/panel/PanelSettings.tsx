import type { ReactNode } from "react";
import type { ReportAppearance } from "@/types/report.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useReport } from "@/providers/reportContext.js";
import { PanelOptionSwitch } from "./PanelOptionSwitch.js";

type PanelSettingsProps = {
    transferDisabled?: boolean;
    appearance: ReportAppearance;
    onAppearanceChange: (appearance: ReportAppearance) => void;
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

export function PanelSettings({
    transferDisabled = false,
    appearance,
    onAppearanceChange,
    onExport,
    onImport,
    onCommand,
    hasPersonalKey,
    onKeyCopy,
    onPublicKeyCopy,
    onKeyInsert,
    onKeyRotate,
}: PanelSettingsProps) {
    const { locale, setLocale, messages } = useReport();
    const appearanceOptions = (["system", "light", "dark"] as const).map((value) => ({
        value,
        label: messages.appearance[value],
    }));
    const localeOptions = LOCALE_OPTIONS.map((value) => ({
        value,
        label: messages.localeOption[value],
    }));

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--adaptive-black50)]">
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

            <SettingsSection label={messages.moreMenu.theme}>
                <div className="px-[12px] pb-[10px]">
                    <PanelOptionSwitch
                        options={appearanceOptions}
                        value={appearance}
                        onChange={onAppearanceChange}
                        ariaLabel={messages.moreMenu.themeAriaLabel}
                    />
                </div>
            </SettingsSection>

            <SettingsSection label={messages.moreMenu.language}>
                <div className="px-[12px] pb-[10px]">
                    <PanelOptionSwitch
                        options={localeOptions}
                        value={locale}
                        onChange={setLocale}
                        ariaLabel={messages.moreMenu.languageAriaLabel}
                    />
                </div>
            </SettingsSection>

            <SettingsSection label={messages.moreMenu.sectionAdvanced}>
                <SettingsActionButton
                    disabled={transferDisabled}
                    onClick={onCommand}
                >
                    {messages.moreMenu.command}
                </SettingsActionButton>
            </SettingsSection>
        </section>
    );
}
