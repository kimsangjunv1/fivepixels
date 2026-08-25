import type { FivePixelsSync } from "@/constants/loginMethod.js";
import type { FivePixelsAdapter } from "./adapter.js";
import type {
    FivePixelsMode,
    ReportFeedback,
    ReportField,
    ReportGitHubConfig,
    ReportProject,
    ReportTeam,
    ReportUi,
    ReportVisibility,
} from "./report.js";
import type { FivePixelsRequire } from "@/utils/report/resolveRequire.js";
import type { ReportSideEffectCallbacks } from "@/utils/report/reportCallbacks.js";

export type { FivePixelsRequire, ResolvedFivePixelsRequire } from "@/utils/report/resolveRequire.js";

/**
 * Public props for `<FivePixels />` — single source of truth.
 *
 * - Remote persistence / auth: pass `adapter` (`FivePixelsAdapter` in `./adapter.js`).
 * - `sync="local"` (default): localStorage; `adapter` optional.
 * - Identity gates: `require.authLogin` / `require.reviewerKey`.
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
     * Identity / login is controlled separately by `require`.
     */
    sync?: FivePixelsSync;
    /**
     * Identity policy flags.
     * - `authLogin`: company login when `sync` is `api` / `artemis` (default true for remote)
     * - `reviewerKey`: personal key must match `team.reviewers`
     */
    require?: FivePixelsRequire;
    /**
     * @deprecated Prefer `require.authLogin`.
     * When `sync` is `api` or `artemis`, whether company login is required.
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
