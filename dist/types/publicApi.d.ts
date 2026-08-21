import type { FivePixelsSync } from "../constants/loginMethod.js";
import type { FivePixelsMode, ReportFeedback, ReportField, ReportGitHubConfig, ReportAuthHandlers, ReportPersistenceHandlers, ReportProject, ReportTeam, ReportTeamHandlers, ReportUi, ReportVisibility } from "./report.js";
import type { ReportSideEffectCallbacks } from "../utils/report/reportCallbacks.js";
/**
 * Public props for `<FivePixels />` — single source of truth.
 *
 * - Persistence shapes: see `ReportPersistenceHandlers` (`onList` / `onCreate` / `onUpdate` must be passed together or all omitted).
 * - Team management: `ReportTeamHandlers` (optional P3-auth; panel Settings → Team).
 * - Payload / entity shapes: `CreateReportFeedbackPayload`, `ReportFeedback`, `ReportReply`, etc. in `./report.js`.
 * - How to add a prop: `docs/add-props.md`.
 */
export type FivePixelsProps = {
    project?: ReportProject;
    ui?: ReportUi;
    visibility?: ReportVisibility;
    team?: ReportTeam;
    mode?: FivePixelsMode;
    /**
     * Auth / identity sync strategy for the panel.
     * - `local` (default): localStorage + personal key flow
     * - `api`: company API login handlers (`onApiLogin` / `onApiRegister`)
     * - `artemis`: Artemis Google login (`onArtemisLogin`)
     */
    sync?: FivePixelsSync;
    fields?: ReportField[];
    /** Navigate in view mode when locating feedback on another route. */
    onNavigate?: (pathname: string) => void | Promise<void>;
    /** Attempt to reveal a target that is not on the current page. */
    onRevealTarget?: (report: ReportFeedback) => boolean | Promise<boolean>;
    github?: ReportGitHubConfig;
} & Partial<ReportPersistenceHandlers> & Partial<ReportTeamHandlers> & Partial<ReportAuthHandlers> & ReportSideEffectCallbacks;
/** `<ReportProvider />` = public props + children (custom UI assembly). */
export type ReportProviderProps = FivePixelsProps & {
    children: import("react").ReactNode;
};
//# sourceMappingURL=publicApi.d.ts.map