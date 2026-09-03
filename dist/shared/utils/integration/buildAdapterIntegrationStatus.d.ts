import type { FivePixelsSync } from "../../../shared/constants/loginMethod.js";
import type { FivePixelsAdapter } from "../../../shared/types/adapter.js";
import type { ReportGitHubConfig } from "../../../shared/types/report.js";
import type { IntegrationCapabilities, IntegrationFeatureId, IntegrationHandlerName } from "../../../shared/utils/integration/integrationFeatures.js";
export type AdapterIntegrationGroup = "auth" | "session" | "markers" | "feedback" | "cases" | "replies" | "members" | "github";
export type AdapterIntegrationHandlerItem = {
    id: IntegrationHandlerName;
    group: AdapterIntegrationGroup;
    connected: boolean;
    required: boolean;
    relevant: boolean;
};
export type AdapterIntegrationFeatureItem = {
    id: IntegrationFeatureId;
    available: boolean;
    relevant: boolean;
};
export type AdapterIntegrationStatus = {
    sync: FivePixelsSync;
    requireAuth: boolean;
    connectedCount: number;
    totalCount: number;
    requiredConnectedCount: number;
    requiredTotalCount: number;
    handlers: AdapterIntegrationHandlerItem[];
    features: AdapterIntegrationFeatureItem[];
    isRequiredComplete: boolean;
};
export declare function buildAdapterIntegrationStatus(adapter: FivePixelsAdapter | undefined, sync: FivePixelsSync, capabilities: IntegrationCapabilities, github?: ReportGitHubConfig, requireAuth?: boolean): AdapterIntegrationStatus | null;
//# sourceMappingURL=buildAdapterIntegrationStatus.d.ts.map