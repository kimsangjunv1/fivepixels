import type { FivePixelsSync } from "../constants/loginMethod.js";
import type { FivePixelsAdapter } from "./adapter.js";
import type { FivePixelsMode, ReportFeedback, ReportField, ReportGitHubConfig, ReportProject, ReportTeam, ReportUi, ReportVisibility } from "./report.js";
import type { ReportSideEffectCallbacks } from "../utils/report/reportCallbacks.js";
/**
 * Public props for `<FivePixels />` — single source of truth.
 *
 * - Remote persistence / auth: pass `adapter` (`FivePixelsAdapter` in `./adapter.js`).
 * - `sync="local"` (default): localStorage; `adapter` optional.
 * - Payload / entity shapes: `CreateReportFeedbackPayload`, `ReportFeedback`, `ReportReply`, etc. in `./report.js`.
 */
export type FivePixelsProps = {
    project?: ReportProject;
    ui?: ReportUi;
    visibility?: ReportVisibility;
    team?: ReportTeam;
    mode?: FivePixelsMode;
    /**
     * Persistence strategy for the panel.
     * - `local` (default): localStorage
     * - `api`: company API via `adapter` (markers / feedback / …)
     * - `artemis`: Artemis-backed remote persistence
     *
     * Identity / login is controlled separately by `requireAuth`.
     */
    sync?: FivePixelsSync;
    /**
     * When `sync` is `api` or `artemis`, whether company login is required.
     * - `true` (default for remote sync): login / Artemis gate
     * - `false`: local-style onboarding (display name + personal key), still using API storage
     * Ignored when `sync="local"`.
     */
    requireAuth?: boolean;
    /** Backend integration handlers grouped by domain. */
    adapter?: FivePixelsAdapter;
    fields?: ReportField[];
    /** Navigate in view mode when locating feedback on another route. */
    onNavigate?: (pathname: string) => void | Promise<void>;
    /** Attempt to reveal a target that is not on the current page. */
    onRevealTarget?: (report: ReportFeedback) => boolean | Promise<boolean>;
    github?: ReportGitHubConfig;
    /** Capture host app fetch/XHR traffic for the API flow tab. Default: true. */
    networkMonitor?: boolean;
} & ReportSideEffectCallbacks;
/** `<ReportProvider />` = public props + children (custom UI assembly). */
export type ReportProviderProps = FivePixelsProps & {
    children: import("react").ReactNode;
};
//# sourceMappingURL=publicApi.d.ts.map