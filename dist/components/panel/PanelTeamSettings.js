"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReportPreferences, useReportSession } from "../../providers/reportContext.js";
import { canAssignTeamRole, canEditTeamMember, filterVisibleTeamMembers, hasTeamAdminHandlers, isTeamWriteEnabled, listAssignableRoles, resolveAuthorRole, sortTeamReviewers, } from "../../utils/report/teamManagement.js";
import { LockIcon } from "../../components/icons/Icons.js";
import { HoverTooltip } from "../../components/ui/HoverTooltip.js";
import { useIntegrationLock } from "../../components/ui/IntegrationLock.js";
import { ReportPanelNoticeDialog } from "./ReportPanelNoticeDialog.js";
function roleLabelFor(role, team) {
    if (role === "admin") {
        return team.roleAdmin;
    }
    if (role === "sub_admin") {
        return team.roleSubAdmin;
    }
    return team.roleMember;
}
function MemberRow({ member, roleLabel, roleMessages, inactiveLabel, canEdit, apiMode, assignableRoles, editRoleLabel, activateLabel, deactivateLabel, deleteLabel, onToggleActive, onChangeRole, onDelete, }) {
    const inactive = member.isActive === false;
    return (_jsxs("div", { className: "flex flex-col gap-[6px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-[8px]", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: `truncate text-[13px] font-semibold ${inactive ? "text-[var(--adaptive-black500)]" : "text-[var(--adaptive-black900)]"}`, children: member.name }), _jsx("p", { className: "truncate text-[10px] text-[var(--adaptive-black600)]", children: member.id })] }), _jsx("span", { className: "shrink-0 rounded-[4px] bg-[var(--adaptive-black100)] px-[6px] py-[2px] text-[10px] font-semibold text-[var(--adaptive-black700)]", children: roleLabel })] }), inactive ? _jsx("p", { className: "text-[11px] text-[var(--adaptive-black500)]", children: inactiveLabel }) : null, canEdit ? (_jsxs("div", { className: "flex flex-col gap-[6px]", children: [onChangeRole ? (_jsxs("div", { className: "flex flex-col gap-[4px]", children: [_jsx("p", { className: "text-[10px] font-semibold text-[var(--adaptive-black600)]", children: editRoleLabel }), _jsx("div", { className: "flex flex-wrap gap-[6px]", children: assignableRoles.map((role) => (_jsx("button", { type: "button", onClick: () => onChangeRole(role), className: `rounded-[6px] px-[8px] py-[4px] text-[11px] ${resolveAuthorRole(member) === role
                                        ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                        : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`, children: roleLabelFor(role, roleMessages) }, role))) })] })) : null, _jsxs("div", { className: "flex flex-wrap gap-[6px]", children: [!apiMode && onToggleActive ? (_jsx("button", { type: "button", onClick: onToggleActive, className: "rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]", children: inactive ? activateLabel : deactivateLabel })) : null, apiMode && onDelete ? (_jsx("button", { type: "button", onClick: onDelete, className: "rounded-[6px] px-[8px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-red500)] hover:bg-[color-mix(in_srgb,var(--adaptive-red500)_10%,transparent)]", children: deleteLabel })) : null] })] })) : null] }));
}
export function PanelTeamSettings() {
    const { messages, teamReviewers, teamActor, canAccessTeamSettings, persistenceStatus, onListReviewers, onListReviewerRequests, onResolveReviewerRequest, onRegisterReviewer, onUpdateReviewer, onDeleteReviewer, } = useReportPreferences();
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
    const onListReviewersRef = useRef(onListReviewers);
    const onListReviewerRequestsRef = useRef(onListReviewerRequests);
    useEffect(() => {
        onListReviewersRef.current = onListReviewers;
    }, [onListReviewers]);
    useEffect(() => {
        onListReviewerRequestsRef.current = onListReviewerRequests;
    }, [onListReviewerRequests]);
    const [members, setMembers] = useState(() => sortTeamReviewers(filterVisibleTeamMembers(teamActor, teamReviewers)));
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [manualName, setManualName] = useState("");
    const [manualId, setManualId] = useState("");
    const [manualPublicKey, setManualPublicKey] = useState("");
    const [manualRole, setManualRole] = useState("member");
    const [approveRole, setApproveRole] = useState("member");
    const [apiUserId, setApiUserId] = useState("");
    const [apiRole, setApiRole] = useState("member");
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
    const reload = useCallback(async () => {
        if (!canAccessTeamSettings) {
            setMembers([]);
            setRequests([]);
            return;
        }
        setLoading(true);
        try {
            const listReviewers = onListReviewersRef.current;
            const nextMembers = listReviewers && writeEnabled ? await listReviewers() : teamReviewers;
            setMembers(sortTeamReviewers(filterVisibleTeamMembers(teamActor, nextMembers)));
            const listReviewerRequests = onListReviewerRequestsRef.current;
            if (localManageMode && listReviewerRequests) {
                setRequests(await listReviewerRequests());
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
    }, [canAccessTeamSettings, localManageMode, setErrorMessage, team.loadFailed, teamActor, teamReviewers, writeEnabled]);
    useEffect(() => {
        void reload();
    }, [reload]);
    const handleResolve = async (id, status) => {
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
            await reload();
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.resolveFailed);
        }
        finally {
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
            await reload();
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.registerFailed);
        }
        finally {
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
            await reload();
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.updateFailed);
        }
        finally {
            setBusyId(null);
        }
    };
    const handleDelete = async (member) => {
        if (!onDeleteReviewer || !canEditTeamMember(teamActor, member)) {
            return;
        }
        setBusyId(member.id);
        try {
            await onDeleteReviewer(member.id);
            await reload();
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : team.deleteFailed);
        }
        finally {
            setBusyId(null);
        }
    };
    if (!canAccessTeamSettings) {
        return null;
    }
    return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px]", children: [_jsxs("p", { className: "inline-flex items-center gap-[6px] text-[12px] leading-[1.4] text-[var(--adaptive-black600)]", children: [modeHint, teamManageLock.locked ? (_jsx(HoverTooltip, { label: teamManageLock.tooltipLabel, multiline: true, children: _jsx("span", { className: "inline-flex text-[var(--adaptive-black500)]", children: _jsx(LockIcon, { className: "h-[12px] w-[12px]" }) }) })) : null] }), _jsx("p", { className: "mt-[6px] text-[11px] font-semibold text-[var(--adaptive-black700)]", children: memberCountLabel })] }), _jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)]", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionMembers }), loading ? _jsx("p", { className: "px-[12px] py-[10px] text-[12px] text-[var(--adaptive-black600)]", children: team.loading }) : null, !loading && members.length === 0 ? (_jsx(ReportPanelNoticeDialog, { role: "status", title: team.emptyMembers })) : null, members.map((member) => {
                        const editable = canManage && Boolean(onUpdateReviewer) && canEditTeamMember(teamActor, member) && busyId !== member.id;
                        const deletable = editable && Boolean(onDeleteReviewer) && writeEnabled;
                        return (_jsx(MemberRow, { member: member, roleLabel: roleLabelFor(resolveAuthorRole(member), team), roleMessages: team, inactiveLabel: team.inactive, canEdit: editable, apiMode: writeEnabled, assignableRoles: assignableRoles, editRoleLabel: team.editRole, activateLabel: team.activate, deactivateLabel: team.deactivate, deleteLabel: team.deleteMember, onChangeRole: editable ? (role) => void handleUpdate(member, { role }) : undefined, onToggleActive: editable && !writeEnabled ? () => void handleUpdate(member, { is_active: member.isActive === false }) : undefined, onDelete: deletable ? () => void handleDelete(member) : undefined }, member.id));
                    })] }), localManageMode ? (_jsxs(_Fragment, { children: [_jsxs("section", { className: "flex flex-col border-b border-[var(--adaptive-border-subtle)]", children: [_jsx("p", { className: "px-[12px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionRequests }), assignableRoles.length > 0 ? (_jsxs("div", { className: "flex flex-wrap gap-[6px] px-[12px] pb-[8px]", children: [_jsx("p", { className: "w-full text-[11px] text-[var(--adaptive-black600)]", children: team.approveAsRole }), assignableRoles.map((role) => (_jsx("button", { type: "button", onClick: () => setApproveRole(role), className: `rounded-[6px] px-[8px] py-[4px] text-[11px] ${approveRole === role
                                            ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                            : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`, children: roleLabelFor(role, team) }, role)))] })) : null, pendingRequests.length === 0 ? (_jsx(ReportPanelNoticeDialog, { role: "status", title: team.emptyRequests })) : (pendingRequests.map((request) => (_jsxs("div", { className: "flex flex-col gap-[8px] border-b border-[var(--adaptive-border-subtle)] px-[12px] py-[10px] last:border-b-0", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[13px] font-semibold text-[var(--adaptive-black900)]", children: request.author_name }), _jsx("p", { className: "truncate text-[10px] text-[var(--adaptive-black600)]", children: request.author_id }), _jsx("p", { className: "mt-[4px] break-all text-[10px] text-[var(--adaptive-black500)]", children: request.public_key })] }), _jsxs("div", { className: "flex gap-[6px]", children: [_jsx("button", { type: "button", disabled: busyId === request.id, onClick: () => void handleResolve(request.id, "approved"), className: "rounded-[6px] bg-[var(--adaptive-blue50)] px-[8px] py-[4px] text-[11px] font-semibold text-[var(--adaptive-blue500)] disabled:opacity-50", children: team.approve }), _jsx("button", { type: "button", disabled: busyId === request.id, onClick: () => void handleResolve(request.id, "rejected"), className: "rounded-[6px] px-[8px] py-[4px] text-[11px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50", children: team.reject })] })] }, request.id))))] }), onRegisterReviewer && assignableRoles.length > 0 ? (_jsxs("section", { className: "flex flex-col px-[12px] py-[10px]", children: [_jsx("p", { className: "mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionManual }), _jsx("div", { className: "mb-[8px] flex flex-wrap gap-[6px]", children: assignableRoles.map((role) => (_jsx("button", { type: "button", onClick: () => setManualRole(role), className: `rounded-[6px] px-[8px] py-[4px] text-[11px] ${manualRole === role
                                        ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                        : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`, children: roleLabelFor(role, team) }, role))) }), _jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsx("input", { value: manualName, onChange: (event) => setManualName(event.target.value), placeholder: team.manualNamePlaceholder, className: "rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none" }), _jsx("input", { value: manualId, onChange: (event) => setManualId(event.target.value), placeholder: team.manualIdPlaceholder, className: "rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none" }), _jsx("textarea", { value: manualPublicKey, onChange: (event) => setManualPublicKey(event.target.value), placeholder: team.manualPublicKeyPlaceholder, rows: 3, className: "rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none" }), _jsx("button", { type: "button", disabled: busyId === "register", onClick: () => void handleLocalRegister(), className: "w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50", children: team.register })] })] })) : null] })) : null, canManage && writeEnabled && onRegisterReviewer && assignableRoles.length > 0 ? (_jsxs("section", { className: "flex flex-col px-[12px] py-[10px]", children: [_jsx("p", { className: "mb-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--adaptive-black500)]", children: team.sectionRegister }), _jsx("div", { className: "mb-[8px] flex flex-wrap gap-[6px]", children: assignableRoles.map((role) => (_jsx("button", { type: "button", onClick: () => setApiRole(role), className: `rounded-[6px] px-[8px] py-[4px] text-[11px] ${apiRole === role
                                ? "bg-[var(--adaptive-blue50)] font-semibold text-[var(--adaptive-blue500)]"
                                : "text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)]"}`, children: roleLabelFor(role, team) }, role))) }), _jsxs("div", { className: "flex flex-col gap-[6px]", children: [_jsx("input", { value: apiUserId, onChange: (event) => setApiUserId(event.target.value), placeholder: team.apiUserIdPlaceholder, className: "rounded-[8px] border border-[var(--adaptive-black200)] bg-[var(--adaptive-black50)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-black900)] outline-none" }), _jsx("button", { type: "button", disabled: busyId === "register", onClick: () => void handleApiRegister(), className: "w-full rounded-[8px] px-[12px] py-[8px] text-left text-[13px] text-[var(--adaptive-black800)] hover:bg-[var(--adaptive-black100)] disabled:opacity-50", children: team.register })] })] })) : null] }));
}
//# sourceMappingURL=PanelTeamSettings.js.map