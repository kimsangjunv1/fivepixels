"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useReportPreferences, useReportSession } from "@/providers/reportContext.js";
import type { ReportAuthor, ReportAuthorRole, ReportReviewerRequest } from "@/types/report.js";
import {
    hasTeamAdminHandlers,
    hasTeamRequestHandler,
    isTeamWriteEnabled,
    resolveAuthorRole,
    sortTeamReviewers,
} from "@/utils/report/teamManagement.js";

function MemberRow({
    member,
    roleLabel,
    inactiveLabel,
    canEdit,
    activateLabel,
    deactivateLabel,
    onToggleActive,
    onChangeRole,
}: {
    member: ReportAuthor;
    roleLabel: string;
    inactiveLabel: string;
    canEdit: boolean;
    activateLabel: string;
    deactivateLabel: string;
    onToggleActive?: () => void;
    onChangeRole?: (role: ReportAuthorRole) => void;
}) {
    const inactive = member.isActive === false;

    return (
        <div className="flex flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0">
            <div className="flex items-start justify-between gap-[8px]">
                <div className="min-w-0 flex-1">
                    <p className={`truncate text-[13px] font-semibold ${inactive ? "text-[var(--adaptive-black500)]" : "text-[var(--adaptive-black900)]"}`}>
                        {member.name}
                    </p>
                    <p className="truncate text-[10px] text-[var(--adaptive-black600)]">{member.id}</p>
                </div>
                <span className="shrink-0 rounded-[4px] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black700)]">
                    {roleLabel}
                </span>
            </div>
            {inactive ? <p className="text-[11px] text-[var(--adaptive-black500)]">{inactiveLabel}</p> : null}
            {canEdit ? (
                <div className="flex flex-wrap gap-[6px]">
                    {onChangeRole ? (
                        <>
                            <button
                                type="button"
                                onClick={() => onChangeRole("reviewer")}
                                className="rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                            >
                                reviewer
                            </button>
                            <button
                                type="button"
                                onClick={() => onChangeRole("admin")}
                                className="rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                            >
                                admin
                            </button>
                        </>
                    ) : null}
                    {onToggleActive ? (
                        <button
                            type="button"
                            onClick={onToggleActive}
                            className="rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"
                        >
                            {inactive ? activateLabel : deactivateLabel}
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export function PanelTeamSettings() {
    const {
        messages,
        teamReviewers,
        isTeamAdmin,
        persistenceStatus,
        onListReviewers,
        onListReviewerRequests,
        onCreateReviewerRequest,
        onResolveReviewerRequest,
        onRegisterReviewer,
        onUpdateReviewer,
        publicKey,
        selfProfile,
        authors,
    } = useReportPreferences();
    const { setErrorMessage } = useReportSession();
    const team = messages.team;
    const writeEnabled = isTeamWriteEnabled(persistenceStatus);
    const adminHandlers = hasTeamAdminHandlers({
        onListReviewerRequests,
        onResolveReviewerRequest,
        onRegisterReviewer,
        onUpdateReviewer,
    });
    const canRequest = writeEnabled && hasTeamRequestHandler({ onCreateReviewerRequest });
    const canManage = writeEnabled && isTeamAdmin && adminHandlers;

    const [members, setMembers] = useState<ReportAuthor[]>(() => sortTeamReviewers(teamReviewers));
    const [requests, setRequests] = useState<ReportReviewerRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [manualName, setManualName] = useState("");
    const [manualId, setManualId] = useState("");
    const [manualPublicKey, setManualPublicKey] = useState("");
    const [requestSent, setRequestSent] = useState(false);

    const pendingRequests = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
    const memberCountLabel = team.memberCount(members.length);
    const modeHint = writeEnabled ? (canManage ? team.apiAdminHint : team.apiMemberHint) : team.localStorageHint;

    const reload = useCallback(async () => {
        if (!writeEnabled) {
            setMembers(sortTeamReviewers(teamReviewers));
            setRequests([]);
            return;
        }

        setLoading(true);
        try {
            const nextMembers = onListReviewers ? await onListReviewers() : teamReviewers;
            setMembers(sortTeamReviewers(nextMembers.filter((item) => item.isActive !== false || canManage)));

            if (canManage && onListReviewerRequests) {
                setRequests(await onListReviewerRequests());
            } else {
                setRequests([]);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.loadFailed);
        } finally {
            setLoading(false);
        }
    }, [canManage, onListReviewerRequests, onListReviewers, setErrorMessage, team.loadFailed, teamReviewers, writeEnabled]);

    useEffect(() => {
        void reload();
    }, [reload]);

    const handleSubmitRequest = async () => {
        if (!onCreateReviewerRequest || !publicKey || !selfProfile?.authorId || !selfProfile.name) {
            return;
        }

        setBusyId("request");
        try {
            await onCreateReviewerRequest({
                author_id: selfProfile.authorId,
                author_name: selfProfile.name,
                public_key: publicKey,
            });
            setRequestSent(true);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.requestFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleResolve = async (id: string, status: "approved" | "rejected") => {
        if (!onResolveReviewerRequest) {
            return;
        }

        setBusyId(id);
        try {
            await onResolveReviewerRequest(id, { status, role: "reviewer" });
            await reload();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.resolveFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleRegister = async () => {
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

        setBusyId("register");
        try {
            await onRegisterReviewer({ author_id, author_name, public_key, role: "reviewer" });
            setManualName("");
            setManualId("");
            setManualPublicKey("");
            await reload();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.registerFailed);
        } finally {
            setBusyId(null);
        }
    };

    const handleUpdate = async (member: ReportAuthor, patch: { role?: ReportAuthorRole; is_active?: boolean }) => {
        if (!onUpdateReviewer) {
            return;
        }

        setBusyId(member.id);
        try {
            await onUpdateReviewer(member.id, patch);
            await reload();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.updateFailed);
        } finally {
            setBusyId(null);
        }
    };

    const alreadyAuthorized = authors.some((author) => author.id === selfProfile?.authorId);

    return (
        <div className="flex flex-col">
            <div className="border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]">
                <p className="text-[12px] leading-[1.4] text-[var(--adaptive-black600)]">{modeHint}</p>
                <p className="mt-[6px] text-[11px] font-semibold text-[var(--adaptive-black700)]">{memberCountLabel}</p>
            </div>

            <section className="flex flex-col border-b border-[var(--adaptive-border-subtle)]">
                <p className="px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">
                    {team.sectionMembers}
                </p>
                {loading ? <p className="px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]">{team.loading}</p> : null}
                {!loading && members.length === 0 ? (
                    <p className="px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]">{team.emptyMembers}</p>
                ) : null}
                {members.map((member) => (
                    <MemberRow
                        key={member.id}
                        member={member}
                        roleLabel={resolveAuthorRole(member) === "admin" ? team.roleAdmin : team.roleReviewer}
                        inactiveLabel={team.inactive}
                        canEdit={canManage && Boolean(onUpdateReviewer) && busyId !== member.id}
                        onChangeRole={canManage && onUpdateReviewer ? (role) => void handleUpdate(member, { role }) : undefined}
                        onToggleActive={
                            canManage && onUpdateReviewer
                                ? () => void handleUpdate(member, { is_active: member.isActive === false })
                                : undefined
                        }
                        activateLabel={team.activate}
                        deactivateLabel={team.deactivate}
                    />
                ))}
            </section>

            {canRequest && !alreadyAuthorized ? (
                <section className="flex flex-col border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]">
                    <p className="mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">
                        {team.sectionMyRequest}
                    </p>
                    <p className="mb-[8px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]">{team.requestDescription}</p>
                    <button
                        type="button"
                        disabled={!publicKey || !selfProfile?.authorId || busyId === "request" || requestSent}
                        onClick={() => void handleSubmitRequest()}
                        className="w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {requestSent ? team.requestSent : team.submitRequest}
                    </button>
                </section>
            ) : null}

            {canManage ? (
                <>
                    <section className="flex flex-col border-b border-[var(--adaptive-border-subtle)]">
                        <p className="px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">
                            {team.sectionRequests}
                        </p>
                        {pendingRequests.length === 0 ? (
                            <p className="px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]">{team.emptyRequests}</p>
                        ) : (
                            pendingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex flex-col gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0"
                                >
                                    <div>
                                        <p className="text-[13px] font-semibold text-[var(--adaptive-black900)]">{request.author_name}</p>
                                        <p className="truncate text-[10px] text-[var(--adaptive-black600)]">{request.author_id}</p>
                                        <p className="mt-[4px] break-all text-[10px] text-[var(--adaptive-black500)]">{request.public_key}</p>
                                    </div>
                                    <div className="flex gap-[6px]">
                                        <button
                                            type="button"
                                            disabled={busyId === request.id}
                                            onClick={() => void handleResolve(request.id, "approved")}
                                            className="rounded-[6px] bg-[var(--adaptive-blue50)] px-[8px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-blue500)] disabled:opacity-50"
                                        >
                                            {team.approve}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busyId === request.id}
                                            onClick={() => void handleResolve(request.id, "rejected")}
                                            className="rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50"
                                        >
                                            {team.reject}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>

                    {onRegisterReviewer ? (
                        <section className="flex flex-col px-[12px] py-[10px]">
                            <p className="mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]">
                                {team.sectionManual}
                            </p>
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
                                    onClick={() => void handleRegister()}
                                    className="w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50"
                                >
                                    {team.register}
                                </button>
                            </div>
                        </section>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}
