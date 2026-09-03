import { CheckCircleIcon } from "@/shared/components/icons/Icons.js";
import { ACCENT_COLOR } from "@/shared/constants/accentColors.js";
import { useReportPreferences } from "@/shared/providers/reportContext.js";
import type { AdapterIntegrationGroup } from "@/shared/utils/integration/buildAdapterIntegrationStatus.js";
import type { IntegrationFeatureId, IntegrationHandlerName } from "@/shared/utils/integration/integrationFeatures.js";

const CONNECTED_COLOR = ACCENT_COLOR.green;

function IntegrationStatusIndicator({ connected }: { connected: boolean }) {
    if (connected) {
        return (
            <CheckCircleIcon
                className="h-[12px] w-[12px] shrink-0"
                fill={CONNECTED_COLOR}
                aria-hidden
            />
        );
    }

    return (
        <span
            aria-hidden
            className="inline-flex h-[12px] w-[12px] shrink-0 rounded-full border border-[var(--adaptive-black300)]"
        />
    );
}

function ProgressBar({ value }: { value: number }) {
    const clamped = Math.max(0, Math.min(100, value));

    return (
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--adaptive-black200)]">
            <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${clamped}%`, backgroundColor: CONNECTED_COLOR }}
            />
        </div>
    );
}

function handlerLabel(messages: ReturnType<typeof useReportPreferences>["messages"], id: IntegrationHandlerName): string {
    return messages.settings.integrationHandler[id] ?? id;
}

function featureLabel(messages: ReturnType<typeof useReportPreferences>["messages"], id: IntegrationFeatureId): string {
    return messages.settings.integrationFeature[id] ?? id;
}

function groupLabel(messages: ReturnType<typeof useReportPreferences>["messages"], group: AdapterIntegrationGroup): string {
    return messages.settings.integrationGroup[group] ?? group;
}

const GROUP_ORDER: AdapterIntegrationGroup[] = ["auth", "session", "markers", "feedback", "cases", "replies", "members", "github"];

export function PanelIntegrationSettings() {
    const { messages, adapterIntegrationStatus, integrationCapabilities } = useReportPreferences();

    if (!adapterIntegrationStatus) {
        return (
            <section className="px-[12px] py-[12px] text-[13px] text-[var(--adaptive-black700)]">
                {messages.settings.integrationLocalModeHint}
            </section>
        );
    }

    const { connectedCount, totalCount, requiredConnectedCount, requiredTotalCount, handlers, features, isRequiredComplete } =
        adapterIntegrationStatus;
    const progressPercent = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0;

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[12px]">
            <section className="border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[12px]">
                <div className="mb-[8px] flex items-baseline justify-between gap-[8px]">
                    <p className="text-[13px] font-semibold text-[var(--adaptive-black900)]">{messages.settings.integrationProgressTitle}</p>
                    <p className="text-[12px] font-semibold text-[var(--adaptive-black700)]">
                        {messages.settings.integrationProgressCount(connectedCount, totalCount)}
                    </p>
                </div>
                <ProgressBar value={progressPercent} />
                <p className="mt-[8px] text-[11px] text-[var(--adaptive-black600)]">
                    {messages.settings.integrationRequiredProgress(requiredConnectedCount, requiredTotalCount)}
                    {isRequiredComplete ? ` · ${messages.settings.integrationRequiredComplete}` : ""}
                </p>
                {integrationCapabilities.persistenceMode === "unavailable" ? (
                    <p className="mt-[6px] text-[11px] font-medium text-[var(--adaptive-red500)]">{messages.settings.integrationUnavailableHint}</p>
                ) : null}
            </section>

            {GROUP_ORDER.map((group) => {
                const groupHandlers = handlers.filter((item) => item.group === group);

                if (groupHandlers.length === 0) {
                    return null;
                }

                return (
                    <section
                        key={group}
                        className="border-b border-[var(--adaptive-border-subtle)]"
                    >
                        <p className="px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">
                            {groupLabel(messages, group)}
                        </p>
                        <ul className="flex flex-col py-[2px]">
                            {groupHandlers.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-start gap-[8px] px-[12px] py-[7px] text-[12px] text-[var(--adaptive-black800)]"
                                >
                                    <IntegrationStatusIndicator connected={item.connected} />
                                    <span className="min-w-0 flex-1 break-all leading-[1.4]">
                                        <span className="font-medium">{handlerLabel(messages, item.id)}</span>
                                        <span className="mt-[2px] block font-mono text-[10px] text-[var(--adaptive-black500)]">{item.id}</span>
                                        {item.required ? (
                                            <span className="mt-[2px] inline-block rounded-[4px] bg-[var(--adaptive-black100)] px-[4px] py-[1px] text-[10px] font-semibold text-[var(--adaptive-black600)]">
                                                {messages.settings.integrationRequiredBadge}
                                            </span>
                                        ) : null}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}

            <section className="border-b border-[var(--adaptive-border-subtle)] last:border-b-0">
                <p className="px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">
                    {messages.settings.integrationFeaturesTitle}
                </p>
                <ul className="flex flex-col py-[2px]">
                    {features.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-[8px] px-[12px] py-[7px] text-[12px] text-[var(--adaptive-black800)]"
                        >
                            <IntegrationStatusIndicator connected={item.available} />
                            <span className={item.available ? "text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black600)]"}>
                                {featureLabel(messages, item.id)}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
