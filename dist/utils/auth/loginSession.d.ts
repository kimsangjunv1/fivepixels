import { type LoginMethod } from "../../constants/loginMethod.js";
import type { ReportAuthUser } from "../../types/report.js";
export type RemoteAuthSession = {
    method: "api" | "artemis";
    user: ReportAuthUser;
};
export declare function readLoginMethod(projectId: string, environment?: string): LoginMethod | null;
export declare function saveLoginMethod(projectId: string, environment: string | undefined, method: LoginMethod): void;
export declare function readRemoteAuthSession(projectId: string, environment?: string): RemoteAuthSession | null;
export declare function saveRemoteAuthSession(projectId: string, environment: string | undefined, session: RemoteAuthSession): void;
export declare function clearRemoteAuthSession(projectId: string, environment?: string): void;
//# sourceMappingURL=loginSession.d.ts.map