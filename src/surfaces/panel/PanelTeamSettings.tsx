"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReportPreferences, useReportSession } from "@/shared/providers/reportContext.js";
import type { ReportAuthor, ReportAuthorRole, ReportReviewerRequest } from "@/shared/types/report.js";
import {
    canAssignTeamRole,
    canEditTeamMember,
    filterVisibleTeamMembers,
    hasTeamAdminHandlers,
    isJoinedTeamMember,
    isTeamWriteEnabled,
    listAssignableRoles,
    resolveAuthorRole,
    sortTeamReviewers,
} from "@/shared/utils/report/teamManagement.js";
import { LockIcon } from "@/shared/components/icons/Icons.js";
import { HoverTooltip } from "@/surfaces/tooltip/HoverTooltip.js";
import { useIntegrationLock } from "@/shared/components/ui/IntegrationLock.js";
import { NoticeDialog } from "@/shared/components/ui/NoticeDialog.js";

function roleLabelFor(role: ReportAuthorRole, team: { roleAdmin: string; roleSubAdmin: string; roleMember: string }) {
    if (role === "admin") {
        return team.roleAdmin;
    }
    if (role === "sub_admin") {
        return team.roleSubAdmin;
    }
    return team.roleMember;
}

function MemberRow({
    member,
    roleLabel,
    roleMessages,
    inactiveLabel,
    canEdit,
    canJoin,
    apiMode,
    assignableRoles,
    editRoleLabel,
    activateLabel,
    deactivateLabel,
    deleteLabel,
    joinLabel,
    onToggleActive,
    onChangeRole,
    onDelete,
    onJoin,
}: {
    member: ReportAuthor;
    roleLabel: string;
    roleMessages: { roleAdmin: string; roleSubAdmin: string; roleMember: string };
    inactiveLabel: string;
    canEdit: boolean;
    canJoin: boolean;
    apiMode: boolean;
    assignableRoles: ReportAuthorRole[];
    editRoleLabel: string;
    activateLabel: string;
    deactivateLabel: string;
    deleteLabel: string;
    joinLabel: string;
    onToggleActive?: () => void;
    onChangeRole?: (role: ReportAuthorRole) => void;
    onDelete?: () => void;
    onJoin?: () => void;
}) {
    const inactive = member.isActive === false;
    const joined = isJoinedTeamMember(member);

    return (
        <div className="flex flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0">
            <div className="flex items-start justify-between gap-[8px]">
                <div className="min-w-0 flex-1">
                    <p className={`truncate text-[14px] font-semibold ${inactive ? "text-[var(--adaptive-black500)]" : "text-[var(--adaptive-black900)]"}`}>{member.name}</p>
                    <p className="truncate text-[12px] text-[var(--adaptive-black600)]">{member.id}</p>
                </div>
                {joined ? (
                    <span className="shrink-0 rounded-[4px] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[12px] font-semibold text-[var(--adaptive-black700)]">{roleLabel}</span>
                ) : canJoin && onJoin ? (
                    <button
                        type="button"
                        onClick={onJoin}
                        className="shrink-0 rounded-[6px] bg-[var(--adaptive-blue50)] px-[8px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-blue500)] hover:bg-[color-mix(in_srgb,var(--adaptive-blue500)_12%,transparent)]"
                    >
                        {joinLabel}
                    </button>
                ) : null}
            </div>
            {inactive ? <p className="text-[12px] text-[var(--adaptive-black500)]">{inactiveLabel}</p> : null}
            {canEdit ? (
                <div className="flex flex-col gap-[6px]">
                    {onChangeRole ? (
                        <div className="flex flex-col gap-[4px]">
                            <p className="text-[12px] font-semibold text-[var(--adaptive-black600)]">{editRoleLabel}</p>
                            <div className="flex flex-wrap gap-[6px]">
                                {assignableRoles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => onChangeRole(role)}
                                        className={`rounded-[6px] px-[8px] py-[4px] text-[12px] ${
                                            resolveAuthorRole(member) === role
                                                ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                                : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                                        }`}
                                    >
                                        {roleLabelFor(role, roleMessages)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                    <div className="flex flex-wrap gap-[6px]">
                        {!apiMode && onToggleActive ? (
                            <button
                                type="button"
                                onClick={onToggleActive}
                                className="rounded-[6px] px-[8px] py-[4px] text-[12px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                            >
                                {inactive ? activateLabel : deactivateLabel}
                            </button>
                        ) : null}
                        {apiMode && onDelete ? (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="rounded-[6px] px-[8px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-red500)] hover:bg-[color-mix(in_srgb,var(--adaptive-red500)_10%,transparent)]"
                            >
                                {deleteLabel}
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export function PanelTeamSettings() {
    const {
        messages,
        teamReviewers,
        teamActor,
        canAccessTeamSettings,
        persistenceStatus,
        apiTeamDirectory,
        apiTeamMembersLoading,
        refreshTeamMembers,
        onListReviewerRequests,
        onResolveReviewerRequest,
        onRegisterReviewer,
        onUpdateReviewer,
        onDeleteReviewer,
    } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const team = messages.team;
    const teamManageLock = useIntegrationLock("teamManage");
    const writeEnabled = isTeamWriteEnabled(persistenceStatus);
    const adminHandlers = hasTeamAdminHandlers({
        onListReviewerRequests,
        onResolveReviewerRequest,
        onRegisterReviewer,
        onUpdateReviewer,
    });
    const canManage = writeEnabled && canAccessTeamSettings && adminHandlers;
    const localManageMode = !writeEnabled && canAccessTeamSettings && adminHandlers;
    const assignableRoles = useMemo(() => listAssignableRoles(teamActor), [teamActor]);
    const defaultRegisterRole = assignableRoles.includes("member") ? "member" : assignableRoles[0];

    const onListReviewerRequestsRef = useRef(onListReviewerRequests);
    const refreshTeamMembersRef = useRef(refreshTeamMembers);
    const teamActorRef = useRef(teamActor);
    const teamReviewersRef = useRef(teamReviewers);

    useEffect(() => {
        onListReviewerRequestsRef.current = onListReviewerRequests;
    }, [onListReviewerRequests]);

    useEffect(() => {
        refreshTeamMembersRef.current = refreshTeamMembers;
    }, [refreshTeamMembers]);

    useEffect(() => {
        teamActorRef.current = teamActor;
    }, [teamActor]);

    useEffect(() => {
        teamReviewersRef.current = teamReviewers;
    }, [teamReviewers]);

    const [members, setMembers] = useState<ReportAuthor[]>(() => sortTeamReviewers(filterVisibleTeamMembers(teamActor, teamReviewers)));
    const [requests, setRequests] = useState<ReportReviewerRequest[]>([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [manualName, setManualName] = useState("");
    const [manualId, setManualId] = useState("");
    const [manualPublicKey, setManualPublicKey] = useState("");
    const [manualRole, setManualRole] = useState<ReportAuthorRole>("member");
    const [approveRole, setApproveRole] = useState<ReportAuthorRole>("member");
    const [apiUserId, setApiUserId] = useState("");
    const [apiRole, setApiRole] = useState<ReportAuthorRole>("member");

    useEffect(() => {
        if (defaultRegisterRole) {
            setManualRole(defaultRegisterRole);
            setApproveRole(defaultRegisterRole);
            setApiRole(defaultRegisterRole);
        }
    }, [defaultRegisterRole]);

    const pendingRequests = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
    const memberCountLabel = team.memberCount(members.length);
    const modeHint = writeEnabled ? (canManage ? team.apiAdminHint : team.apiMemberHint) : team.localStorageHint;
    const loading = writeEnabled ? apiTeamMembersLoading : localLoading;

    useEffect(() => {
        if (!canAccessTeamSettings) {
            setMembers([]);
            return;
        }

        if (writeEnabled) {
            if (!apiTeamDirectory) {
                return;
            }

            setMembers(sortTeamReviewers(filterVisibleTeamMembers(teamActorRef.current, apiTeamDirectory)));
            return;
        }

        setMembers(sortTeamReviewers(filterVisibleTeamMembers(teamActorRef.current, teamReviewersRef.current)));
    }, [apiTeamDirectory, canAccessTeamSettings, writeEnabled]);

    const reloadLocalRequests = useCallback(async () => {
        if (!canAccessTeamSettings || !localManageMode) {
            setRequests([]);
            return;
        }

        setLocalLoading(true);
        try {
            const listReviewerRequests = onListReviewerRequestsRef.current;
            if (listReviewerRequests) {
                setRequests(await listReviewerRequests());
            } else {
                setRequests([]);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.loadFailed);
        } finally {
            setLocalLoading(false);
        }
    }, [canAccessTeamSettings, localManageMode, setErrorMessage, team.loadFailed]);

    useEffect(() => {
        void reloadLocalRequests();
    }, [reloadLocalRequests]);

    const reloadAfterMutation = useCallback(async () => {
        if (writeEnabled) {
            try {
                await refreshTeamMembersRef.current();
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : team.loadFailed);
            }
            return;
        }

        await reloadLocalRequests();
    }, [reloadLocalRequests, setErrorMessage, team.loadFailed, writeEnabled]);

    const handleResolve = async (id: string, status: "approved" | "rejected") => {
        if (!onResolveReviewerRequest) {
            return;
        }
        if (status === "approved" && !canAssignTeamRole(teamActor, approveRole)) {
            setErrorMessage(team.roleNotAllowed);
            return;
        }

        setBusyId(id);
        try {
            await onResolveReviewerRequest(id, { status, role: status === "approved" ? approveRole : undefined });
            await reloadAfterMutation();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.resolveFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleLocalRegister = async () => {
        if (!onRegisterReviewer) {
            return;
        }

        const author_name = manualName.trim();
        const author_id = manualId.trim();
        const public_key = manualPublicKey.trim();
        if (!author_name || !author_id || !public_key) {
            setErrorMessage(team.manualRequired);
            return;
        }
        if (!canAssignTeamRole(teamActor, manualRole)) {
            setErrorMessage(team.roleNotAllowed);
            return;
        }

        setBusyId("register");
        try {
            await onRegisterReviewer({ author_id, author_name, public_key, role: manualRole });
            setManualName("");
            setManualId("");
            setManualPublicKey("");
            await reloadAfterMutation();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.registerFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleApiRegister = async () => {
        if (!onRegisterReviewer) {
            return;
        }

        const userId = apiUserId.trim();
        if (!userId) {
            setErrorMessage(team.apiRegisterRequired);
            return;
        }
        if (!canAssignTeamRole(teamActor, apiRole)) {
            setErrorMessage(team.roleNotAllowed);
            return;
        }

        setBusyId("register");
        try {
            await onRegisterReviewer({
                author_id: userId,
                author_name: userId,
                public_key: "",
                role: apiRole,
            });
            setApiUserId("");
            await reloadAfterMutation();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.registerFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleJoinMember = async (member: ReportAuthor) => {
        if (!onRegisterReviewer) {
            return;
        }
        if (!canAssignTeamRole(teamActor, apiRole)) {
            setErrorMessage(team.roleNotAllowed);
            return;
        }

        setBusyId(member.id);
        try {
            await onRegisterReviewer({
                author_id: member.id,
                author_name: member.name,
                public_key: "",
                role: apiRole,
            });
            await reloadAfterMutation();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.registerFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleUpdate = async (member: ReportAuthor, patch: { role?: ReportAuthorRole; is_active?: boolean }) => {
        if (!onUpdateReviewer || !canEditTeamMember(teamActor, member)) {
            return;
        }
        if (patch.role && !canAssignTeamRole(teamActor, patch.role)) {
            setErrorMessage(team.roleNotAllowed);
            return;
        }

        setBusyId(member.id);
        try {
            await onUpdateReviewer(member.id, patch);
            await reloadAfterMutation();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.updateFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (member: ReportAuthor) => {
        if (!onDeleteReviewer || !canEditTeamMember(teamActor, member)) {
            return;
        }

        setBusyId(member.id);
        try {
            await onDeleteReviewer(member.id);
            await reloadAfterMutation();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.deleteFailed);
        } finally {
            setBusyId(null);
        }
    };

    if (!canAccessTeamSettings) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]">
                <p className="inline-flex items-center gap-[6px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">
                    {modeHint}
                    {teamManageLock.locked ? (
                        <HoverTooltip
                            label={teamManageLock.tooltipLabel}
                            multiline
                        >
                            <span className="inline-flex text-[var(--adaptive-black500)]">
                                <LockIcon className="h-[12px] w-[12px]" />
                            </span>
                        </HoverTooltip>
                    ) : null}
                </p>
                <p className="mt-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]">{memberCountLabel}</p>
            </div>

            <section className="flex flex-col border-b border-[var(--adaptive-border-subtle)]">
                <p className="px-[12px] pt-[10px] pb-[4px] text-[12px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{team.sectionMembers}</p>
                {loading ? <p className="px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]">{team.loading}</p> : null}
                {!loading && members.length === 0 ? (
                    <NoticeDialog
                        role="status"
                        title={team.emptyMembers}
                    />
                ) : null}
                {members.map((member) => {
                    const joined = isJoinedTeamMember(member);
                    const editable = joined && canManage && Boolean(onUpdateReviewer) && canEditTeamMember(teamActor, member) && busyId !== member.id;
                    const deletable = editable && Boolean(onDeleteReviewer) && writeEnabled;
                    const joinable = !joined && canManage && Boolean(onRegisterReviewer) && busyId !== member.id;
                    return (
                        <MemberRow
                            key={member.id}
                            member={member}
                            roleLabel={roleLabelFor(resolveAuthorRole(member), team)}
                            roleMessages={team}
                            inactiveLabel={team.inactive}
                            canEdit={editable}
                            canJoin={joinable}
                            apiMode={writeEnabled}
                            assignableRoles={assignableRoles}
                            editRoleLabel={team.editRole}
                            activateLabel={team.activate}
                            deactivateLabel={team.deactivate}
                            deleteLabel={team.deleteMember}
                            joinLabel={team.join}
                            onChangeRole={editable ? (role) => void handleUpdate(member, { role }) : undefined}
                            onToggleActive={editable && !writeEnabled ? () => void handleUpdate(member, { is_active: member.isActive === false }) : undefined}
                            onDelete={deletable ? () => void handleDelete(member) : undefined}
                            onJoin={joinable ? () => void handleJoinMember(member) : undefined}
                        />
                    );
                })}
            </section>

            {localManageMode ? (
                <>
                    <section className="flex flex-col border-b border-[var(--adaptive-border-subtle)]">
                        <p className="px-[12px] pt-[10px] pb-[4px] text-[12px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{team.sectionRequests}</p>
                        {assignableRoles.length > 0 ? (
                            <div className="flex flex-wrap gap-[6px] px-[12px] pb-[8px]">
                                <p className="w-full text-[12px] text-[var(--adaptive-black600)]">{team.approveAsRole}</p>
                                {assignableRoles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setApproveRole(role)}
                                        className={`rounded-[6px] px-[8px] py-[4px] text-[12px] ${
                                            approveRole === role
                                                ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                                : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                                        }`}
                                    >
                                        {roleLabelFor(role, team)}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        {pendingRequests.length === 0 ? (
                            <NoticeDialog
                                role="status"
                                title={team.emptyRequests}
                            />
                        ) : (
                            pendingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex flex-col gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0"
                                >
                                    <div>
                                        <p className="text-[14px] font-semibold text-[var(--adaptive-black900)]">{request.author_name}</p>
                                        <p className="truncate text-[12px] text-[var(--adaptive-black600)]">{request.author_id}</p>
                                        <p className="mt-[4px] break-all text-[12px] text-[var(--adaptive-black500)]">{request.public_key}</p>
                                    </div>
                                    <div className="flex gap-[6px]">
                                        <button
                                            type="button"
                                            disabled={busyId === request.id}
                                            onClick={() => void handleResolve(request.id, "approved")}
                                            className="rounded-[6px] bg-[var(--adaptive-blue50)] px-[8px] py-[4px] text-[12px] font-semibold text-[var(--adaptive-blue500)] disabled:opacity-50"
                                        >
                                            {team.approve}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busyId === request.id}
                                            onClick={() => void handleResolve(request.id, "rejected")}
                                            className="rounded-[6px] px-[8px] py-[4px] text-[12px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50"
                                        >
                                            {team.reject}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>

                    {onRegisterReviewer && assignableRoles.length > 0 ? (
                        <section className="flex flex-col px-[12px] py-[10px]">
                            <p className="mb-[6px] text-[12px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{team.sectionManual}</p>
                            <div className="mb-[8px] flex flex-wrap gap-[6px]">
                                {assignableRoles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setManualRole(role)}
                                        className={`rounded-[6px] px-[8px] py-[4px] text-[12px] ${
                                            manualRole === role
                                                ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                                : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                                        }`}
                                    >
                                        {roleLabelFor(role, team)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-[6px]">
                                <input
                                    value={manualName}
                                    onChange={(event) => setManualName(event.target.value)}
                                    placeholder={team.manualNamePlaceholder}
                                    className="rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none"
                                />
                                <input
                                    value={manualId}
                                    onChange={(event) => setManualId(event.target.value)}
                                    placeholder={team.manualIdPlaceholder}
                                    className="rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none"
                                />
                                <textarea
                                    value={manualPublicKey}
                                    onChange={(event) => setManualPublicKey(event.target.value)}
                                    placeholder={team.manualPublicKeyPlaceholder}
                                    rows={3}
                                    className="rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none"
                                />
                                <button
                                    type="button"
                                    disabled={busyId === "register"}
                                    onClick={() => void handleLocalRegister()}
                                    className="w-full rounded-[8px] px-[12px] py-[8px] text-left text-[14px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50"
                                >
                                    {team.register}
                                </button>
                            </div>
                        </section>
                    ) : null}
                </>
            ) : null}

            {canManage && writeEnabled && onRegisterReviewer && assignableRoles.length > 0 ? (
                <section className="flex flex-col px-[12px] py-[10px]">
                    <p className="mb-[6px] text-[12px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">{team.sectionRegister}</p>
                    <div className="mb-[8px] flex flex-wrap gap-[6px]">
                        {assignableRoles.map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setApiRole(role)}
                                className={`rounded-[6px] px-[8px] py-[4px] text-[12px] ${
                                    apiRole === role
                                        ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                        : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                                }`}
                            >
                                {roleLabelFor(role, team)}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-[6px]">
                        <input
                            value={apiUserId}
                            onChange={(event) => setApiUserId(event.target.value)}
                            placeholder={team.apiUserIdPlaceholder}
                            className="rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none"
                        />
                        <button
                            type="button"
                            disabled={busyId === "register"}
                            onClick={() => void handleApiRegister()}
                            className="w-full rounded-[8px] px-[12px] py-[8px] text-left text-[14px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50"
                        >
                            {team.register}
                        </button>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
