import type { ReactNode } from "react";
import { type IntegrationFeatureId, type IntegrationHandlerName } from "../../utils/integration/integrationFeatures.js";
export declare function useIntegrationLock(feature: IntegrationFeatureId): {
    tooltipLabel: string;
    locked: boolean;
    missingHandlers: IntegrationHandlerName[];
};
type IntegrationLockTipProps = {
    locked: boolean;
    label: string;
    children: ReactNode;
    className?: string;
    showIcon?: boolean;
};
/** Keep HoverTooltip enabled while the child control is disabled. */
export declare function IntegrationLockTip({ locked, label, children, className, showIcon }: IntegrationLockTipProps): import("react").JSX.Element;
export declare function IntegrationLockBadge({ feature, className }: {
    feature: IntegrationFeatureId;
    className?: string;
}): import("react").JSX.Element | null;
export type { IntegrationFeatureId, IntegrationHandlerName };
//# sourceMappingURL=IntegrationLock.d.ts.map