import type { FeedbackDisplayStatus } from "@/constants/feedbackStatus.js";
import type { RouteDetailStatus } from "@/utils/routeDetailStatus.js";
import { MaterialIcon, type MaterialIconProps } from "@/components/icons/MaterialIcon.js";

const FLAG_PATH = "M280-400v240q0 17-11.5 28.5T240-120q-17 0-28.5-11.5T200-160v-600q0-17 11.5-28.5T240-800h287q14 0 25 9t14 23l10 48h184q17 0 28.5 11.5T800-680v320q0 17-11.5 28.5T760-320H553q-14 0-25-9t-14-23l-10-48H280Zm306 0h134v-240H543q-14 0-25-9t-14-23l-10-48H280v240h257q14 0 25 9t14 23l10 48Zm-86-160Z";
const SCHEDULE_PATH =
    "M520-496v-144q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v159q0 8 3 15.5t9 13.5l132 132q11 11 28 11t28-11q11-11 11-28t-11-28L520-496ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z";
const AUTORENEW_PATH =
    "M240-478q0 16 2 31.5t7 30.5q5 17-1 32.5T227-361q-16 8-31.5 1.5T175-383q-8-23-11.5-47t-3.5-48q0-134 93-228t227-94h7l-36-36q-11-11-11-28t11-28q11-11 28-11t28 11l104 104q12 12 12 28t-12 28L507-628q-11 11-28 11t-28-11q-11-11-11-28t11-28l36-36h-7q-100 0-170 70.5T240-478Zm480-4q0-16-2-31.5t-7-30.5q-5-17 1-32.5t21-22.5q16-8 31.5-1.5T785-577q8 23 11.5 47t3.5 48q0 134-93 228t-227 94h-7l36 36q11 11 11 28t-11 28q-11 11-28 11t-28-11L508-332q-12-12-12-28t12-28l104-104q11-11 28-11t28 11q11 11 11 28t-11 28l-36 36h7q100 0 170-69.5T720-482Z";
const ADD_PATH = "M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z";
const CHECK_CIRCLE_PATH =
    "m424-408-86-86q-11-11-28-11t-28 11q-11 11-11 28t11 28l114 114q12 12 28 12t28-12l226-226q11-11 11-28t-11-28q-11-11-28-11t-28 11L424-408Zm56 328q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z";
const REMOVE_PATH = "M240-440q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h480q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H240Z";

function StatusGlyph({ path, className, fill }: { path: string } & MaterialIconProps) {
    return (
        <MaterialIcon
            className={className}
            fill={fill}
        >
            <path d={path} />
        </MaterialIcon>
    );
}

export function WaitStatusIcon(props: MaterialIconProps) {
    return (
        <StatusGlyph
            path={SCHEDULE_PATH}
            {...props}
        />
    );
}

export function RouteWaitStatusIcon(props: MaterialIconProps) {
    return (
        <StatusGlyph
            path={FLAG_PATH}
            {...props}
        />
    );
}

export function SuggestedStatusIcon(props: MaterialIconProps) {
    return (
        <StatusGlyph
            path={AUTORENEW_PATH}
            {...props}
        />
    );
}

export function GitIssuedStatusIcon(props: MaterialIconProps) {
    return (
        <StatusGlyph
            path={ADD_PATH}
            {...props}
        />
    );
}

export function ResolvedStatusIcon(props: MaterialIconProps) {
    return (
        <StatusGlyph
            path={CHECK_CIRCLE_PATH}
            {...props}
        />
    );
}

export function FoundErrorStatusIcon(props: MaterialIconProps) {
    return (
        <StatusGlyph
            path={REMOVE_PATH}
            {...props}
        />
    );
}

export function FeedbackStatusIcon({ status, className, fill }: { status: FeedbackDisplayStatus } & MaterialIconProps) {
    if (status === "resolved") {
        return (
            <ResolvedStatusIcon
                className={className}
                fill={fill}
            />
        );
    }

    if (status === "found_error") {
        return (
            <FoundErrorStatusIcon
                className={className}
                fill={fill}
            />
        );
    }

    if (status === "git_issued") {
        return (
            <GitIssuedStatusIcon
                className={className}
                fill={fill}
            />
        );
    }

    if (status === "suggested" || status === "recheck_requested") {
        return (
            <SuggestedStatusIcon
                className={className}
                fill={fill}
            />
        );
    }

    return (
        <WaitStatusIcon
            className={className}
            fill={fill}
        />
    );
}

export function RouteDetailStatusIcon({ status, className, fill }: { status: RouteDetailStatus } & MaterialIconProps) {
    if (status === "wait") {
        return (
            <RouteWaitStatusIcon
                className={className}
                fill={fill}
            />
        );
    }

    if (status === "suggested") {
        return (
            <SuggestedStatusIcon
                className={className}
                fill={fill}
            />
        );
    }

    if (status === "git_issued") {
        return (
            <GitIssuedStatusIcon
                className={className}
                fill={fill}
            />
        );
    }

    return (
        <ResolvedStatusIcon
            className={className}
            fill={fill}
        />
    );
}
