import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useCreateReportMutation, useReportsQuery, useUpdateReportMutation } from "./report.query.js";
import { useIsMobileViewport } from "./useIsMobileViewport.js";
import { usePalette } from "./usePalette.js";
import { useResolvedAppearance } from "./useResolvedAppearance.js";
import type { ReportAppearance, ReportFeedback, ReportField, ReportStorageAdapter } from "../types/report.js";
import type { DraftReport, EditableDraft, Marker, ReportFilters, ReportMode, TargetSnapshot } from "../types/report-ui.js";
import { clampRatio, getMarkerFromReport, resolveTooltipAnchor } from "../utils/coordinates.js";
import { findTargetByPoint, getSelectableTargets, toSnapshot } from "../utils/dom.js";
import { createInitialFieldValues, getFieldError, getFieldTags } from "../utils/fields.js";
import { createReplyId } from "../utils/format.js";
import { getCurrentPathname } from "../utils/pathname.js";
import { resolveStorageAdapter } from "../utils/storage.js";

export type ReportStateConfig = {
    appearance: ReportAppearance;
    fields: ReportField[];
    pathname?: string;
    showFeedbackList: boolean;
    storage: "local" | ReportStorageAdapter;
};

export function useReportState({ appearance, fields, pathname, showFeedbackList, storage }: ReportStateConfig) {
    // theme
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const hoveredElementRef = useRef<HTMLElement | null>(null);
    const selectedElementRef = useRef<HTMLElement | null>(null);
    const hoverLeaveTimeoutRef = useRef<number | null>(null);

    const resolvedAppearance = useResolvedAppearance(appearance);
    const isMobileViewport = useIsMobileViewport();
    const palette = usePalette(resolvedAppearance);
    const storageAdapter = useMemo(() => resolveStorageAdapter(storage), [storage]);
    const currentPathname = useMemo(() => getCurrentPathname(pathname), [pathname]);

    const [mode, setMode] = useState<ReportMode>("idle");
    const [showTargetPreview, setShowTargetPreview] = useState(false);
    const [selectableTargets, setSelectableTargets] = useState<TargetSnapshot[]>([]);
    const [filters, setFilters] = useState<ReportFilters>({
        keyword: "",
        status: "all",
        reportType: "all",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [draft, setDraft] = useState<DraftReport | null>(null);
    const [hoveredTarget, setHoveredTarget] = useState<TargetSnapshot | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<TargetSnapshot | null>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
    const [activeReplyReportId, setActiveReplyReportId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [editableDraft, setEditableDraft] = useState<EditableDraft | null>(null);

    // data (list, filter, mutations)
    const { data: reports, error, isError, isFetching, refetch } = useReportsQuery(storageAdapter, currentPathname, true);
    const { mutateAsync: createFeedback, isPending: isCreating } = useCreateReportMutation(storageAdapter, () => {
        void refetch();
    });
    const { mutateAsync: updateFeedback, isPending: isUpdating } = useUpdateReportMutation(storageAdapter, () => {
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
        if (activeReplyReportId) {
            return activeReplyAnchor ?? resolveTooltipAnchor(markers, hoveredMarkerId);
        }

        return resolveTooltipAnchor(markers, hoveredMarkerId);
    }, [activeReplyAnchor, activeReplyReportId, hoveredMarkerId, markers]);
    const tooltipReport = tooltipAnchor?.report ?? null;
    const tooltipFieldTags = useMemo(() => (tooltipReport ? getFieldTags(fields, tooltipReport.field_values) : []), [fields, tooltipReport]);

    const helperText = useMemo(() => {
        if (mode === "report") {
            return selectedTarget ? `선택 대상: ${selectedTarget.id}` : "data-report-id / data-report-type 요소를 선택하세요.";
        }

        if (mode === "view") {
            return isFetching ? "피드백을 불러오는 중입니다." : `${filteredReports.length}개의 피드백이 표시 중입니다.`;
        }

        if (showTargetPreview) {
            return `선택 가능한 ${selectableTargets.length}개 요소를 표시 중입니다.`;
        }

        if (selectableTargets.length === 0) {
            return "현재 페이지에 선택 가능한 요소가 없어요. data-report-id / data-report-type 속성을 확인해주세요.";
        }

        const groupCount = selectableTargets.filter((target) => target.type === "group").length;
        const itemCount = selectableTargets.filter((target) => target.type === "item").length;

        return `현재 페이지에서 ${selectableTargets.length}개 요소(group ${groupCount}, item ${itemCount})에 피드백을 남길 수 있어요.`;
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
    }, [currentPathname, mode]);

    useEffect(() => {
        setShowTargetPreview(false);
    }, [currentPathname]);

    useEffect(() => {
        return () => {
            if (hoverLeaveTimeoutRef.current) {
                window.clearTimeout(hoverLeaveTimeoutRef.current);
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

    const scheduleHoverLeave = (markerId: string) => {
        clearHoverLeaveTimeout();

        hoverLeaveTimeoutRef.current = window.setTimeout(() => {
            setHoveredMarkerId((current) => (current === markerId ? null : current));
            hoverLeaveTimeoutRef.current = null;
        }, 120);
    };

    const stopEditing = () => {
        setEditingReportId(null);
        setEditableDraft(null);
    };

    const selectReport = (reportId: string) => {
        setSelectedReportId(reportId);

        if (editingReportId && editingReportId !== reportId) {
            stopEditing();
        }
    };

    const openReplyComposer = (report: ReportFeedback) => {
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
    const handleOverlayMove = (event: MouseEvent<HTMLDivElement>) => {
        if (mode !== "report" || draft) {
            return;
        }

        const targetElement = findTargetByPoint(overlayRef.current, event.clientX, event.clientY);
        hoveredElementRef.current = targetElement;
        setHoveredTarget(toSnapshot(targetElement));
    };

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
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

    const updateDraftMessage = (nextMessage: string) => {
        setDraft((current) => (current ? { ...current, message: nextMessage } : current));
    };

    const updateDraftField = (key: string, nextValue: string | boolean) => {
        setDraft((current) =>
            current
                ? {
                      ...current,
                      fieldValues: {
                          ...current.fieldValues,
                          [key]: nextValue,
                      },
                  }
                : current,
        );
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
            await createFeedback({
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
            });

            setDraft(null);
            setSelectedTarget(null);
            setHoveredTarget(null);
            setErrorMessage("");
            setMode("view");
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : "피드백 저장에 실패했어요.");
        }
    };

    const startEditing = (report: ReportFeedback) => {
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
            await updateFeedback(selectedReport.id, {
                message: editableDraft.message.trim(),
                status: editableDraft.status,
                field_values: editableDraft.fieldValues,
            });

            stopEditing();
            setErrorMessage("");
        } catch (nextError) {
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

        try {
            await updateFeedback(activeReplyReport.id, {
                replies: [
                    ...activeReplyReport.replies,
                    {
                        id: createReplyId(),
                        message: replyDraft.trim(),
                        created_at: new Date().toISOString(),
                        author_type: "manager",
                    },
                ],
            });

            setErrorMessage("");
            closeReplyComposer();
        } catch (nextError) {
            setErrorMessage(nextError instanceof Error ? nextError.message : "답변 저장에 실패했어요.");
        }
    };

    return {
        appearance,
        fields,
        showFeedbackList,
        resolvedAppearance,
        isMobileViewport,
        palette,
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
    };
}
