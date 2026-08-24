import type { ReactNode } from "react";
import { LockIcon } from "@/components/icons/Icons.js";
import { HoverTooltip } from "@/components/ui/HoverTooltip.js";
import { useReportPreferences } from "@/providers/reportContext.js";
import { formatIntegrationMissingHandlers, type IntegrationFeatureId, type IntegrationHandlerName } from "@/utils/integration/integrationFeatures.js";
import { getIntegrationLock } from "@/utils/integration/integrationGate.js";

export function useIntegrationLock(feature: IntegrationFeatureId) {
    const { integrationCapabilities, messages } = useReportPreferences();
    const state = getIntegrationLock(feature, integrationCapabilities);
    const tooltipLabel =
        feature === "dataTransfer" && state.locked
            ? messages.panel.integrationLockDataTransfer
            : state.missingHandlers.length > 0
              ? messages.panel.integrationLockMissing(formatIntegrationMissingHandlers(state.missingHandlers))
              : messages.panel.integrationLockRequired;

    return { ...state, tooltipLabel };
}

type IntegrationLockTipProps = {
    locked: boolean;
    label: string;
    children: ReactNode;
    className?: string;
    showIcon?: boolean;
};

/** Keep HoverTooltip enabled while the child control is disabled. */
export function IntegrationLockTip({ locked, label, children, className = "", showIcon = true }: IntegrationLockTipProps) {
    if (!locked) {
        return <>{children}</>;
    }

    return (
        <HoverTooltip
            label={label}
            multiline
            className={className}
        >
            <span className="inline-flex items-center gap-[4px]">
                {children}
                {showIcon ? <LockIcon className="h-[12px] w-[12px] shrink-0 text-[var(--adaptive-black500)]" aria-hidden /> : null}
            </span>
        </HoverTooltip>
    );
}

export function IntegrationLockBadge({ feature, className = "" }: { feature: IntegrationFeatureId; className?: string }) {
    const { locked, tooltipLabel } = useIntegrationLock(feature);

    if (!locked) {
        return null;
    }

    return (
        <HoverTooltip
            label={tooltipLabel}
            multiline
            className={className}
        >
            <span
                className="inline-flex items-center justify-center text-[var(--adaptive-black500)]"
                aria-label={tooltipLabel}
            >
                <LockIcon className="h-[12px] w-[12px]" />
            </span>
        </HoverTooltip>
    );
}

export type { IntegrationFeatureId, IntegrationHandlerName };
