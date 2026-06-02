import { useEffect, useMemo, useRef, useState } from "react";
import { useReportShortcuts } from "./useReportShortcuts.js";
import { useCreateReportMutation, useDeleteReportMutation, useReportsQuery, useUpdateReportMutation } from "./report.query.js";
import { useIsMobileViewport } from "./useIsMobileViewport.js";
import { useResolvedAppearance } from "./useResolvedAppearance.js";
import { clampRatio, getMarkerFromReport, resolveTooltipAnchor } from "../utils/coordinates.js";
const MARKER_HOVER_LEAVE_MS = 250;
const OVERLAY_HOVER_LEAVE_MS = 100;
import { findTargetByPoint, getSelectableTargets, isSameHoverTarget, toSnapshot } from "../utils/dom.js";
import { createInitialFieldValues, getFieldError, getFieldTags } from "../utils/fields.js";
import { createReplyId } from "../utils/format.js";
import { useCurrentPathname } from "./useCurrentPathname.js";
import { resolveStorageAdapter } from "../utils/storage.js";
import { notifyFeedbackCreate, notifyFeedbackDelete, notifyFeedbackReply, notifyFeedbackUpdate } from "../utils/reportCallbacks.js";
export function useReportState({ projectId, environment, appVersion, appearance, fields, shortcut: _shortcut, identify, onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate, pathname, showFeedbackList, storage = "local", storageAdapter, visibleShortcutKeys = false, }) {
    // theme
    const overlayRef = useRef(null);
    const searchInputRef = useRef(null);
    const hoveredElementRef = useRef(null);
    const selectedElementRef = useRef(null);
    const hoverLeaveTimeoutRef = useRef(null);
    const overlayHoverLeaveTimeoutRef = useRef(null);
    const resolvedAppearance = useResolvedAppearance(appearance);
    const isMobileViewport = useIsMobileViewport();
    const storageAdapterInstance = useMemo(() => resolveStorageAdapter({ projectId, environment, storage, storageAdapter }), [environment, projectId, storage, storageAdapter]);
    const currentPathname = useCurrentPathname(pathname);
    const eventCallbacks = useMemo(() => ({
        onEvent,
        onFeedbackCreate,
        onFeedbackDelete,
        onFeedbackReply,
        onFeedbackUpdate,
    }), [onEvent, onFeedbackCreate, onFeedbackDelete, onFeedbackReply, onFeedbackUpdate]);
    const [mode, setMode] = useState("idle");
    const [showTargetPreview, setShowTargetPreview] = useState(false);
    const [selectableTargets, setSelectableTargets] = useState([]);
    const [filters, setFilters] = useState({
        keyword: "",
        status: "all",
        reportType: "all",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [draft, setDraft] = useState(null);
    const [hoveredTarget, setHoveredTarget] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
    const [activeReplyReportId, setActiveReplyReportId] = useState(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [editingReportId, setEditingReportId] = useState(null);
    const [editableDraft, setEditableDraft] = useState(null);
    // data (list, filter, mutations)
    const { data: reports, error, isError, isFetching, refetch } = useReportsQuery(storageAdapterInstance, currentPathname, true);
    const { mutateAsync: createFeedback, isPending: isCreating } = useCreateReportMutation(storageAdapterInstance, () => {
        void refetch();
    });
    const { mutateAsync: updateFeedback, isPending: isUpdating } = useUpdateReportMutation(storageAdapterInstance, () => {
        void refetch();
    });
    const { mutateAsync: deleteFeedback, isPending: isDeleting } = useDeleteReportMutation(storageAdapterInstance, () => {
        void refetch();
    });
    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            if (filters.status !== "all" && report.status !== filters.status) {
                return false;
            }
            if (filters.reportType !== "all" && report.report_type !== filters.reportType) {
                return false;
            }
            if (!filters.keyword.trim()) {
                return true;
            }
            const keyword = filters.keyword.trim().toLowerCase();
            return [report.message, report.report_id, report.status].join(" ").toLowerCase().includes(keyword);
        });
    }, [filters.keyword, filters.reportType, filters.status, reports]);
    const selectedReport = useMemo(() => {
        return filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? null;
    }, [filteredReports, selectedReportId]);
    const activeReplyAnchor = useMemo(() => resolveTooltipAnchor(markers, activeReplyReportId), [activeReplyReportId, markers]);
    const activeReplyReport = activeReplyAnchor?.report ?? null;
    const tooltipAnchor = useMemo(() => {
        const hoveredAnchor = resolveTooltipAnchor(markers, hoveredMarkerId);
        if (!activeReplyReportId) {
            return hoveredAnchor;
        }
        if (hoveredMarkerId && hoveredMarkerId !== activeReplyReportId) {
            return hoveredAnchor;
        }
        return activeReplyAnchor ?? hoveredAnchor;
    }, [activeReplyAnchor, activeReplyReportId, hoveredMarkerId, markers]);
    const tooltipReport = tooltipAnchor?.report ?? null;
    const tooltipFieldTags = useMemo(() => (tooltipReport ? getFieldTags(fields, tooltipReport.field_values) : []), [fields, tooltipReport]);
    const helperText = useMemo(() => {
        if (mode === "report") {
            return selectedTarget ? `선택 대상: ${selectedTarget.id}` : "selected the elements";
            // return selectedTarget ? `선택 대상: ${selectedTarget.id}` : "data-report-id / data-report-type 요소를 선택하세요.";
        }
        if (mode === "view") {
            return isFetching ? "피드백을 불러오는 중입니다." : `${filteredReports.length}`;
        }
        if (showTargetPreview) {
            return `선택 가능한 ${selectableTargets.length}개 요소를 표시 중입니다.`;
        }
        if (selectableTargets.length === 0) {
            return "현재 페이지에 선택 가능한 요소가 없어요. data-report-id / data-report-type 속성을 확인해주세요.";
        }
        const groupCount = selectableTargets.filter((target) => target.type === "group").length;
        const itemCount = selectableTargets.filter((target) => target.type === "item").length;
        return `${selectableTargets.length}`;
        // return `${selectableTargets.length} counts elements(group ${groupCount}, item ${itemCount})\navailable leaves the feedback.`;
    }, [filteredReports.length, isFetching, mode, selectableTargets, selectedTarget, showTargetPreview]);
    useEffect(() => {
        setDraft(null);
        setErrorMessage("");
        setHoveredTarget(null);
        setSelectedTarget(null);
        setHoveredMarkerId(null);
        setActiveReplyReportId(null);
        setReplyDraft("");
        setEditingReportId(null);
        setEditableDraft(null);
        if (mode !== "idle") {
            setShowTargetPreview(false);
        }
        hoveredElementRef.current = null;
        selectedElementRef.current = null;
        if (hoverLeaveTimeoutRef.current) {
            window.clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = null;
        }
        if (overlayHoverLeaveTimeoutRef.current) {
            window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            overlayHoverLeaveTimeoutRef.current = null;
        }
    }, [currentPathname, mode]);
    useEffect(() => {
        setShowTargetPreview(false);
    }, [currentPathname]);
    useEffect(() => {
        return () => {
            if (hoverLeaveTimeoutRef.current) {
                window.clearTimeout(hoverLeaveTimeoutRef.current);
            }
            if (overlayHoverLeaveTimeoutRef.current) {
                window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            }
        };
    }, []);
    useEffect(() => {
        const syncSelectableTargets = () => {
            setSelectableTargets(getSelectableTargets());
        };
        syncSelectableTargets();
        window.addEventListener("scroll", syncSelectableTargets, { passive: true });
        window.addEventListener("resize", syncSelectableTargets);
        return () => {
            window.removeEventListener("scroll", syncSelectableTargets);
            window.removeEventListener("resize", syncSelectableTargets);
        };
    }, [currentPathname]);
    useEffect(() => {
        if (!showTargetPreview) {
            return;
        }
        const syncPreviewRects = () => {
            setSelectableTargets(getSelectableTargets());
        };
        window.addEventListener("scroll", syncPreviewRects, { passive: true });
        window.addEventListener("resize", syncPreviewRects);
        return () => {
            window.removeEventListener("scroll", syncPreviewRects);
            window.removeEventListener("resize", syncPreviewRects);
        };
    }, [showTargetPreview]);
    useEffect(() => {
        if (!selectedReportId) {
            return;
        }
        if (!filteredReports.some((report) => report.id === selectedReportId)) {
            setSelectedReportId(filteredReports[0]?.id ?? null);
        }
    }, [filteredReports, selectedReportId]);
    useEffect(() => {
        if (mode !== "view") {
            setMarkers([]);
            return;
        }
        const syncMarkers = () => {
            setMarkers(filteredReports.map((report) => getMarkerFromReport(report, window.scrollY)));
        };
        syncMarkers();
        window.addEventListener("scroll", syncMarkers, { passive: true });
        window.addEventListener("resize", syncMarkers);
        return () => {
            window.removeEventListener("scroll", syncMarkers);
            window.removeEventListener("resize", syncMarkers);
        };
    }, [filteredReports, mode]);
    useEffect(() => {
        if (mode !== "report") {
            return;
        }
        const syncTargetRects = () => {
            setHoveredTarget(toSnapshot(hoveredElementRef.current));
            setSelectedTarget(toSnapshot(selectedElementRef.current));
        };
        window.addEventListener("scroll", syncTargetRects, { passive: true });
        window.addEventListener("resize", syncTargetRects);
        return () => {
            window.removeEventListener("scroll", syncTargetRects);
            window.removeEventListener("resize", syncTargetRects);
        };
    }, [mode]);
    useEffect(() => {
        if (hoveredMarkerId && !markers.some((marker) => marker.report.id === hoveredMarkerId)) {
            setHoveredMarkerId(null);
        }
    }, [hoveredMarkerId, markers]);
    // markers (points, tooltip, reply)
    const clearHoverLeaveTimeout = () => {
        if (hoverLeaveTimeoutRef.current) {
            window.clearTimeout(hoverLeaveTimeoutRef.current);
            hoverLeaveTimeoutRef.current = null;
        }
    };
    const scheduleHoverLeave = (markerId) => {
        clearHoverLeaveTimeout();
        hoverLeaveTimeoutRef.current = window.setTimeout(() => {
            setHoveredMarkerId((current) => (current === markerId ? null : current));
            hoverLeaveTimeoutRef.current = null;
        }, MARKER_HOVER_LEAVE_MS);
    };
    const clearOverlayHoverLeaveTimeout = () => {
        if (overlayHoverLeaveTimeoutRef.current) {
            window.clearTimeout(overlayHoverLeaveTimeoutRef.current);
            overlayHoverLeaveTimeoutRef.current = null;
        }
    };
    const scheduleOverlayHoverLeave = () => {
        if (overlayHoverLeaveTimeoutRef.current) {
            return;
        }
        overlayHoverLeaveTimeoutRef.current = window.setTimeout(() => {
            if (!hoveredElementRef.current) {
                setHoveredTarget(null);
            }
            overlayHoverLeaveTimeoutRef.current = null;
        }, OVERLAY_HOVER_LEAVE_MS);
    };
    const stopEditing = () => {
        setEditingReportId(null);
        setEditableDraft(null);
    };
    const selectReport = (reportId) => {
        setSelectedReportId(reportId);
        if (editingReportId && editingReportId !== reportId) {
            stopEditing();
        }
    };
    const focusSearchInput = () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
    };
    const selectAdjacentReport = (direction) => {
        if (filteredReports.length === 0) {
            return;
        }
        const currentIndex = filteredReports.findIndex((report) => report.id === selectedReportId);
        let nextIndex;
        if (currentIndex === -1) {
            nextIndex = direction === "down" ? 0 : filteredReports.length - 1;
        }
        else {
            nextIndex = direction === "down" ? Math.min(currentIndex + 1, filteredReports.length - 1) : Math.max(currentIndex - 1, 0);
        }
        selectReport(filteredReports[nextIndex].id);
    };
    const openReplyComposer = (report) => {
        selectReport(report.id);
        setActiveReplyReportId(report.id);
        setReplyDraft("");
        clearHoverLeaveTimeout();
    };
    const closeReplyComposer = () => {
        setActiveReplyReportId(null);
        setReplyDraft("");
    };
    const toggleReportMode = () => {
        setShowTargetPreview(false);
        setMode((current) => (current === "report" ? "idle" : "report"));
    };
    const toggleViewMode = () => {
        setShowTargetPreview(false);
        setMode((current) => (current === "view" ? "idle" : "view"));
        stopEditing();
        setSelectedReportId(filteredReports[0]?.id ?? null);
    };
    const toggleTargetPreview = () => {
        setShowTargetPreview((current) => {
            const next = !current;
            if (next) {
                setMode("idle");
            }
            return next;
        });
    };
    // overlay (target pick, create draft, edit)
    const handleOverlayMove = (event) => {
        if (mode !== "report" || draft) {
            return;
        }
        const targetElement = findTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        hoveredElementRef.current = targetElement;
        if (!targetElement) {
            scheduleOverlayHoverLeave();
            return;
        }
        clearOverlayHoverLeaveTimeout();
        const snapshot = toSnapshot(targetElement);
        setHoveredTarget((previous) => (isSameHoverTarget(previous, snapshot) ? previous : snapshot));
    };
    const handleOverlayClick = (event) => {
        if (mode !== "report") {
            return;
        }
        const targetElement = findTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        const snapshot = toSnapshot(targetElement);
        if (!targetElement || !snapshot) {
            setErrorMessage("선택 가능한 리포트 영역을 클릭해주세요.");
            return;
        }
        hoveredElementRef.current = targetElement;
        selectedElementRef.current = targetElement;
        setHoveredTarget(snapshot);
        setSelectedTarget(snapshot);
        setErrorMessage("");
        setDraft({
            clientX: event.clientX,
            clientY: event.clientY,
            xRatio: clampRatio(event.clientX / window.innerWidth),
            yRatio: clampRatio(event.clientY / window.innerHeight),
            elementXRatio: clampRatio((event.clientX - snapshot.rect.left) / Math.max(snapshot.rect.width, 1)),
            elementYRatio: clampRatio((event.clientY - snapshot.rect.top) / Math.max(snapshot.rect.height, 1)),
            scrollY: window.scrollY,
            documentY: Math.round(window.scrollY + event.clientY),
            reportId: snapshot.id,
            reportType: snapshot.type,
            message: "",
            fieldValues: createInitialFieldValues(fields),
        });
    };
    const cancelDraft = () => {
        setDraft(null);
        setSelectedTarget(null);
    };
    const updateDraftMessage = (nextMessage) => {
        setDraft((current) => (current ? { ...current, message: nextMessage } : current));
    };
    const updateDraftField = (key, nextValue) => {
        setDraft((current) => current
            ? {
                ...current,
                fieldValues: {
                    ...current.fieldValues,
                    [key]: nextValue,
                },
            }
            : current);
    };
    const handleCreateSubmit = async () => {
        if (!draft) {
            return;
        }
        const nextError = getFieldError(draft.message, draft.fieldValues, fields);
        if (nextError) {
            setErrorMessage(nextError);
            return;
        }
        try {
            const savedFeedback = await createFeedback({
                pathname: currentPathname,
                report_id: draft.reportId,
                report_type: draft.reportType,
                message: draft.message.trim(),
                status: "open",
                field_values: draft.fieldValues,
                x_ratio: draft.xRatio,
                y_ratio: draft.yRatio,
                element_x_ratio: draft.elementXRatio,
                element_y_ratio: draft.elementYRatio,
                scroll_y: draft.scrollY,
                document_y: draft.documentY,
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight,
                design_width: window.innerWidth,
                design_height: window.innerHeight,
                ...(environment ? { environment } : {}),
                ...(appVersion ? { app_version: appVersion } : {}),
                ...(identify
                    ? {
                        author_id: identify.id,
                        author_name: identify.name,
                    }
                    : {}),
            });
            await notifyFeedbackCreate(eventCallbacks, savedFeedback);
            setDraft(null);
            setSelectedTarget(null);
            setHoveredTarget(null);
            setErrorMessage("");
            setMode("view");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : "피드백 저장에 실패했어요.");
        }
    };
    const startEditing = (report) => {
        if (report.status === "archived") {
            setErrorMessage("archived 상태의 피드백은 읽기 전용이에요.");
            setSelectedReportId(report.id);
            return;
        }
        setEditingReportId(report.id);
        setEditableDraft({
            message: report.message,
            status: report.status,
            fieldValues: createInitialFieldValues(fields, report.field_values),
        });
        setSelectedReportId(report.id);
    };
    const handleUpdateSubmit = async () => {
        if (!selectedReport || !editableDraft) {
            return;
        }
        if (selectedReport.status === "archived") {
            setErrorMessage("archived 상태의 피드백은 수정할 수 없어요.");
            return;
        }
        const nextError = getFieldError(editableDraft.message, editableDraft.fieldValues, fields);
        if (nextError) {
            setErrorMessage(nextError);
            return;
        }
        try {
            const updatedFeedback = await updateFeedback(selectedReport.id, {
                message: editableDraft.message.trim(),
                status: editableDraft.status,
                field_values: editableDraft.fieldValues,
            });
            await notifyFeedbackUpdate(eventCallbacks, updatedFeedback);
            stopEditing();
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : "피드백 수정에 실패했어요.");
        }
    };
    const handleReplySubmit = async () => {
        if (!activeReplyReport) {
            return;
        }
        if (!replyDraft.trim()) {
            setErrorMessage("답변 내용을 입력해주세요.");
            return;
        }
        const replyMessage = replyDraft.trim();
        try {
            await updateFeedback(activeReplyReport.id, {
                replies: [
                    ...activeReplyReport.replies,
                    {
                        id: createReplyId(),
                        message: replyMessage,
                        created_at: new Date().toISOString(),
                        author_type: "manager",
                    },
                ],
            });
            await notifyFeedbackReply(eventCallbacks, {
                feedbackId: activeReplyReport.id,
                message: replyMessage,
            });
            setErrorMessage("");
            closeReplyComposer();
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : "답변 저장에 실패했어요.");
        }
    };
    const handleDelete = async (id) => {
        try {
            await deleteFeedback(id);
            await notifyFeedbackDelete(eventCallbacks, id);
            if (selectedReportId === id) {
                setSelectedReportId(null);
            }
            if (editingReportId === id) {
                stopEditing();
            }
            if (activeReplyReportId === id) {
                closeReplyComposer();
            }
            setErrorMessage("");
        }
        catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : "피드백 삭제에 실패했어요.");
        }
    };
    useReportShortcuts({
        mode,
        draft,
        editingReportId,
        showFeedbackList,
        showTargetPreview,
        toggleReportMode,
        toggleTargetPreview,
        toggleViewMode,
        cancelDraft,
        handleCreateSubmit,
        stopEditing,
        handleUpdateSubmit,
        focusSearchInput,
        selectAdjacentReport,
    });
    return {
        appearance,
        fields,
        showFeedbackList,
        visibleShortcutKeys,
        searchInputRef,
        resolvedAppearance,
        isMobileViewport,
        mode,
        showTargetPreview,
        selectableTargets,
        filters,
        setFilters,
        reports,
        filteredReports,
        isError,
        isFetching,
        isCreating,
        isUpdating,
        isDeleting,
        queryErrorMessage: error?.message,
        refetch,
        errorMessage,
        draft,
        hoveredTarget,
        selectedTarget,
        markers,
        selectedReport,
        editingReportId,
        editableDraft,
        setEditableDraft,
        overlayRef,
        activeReplyReportId,
        activeReplyReport,
        tooltipReport,
        tooltipAnchor,
        tooltipFieldTags,
        replyDraft,
        setReplyDraft,
        helperText,
        toggleReportMode,
        toggleTargetPreview,
        toggleViewMode,
        selectReport,
        focusSearchInput,
        selectAdjacentReport,
        openReplyComposer,
        closeReplyComposer,
        clearHoverLeaveTimeout,
        scheduleHoverLeave,
        setHoveredMarkerId,
        handleOverlayMove,
        handleOverlayClick,
        cancelDraft,
        updateDraftMessage,
        updateDraftField,
        handleCreateSubmit,
        startEditing,
        stopEditing,
        handleUpdateSubmit,
        handleReplySubmit,
        handleDelete,
    };
}
//# sourceMappingURL=useReportState.js.map