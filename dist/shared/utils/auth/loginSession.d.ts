import { type FivePixelsSync } from "../../../shared/constants/loginMethod.js";
import type { ReportAuthUser } from "../../../shared/types/report.js";
export type RemoteAuthSession = {
    method: "api" | "artemis";
    user: ReportAuthUser;
};
export declare function readLoginMethod(projectId: string, environment?: string): FivePixelsSync | null;
export declare function saveLoginMethod(projectId: string, environment: string | undefined, method: FivePixelsSync): void;
export declare function readRemoteAuthSession(projectId: string, environment?: string): RemoteAuthSession | null;
export declare function saveRemoteAuthSession(projectId: string, environment: string | undefined, session: RemoteAuthSession): void;
export declare function clearRemoteAuthSession(projectId: string, environment?: string): void;
//# sourceMappingURL=loginSession.d.ts.map