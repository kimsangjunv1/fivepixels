"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { hasTeamAdminHandlers, hasTeamRequestHandler, isTeamWriteEnabled, resolveAuthorRole, sortTeamReviewers, } from "../../utils/report/teamManagement.js";
function MemberRow({ member, roleLabel, inactiveLabel, canEdit, activateLabel, deactivateLabel, onToggleActive, onChangeRole, }) {
    const inactive = member.isActive === false;
    return (_jsxs("div", { className: "flex flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: `truncate text-[13px] font-semibold ${inactive ? "text-[var(--adaptive-black500)]" : "text-[var(--adaptive-black900)]"}`, children: member.name }), _jsx("p", { className: "truncate text-[10px] text-[var(--adaptive-black600)]", children: member.id })] }), _jsx("span", { className: "shrink-0 rounded-[4px] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black700)]", children: roleLabel })] }), inactive ? _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: inactiveLabel }) : null, canEdit ? (_jsxs("div", { className: "flex flex-wrap gap-[6px]", children: [onChangeRole ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => onChangeRole("reviewer"), className: "rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]", children: "reviewer" }), _jsx("button", { type: "button", onClick: () => onChangeRole("admin"), className: "rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]", children: "admin" })] })) : null, onToggleActive ? (_jsx("button", { type: "button", onClick: onToggleActive, className: "rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]", children: inactive ? activateLabel : deactivateLabel })) : null] })) : null] }));
}
export function PanelTeamSettings() {
    const { messages, teamReviewers, isTeamAdmin, persistenceStatus, onListReviewers, onListReviewerRequests, onCreateReviewerRequest, onResolveReviewerRequest, onRegisterReviewer, onUpdateReviewer, publicKey, selfProfile, authors, } = useReportPreferences();
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
    const [members, setMembers] = useState(() => sortTeamReviewers(teamReviewers));
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
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
            }
            else {
                setRequests([]);
            }
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.loadFailed);
        }
        finally {
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
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.requestFailed);
        }
        finally {
            setBusyId(null);
        }
    };
    const handleResolve = async (id, status) => {
        if (!onResolveReviewerRequest) {
            return;
        }
        setBusyId(id);
        try {
            await onResolveReviewerRequest(id, { status, role: "reviewer" });
            await reload();
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.resolveFailed);
        }
        finally {
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
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.registerFailed);
        }
        finally {
            setBusyId(null);
        }
    };
    const handleUpdate = async (member, patch) => {
        if (!onUpdateReviewer) {
            return;
        }
        setBusyId(member.id);
        try {
            await onUpdateReviewer(member.id, patch);
            await reload();
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.updateFailed);
        }
        finally {
            setBusyId(null);
        }
    };
    const alreadyAuthorized = authors.some((author) => author.id === selfProfile?.authorId);
    return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]", children: [_jsx("p", { className: "text-[12px] leading-[1.4] text-[var(--adaptive-black600)]", children: modeHint }), _jsx("p", { className: "mt-[6px] text-[11px] font-semibold text-[var(--adaptive-black700)]", children: memberCountLabel })] }), _jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)]", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionMembers }), loading ? _jsx("p", { className: "px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]", children: team.loading }) : null, !loading && members.length === 0 ? (_jsx("p", { className: "px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]", children: team.emptyMembers })) : null, members.map((member) => (_jsx(MemberRow, { member: member, roleLabel: resolveAuthorRole(member) === "admin" ? team.roleAdmin : team.roleReviewer, inactiveLabel: team.inactive, canEdit: canManage && Boolean(onUpdateReviewer) && busyId !== member.id, onChangeRole: canManage && onUpdateReviewer ? (role) => void handleUpdate(member, { role }) : undefined, onToggleActive: canManage && onUpdateReviewer
                            ? () => void handleUpdate(member, { is_active: member.isActive === false })
                            : undefined, activateLabel: team.activate, deactivateLabel: team.deactivate }, member.id)))] }), canRequest && !alreadyAuthorized ? (_jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]", children: [_jsx("p", { className: "mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionMyRequest }), _jsx("p", { className: "mb-[8px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]", children: team.requestDescription }), _jsx("button", { type: "button", disabled: !publicKey || !selfProfile?.authorId || busyId === "request" || requestSent, onClick: () => void handleSubmitRequest(), className: "w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:cursor-not-allowed disabled:opacity-50", children: requestSent ? team.requestSent : team.submitRequest })] })) : null, canManage ? (_jsxs(_Fragment, { children: [_jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)]", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionRequests }), pendingRequests.length === 0 ? (_jsx("p", { className: "px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]", children: team.emptyRequests })) : (pendingRequests.map((request) => (_jsxs("div", { className: "flex flex-col gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[13px] font-semibold text-[var(--adaptive-black900)]", children: request.author_name }), _jsx("p", { className: "truncate text-[10px] text-[var(--adaptive-black600)]", children: request.author_id }), _jsx("p", { className: "mt-[4px] break-all text-[10px] text-[var(--adaptive-black500)]", children: request.public_key })] }), _jsxs("div", { className: "flex gap-[6px]", children: [_jsx("button", { type: "button", disabled: busyId === request.id, onClick: () => void handleResolve(request.id, "approved"), className: "rounded-[6px] bg-[var(--adaptive-blue50)] px-[8px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-blue500)] disabled:opacity-50", children: team.approve }), _jsx("button", { type: "button", disabled: busyId === request.id, onClick: () => void handleResolve(request.id, "rejected"), className: "rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50", children: team.reject })] })] }, request.id))))] }), onRegisterReviewer ? (_jsxs("section", { className: "flex flex-col px-[12px] py-[10px]", children: [_jsx("p", { className: "mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionManual }), _jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsx("input", { value: manualName, onChange: (event) => setManualName(event.target.value), placeholder: team.manualNamePlaceholder, className: "rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none" }), _jsx("input", { value: manualId, onChange: (event) => setManualId(event.target.value), placeholder: team.manualIdPlaceholder, className: "rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none" }), _jsx("textarea", { value: manualPublicKey, onChange: (event) => setManualPublicKey(event.target.value), placeholder: team.manualPublicKeyPlaceholder, rows: 3, className: "rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none" }), _jsx("button", { type: "button", disabled: busyId === "register", onClick: () => void handleRegister(), className: "w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50", children: team.register })] })] })) : null] })) : null] }));
}
//# sourceMappingURL=PanelTeamSettings.js.map