"use client";

import { type CSSProperties, type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useCreateReportMutation, useReportsQuery, useUpdateReportMutation } from "../../entities/report/api/report.query.js";
import type { ReportAppearance, ReportFeedback, ReportField, ReportFieldValues, ReportStatus, ReportStorageAdapter, ReportTargetType } from "../../entities/report/model/report.type.js";
import { AnimatedPresence, motion } from "../../motion/index.js";
import { localStorageReportAdapter } from "../../report/storage/localStorageAdapter.js";

const DOT_SIZE = 14;
const TARGET_SELECTOR = "[data-report-id][data-report-type]";
const TARGET_COLOR: Record<ReportTargetType, string> = {
    group: "#2563eb",
    item: "#ef4444",
};
const DEFAULT_FIELDS: ReportField[] = [
    { key: "message", type: "textarea", label: "메시지", required: true },
    { key: "checkbox1", type: "checkbox", label: "checkbox1 사용 여부" },
    { key: "checkbox2", type: "checkbox", label: "checkbox2 사용 여부" },
];

type ReportMode = "idle" | "report" | "view";
type ResolvedAppearance = "light" | "dark";
type ReportFilters = {
    keyword: string;
    status: ReportStatus | "all";
    reportType: ReportTargetType | "all";
};
type TargetSnapshot = {
    id: string;
    type: ReportTargetType;
    rect: DOMRect;
};
type DraftReport = {
    clientX: number;
    clientY: number;
    xRatio: number;
    yRatio: number;
    elementXRatio: number;
    elementYRatio: number;
    scrollY: number;
    documentY: number;
    reportId: string;
    reportType: ReportTargetType;
    message: string;
    fieldValues: ReportFieldValues;
};
type Marker = {
    id: string;
    left: number;
    top: number;
    rect: DOMRect | null;
    report: ReportFeedback;
};
type EditableDraft = {
    message: string;
    status: ReportStatus;
    fieldValues: ReportFieldValues;
};

function createReplyId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `reply-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hasReply(report: ReportFeedback) {
    return report.replies.length > 0;
}

function getReplyStatusTone(hasCompletedReply: boolean) {
    return hasCompletedReply ? { backgroundColor: "#dcfce7", color: "#166534" } : { backgroundColor: "#fee2e2", color: "#b91c1c" };
}

function getMarkerColor(report: ReportFeedback) {
    return hasReply(report) ? "#22c55e" : TARGET_COLOR[report.report_type];
}

function getFieldTags(fields: ReportField[], fieldValues: ReportFieldValues) {
    return fields.flatMap((field) => {
        if (field.key === "message") {
            return [];
        }

        if (field.type === "checkbox") {
            return fieldValues[field.key] === true ? [{ key: field.key, label: field.label }] : [];
        }

        const value = String(fieldValues[field.key] ?? "").trim();
        return value ? [{ key: field.key, label: `${field.label}: ${value}` }] : [];
    });
}

export type ReportProps = {
    appearance?: ReportAppearance;
    fields?: ReportField[];
    pathname?: string;
    showFeedbackList?: boolean;
    storage?: "local" | ReportStorageAdapter;
};

function clampRatio(value: number) {
    if (Number.isNaN(value)) {
        return 0;
    }

    return Math.min(1, Math.max(0, value));
}

function escapeAttribute(value: string) {
    return value.split("\\").join("\\\\").split('"').join('\\"');
}

function getCurrentPathname(pathname?: string) {
    if (pathname) {
        return pathname;
    }

    if (typeof window !== "undefined") {
        return window.location.pathname || "/";
    }

    return "/";
}

function resolveStorageAdapter(storage?: "local" | ReportStorageAdapter) {
    if (!storage || storage === "local") {
        return localStorageReportAdapter;
    }

    return storage;
}

function createInitialFieldValues(fields: ReportField[], source?: ReportFieldValues) {
    return fields.reduce<ReportFieldValues>((acc, field) => {
        if (field.key === "message") {
            return acc;
        }

        if (source && field.key in source) {
            acc[field.key] = source[field.key];
            return acc;
        }

        acc[field.key] = field.type === "checkbox" ? false : "";
        return acc;
    }, {});
}

function getFieldError(message: string, fieldValues: ReportFieldValues, fields: ReportField[]) {
    for (const field of fields) {
        if (!field.required) {
            continue;
        }

        if (field.key === "message" && !message.trim()) {
            return `${field.label}을 입력해주세요.`;
        }

        if (field.type === "checkbox" && fieldValues[field.key] !== true) {
            return `${field.label}을 확인해주세요.`;
        }

        if (field.type === "textarea" && field.key !== "message" && !String(fieldValues[field.key] ?? "").trim()) {
            return `${field.label}을 입력해주세요.`;
        }
    }

    return "";
}

function toSnapshot(element: HTMLElement | null): TargetSnapshot | null {
    if (!element) {
        return null;
    }

    const reportId = element.dataset.reportId?.trim();
    const reportType = element.dataset.reportType;

    if (!reportId || (reportType !== "group" && reportType !== "item")) {
        return null;
    }

    return {
        id: reportId,
        type: reportType,
        rect: element.getBoundingClientRect(),
    };
}

function findTargetElement(baseElement: HTMLElement | null) {
    if (!baseElement) {
        return null;
    }

    const itemTarget = baseElement.closest<HTMLElement>('[data-report-type="item"][data-report-id]');

    if (itemTarget) {
        return itemTarget;
    }

    return baseElement.closest<HTMLElement>('[data-report-type="group"][data-report-id]');
}

function findTargetByPoint(overlay: HTMLDivElement | null, clientX: number, clientY: number) {
    if (!overlay) {
        return null;
    }

    const previousPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = "none";
    const hitElement = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    overlay.style.pointerEvents = previousPointerEvents;

    return findTargetElement(hitElement);
}

function resolveTooltipAnchor(markers: Marker[], reportId: string | null) {
    if (!reportId) {
        return null;
    }

    return markers.find((marker) => marker.report.id === reportId) ?? null;
}

function getMarkerFromReport(report: ReportFeedback, currentScrollY: number) {
    const selector = `${TARGET_SELECTOR}[data-report-id="${escapeAttribute(report.report_id)}"][data-report-type="${report.report_type}"]`;
    const targetElement = document.querySelector<HTMLElement>(selector);
    const pointLeft = window.innerWidth * report.x_ratio - DOT_SIZE / 2;
    const pointTop = report.document_y - currentScrollY - DOT_SIZE / 2;

    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();

        return {
            id: report.id,
            report,
            left: rect.left + rect.width * (report.element_x_ratio ?? report.x_ratio) - DOT_SIZE / 2,
            top: rect.top + rect.height * (report.element_y_ratio ?? report.y_ratio) - DOT_SIZE / 2,
            rect,
        };
    }

    return {
        id: report.id,
        report,
        left: pointLeft,
        top: pointTop,
        rect: null,
    };
}

function useResolvedAppearance(appearance: ReportAppearance) {
    const [resolved, setResolved] = useState<ResolvedAppearance>("light");

    useEffect(() => {
        if (appearance !== "system") {
            setResolved(appearance);
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const sync = () => setResolved(mediaQuery.matches ? "dark" : "light");

        sync();
        mediaQuery.addEventListener("change", sync);
        return () => mediaQuery.removeEventListener("change", sync);
    }, [appearance]);

    return resolved;
}

function useIsMobileViewport() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const sync = () => setIsMobile(window.innerWidth <= 768);

        sync();
        window.addEventListener("resize", sync);
        return () => window.removeEventListener("resize", sync);
    }, []);

    return isMobile;
}

function usePalette(appearance: ResolvedAppearance) {
    return useMemo(
        () =>
            appearance === "dark"
                ? {
                      panel: "rgba(15, 23, 42, 0.94)",
                      panelBorder: "rgba(148, 163, 184, 0.22)",
                      text: "#f8fafc",
                      muted: "rgba(226, 232, 240, 0.68)",
                      input: "#0f172a",
                      inputBorder: "rgba(148, 163, 184, 0.28)",
                      inputText: "#f8fafc",
                      chip: "rgba(51, 65, 85, 0.9)",
                      overlay: "rgba(15, 23, 42, 0.08)",
                      card: "rgba(15, 23, 42, 0.82)",
                  }
                : {
                      panel: "rgba(255, 255, 255, 0.96)",
                      panelBorder: "rgba(15, 23, 42, 0.12)",
                      text: "#0f172a",
                      muted: "rgba(71, 85, 105, 0.82)",
                      input: "#ffffff",
                      inputBorder: "rgba(148, 163, 184, 0.35)",
                      inputText: "#0f172a",
                      chip: "rgba(226, 232, 240, 0.92)",
                      overlay: "rgba(15, 23, 42, 0.04)",
                      card: "rgba(255, 255, 255, 0.97)",
                  },
        [appearance],
    );
}

function formatDate(value: string) {
    return new Date(value).toLocaleString("ko-KR");
}

function getStatusTone(status: ReportStatus) {
    if (status === "resolved") {
        return { backgroundColor: "#dcfce7", color: "#166534" };
    }

    if (status === "archived") {
        return { backgroundColor: "#e2e8f0", color: "#475569" };
    }

    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
}

function renderFieldEditor(
    fields: ReportField[],
    message: string,
    fieldValues: ReportFieldValues,
    palette: ReturnType<typeof usePalette>,
    onMessageChange: (nextValue: string) => void,
    onFieldChange: (key: string, nextValue: string | boolean) => void,
) {
    return fields.map((field) => {
        if (field.key === "message") {
            return (
                <label
                    key={field.key}
                    style={styles.fieldBlock}
                >
                    <span style={{ ...styles.fieldLabel, color: palette.text }}>{field.label}</span>
                    <textarea
                        value={message}
                        onChange={(event) => onMessageChange(event.target.value)}
                        style={{
                            ...styles.textarea,
                            backgroundColor: palette.input,
                            borderColor: palette.inputBorder,
                            color: palette.inputText,
                        }}
                    />
                </label>
            );
        }

        if (field.type === "checkbox") {
            return (
                <label
                    key={field.key}
                    style={{ ...styles.checkboxRow, color: palette.text }}
                >
                    <input
                        type="checkbox"
                        checked={fieldValues[field.key] === true}
                        onChange={(event) => onFieldChange(field.key, event.target.checked)}
                    />
                    <span>{field.label}</span>
                </label>
            );
        }

        return (
            <label
                key={field.key}
                style={styles.fieldBlock}
            >
                <span style={{ ...styles.fieldLabel, color: palette.text }}>{field.label}</span>
                <textarea
                    value={String(fieldValues[field.key] ?? "")}
                    onChange={(event) => onFieldChange(field.key, event.target.value)}
                    style={{
                        ...styles.textarea,
                        backgroundColor: palette.input,
                        borderColor: palette.inputBorder,
                        color: palette.inputText,
                    }}
                />
            </label>
        );
    });
}

export function Report({ appearance = "system", fields = DEFAULT_FIELDS, pathname, showFeedbackList = true, storage = "local" }: ReportProps) {
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
    const [draft, setDraft] = useState<DraftReport | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [hoveredTarget, setHoveredTarget] = useState<TargetSnapshot | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<TargetSnapshot | null>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
    const [activeReplyReportId, setActiveReplyReportId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [editableDraft, setEditableDraft] = useState<EditableDraft | null>(null);
    const [filters, setFilters] = useState<ReportFilters>({
        keyword: "",
        status: "all",
        reportType: "all",
    });
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
        hoveredElementRef.current = null;
        selectedElementRef.current = null;
    }, [currentPathname, mode]);

    useEffect(() => {
        return () => {
            if (hoverLeaveTimeoutRef.current) {
                window.clearTimeout(hoverLeaveTimeoutRef.current);
            }
        };
    }, []);

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

    const helperText = useMemo(() => {
        if (mode === "report") {
            return selectedTarget ? `선택 대상: ${selectedTarget.id}` : "data-report-id / data-report-type 요소를 선택하세요.";
        }

        if (mode === "view") {
            return isFetching ? "피드백을 불러오는 중입니다." : `${filteredReports.length}개의 피드백이 표시 중입니다.`;
        }

        return "리포트 모드를 켜고 DOM 요소에 직접 피드백을 남길 수 있어요.";
    }, [filteredReports.length, isFetching, mode, selectedTarget]);

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

    useEffect(() => {
        if (hoveredMarkerId && !markers.some((marker) => marker.report.id === hoveredMarkerId)) {
            setHoveredMarkerId(null);
        }
    }, [hoveredMarkerId, markers]);

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
        setSelectedReportId(report.id);
        setActiveReplyReportId(report.id);
        setReplyDraft("");
        clearHoverLeaveTimeout();
    };

    const closeReplyComposer = () => {
        setActiveReplyReportId(null);
        setReplyDraft("");
    };

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

    return (
        <>
            <div
                style={{
                    ...styles.floatingPanel,
                    backgroundColor: palette.panel,
                    borderColor: palette.panelBorder,
                    color: palette.text,
                    width: isMobileViewport ? "calc(100vw - 32px)" : 320,
                    boxShadow: resolvedAppearance === "dark" ? "0 18px 48px rgba(15, 23, 42, 0.42)" : "0 18px 48px rgba(15, 23, 42, 0.16)",
                    backdropFilter: "blur(14px)",
                }}
            >
                <div style={styles.panelHeader}>
                    <strong style={{ fontSize: 14 }}>stitchable</strong>
                    <span
                        style={{
                            ...styles.badge,
                            backgroundColor: palette.chip,
                            color: palette.muted,
                        }}
                    >
                        {appearance}
                    </span>
                </div>

                <p style={{ ...styles.helperText, color: palette.muted }}>{helperText}</p>

                <div style={styles.buttonRow}>
                    <button
                        type="button"
                        onClick={() => setMode((current) => (current === "report" ? "idle" : "report"))}
                        style={{
                            ...styles.primaryButton,
                            backgroundColor: mode === "report" ? "#ef4444" : "#2563eb",
                        }}
                    >
                        {mode === "report" ? "선택 중단" : "피드백 남기기"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode((current) => (current === "view" ? "idle" : "view"));
                            stopEditing();
                            setSelectedReportId(filteredReports[0]?.id ?? null);
                        }}
                        style={{
                            ...styles.secondaryButton,
                            borderColor: palette.inputBorder,
                            color: palette.text,
                        }}
                    >
                        {mode === "view" ? "목록 닫기" : "피드백 보기"}
                    </button>
                </div>

                {errorMessage ? <p style={{ ...styles.errorText, color: "#ef4444" }}>{errorMessage}</p> : null}
            </div>

            {mode !== "idle" ? (
                <div
                    ref={overlayRef}
                    onMouseMove={handleOverlayMove}
                    onClick={handleOverlayClick}
                    style={{
                        ...styles.overlay,
                        backgroundColor: mode === "report" ? palette.overlay : "transparent",
                        pointerEvents: "auto",
                        cursor: mode === "report" ? "crosshair" : "default",
                    }}
                >
                    {hoveredTarget ? (
                        <div
                            style={{
                                ...styles.highlightBox,
                                left: hoveredTarget.rect.left,
                                top: hoveredTarget.rect.top,
                                width: hoveredTarget.rect.width,
                                height: hoveredTarget.rect.height,
                                outline: `2px solid ${TARGET_COLOR[hoveredTarget.type]}`,
                                backgroundColor: `${TARGET_COLOR[hoveredTarget.type]}15`,
                            }}
                        >
                            <span
                                style={{
                                    ...styles.highlightLabel,
                                    backgroundColor: TARGET_COLOR[hoveredTarget.type],
                                }}
                            >
                                {hoveredTarget.type} · {hoveredTarget.id}
                            </span>
                        </div>
                    ) : null}

                    {selectedTarget ? (
                        <div
                            style={{
                                ...styles.highlightBox,
                                left: selectedTarget.rect.left,
                                top: selectedTarget.rect.top,
                                width: selectedTarget.rect.width,
                                height: selectedTarget.rect.height,
                                boxShadow: `0 0 0 3px ${TARGET_COLOR[selectedTarget.type]}`,
                            }}
                        />
                    ) : null}

                    {mode === "view"
                        ? markers.map((marker) =>
                              marker.rect ? (
                                  <div
                                      key={`${marker.id}-rect`}
                                      style={{
                                          ...styles.readonlyRect,
                                          left: marker.rect.left,
                                          top: marker.rect.top,
                                          width: marker.rect.width,
                                          height: marker.rect.height,
                                          outline: `1px solid ${TARGET_COLOR[marker.report.report_type]}`,
                                          backgroundColor: `${TARGET_COLOR[marker.report.report_type]}10`,
                                      }}
                                  />
                              ) : null,
                          )
                        : null}

                    {mode === "view"
                        ? markers.map((marker) => (
                              <button
                                  key={marker.id}
                                  type="button"
                                  onClick={() => {
                                      selectReport(marker.report.id);
                                      openReplyComposer(marker.report);
                                  }}
                                  onMouseEnter={() => {
                                      clearHoverLeaveTimeout();
                                      setHoveredMarkerId(marker.report.id);
                                      if (!editingReportId) {
                                          setSelectedReportId(marker.report.id);
                                      }
                                  }}
                                  onMouseLeave={() => scheduleHoverLeave(marker.report.id)}
                                  title={`${marker.report.report_type} · ${marker.report.report_id}`}
                                  style={{
                                      ...styles.markerButton,
                                      left: marker.left,
                                      top: marker.top,
                                      backgroundColor: getMarkerColor(marker.report),
                                      boxShadow: marker.report.id === selectedReport?.id ? "0 0 0 4px rgba(15, 23, 42, 0.2)" : styles.markerButton.boxShadow,
                                      transform: marker.report.id === selectedReport?.id ? "scale(1.15)" : "scale(1)",
                                  }}
                              />
                          ))
                        : null}

                    <AnimatedPresence>
                        {mode === "view" && tooltipReport && tooltipAnchor ? (
                            <motion.div
                                key={`${tooltipReport.id}-${activeReplyReport ? "expanded" : "preview"}`}
                                initial={{ opacity: 0, transform: "translateY(5px)", scale: 0.97 }}
                                animate={{ opacity: 1, transform: "translateY(0px)", scale: 1 }}
                                exit={{ opacity: 0, transform: "translateY(5px)", scale: 0.97 }}
                                transition={{
                                    // delay: 0.3,
                                    type: "spring",
                                    mass: 0.1,
                                    stiffness: 100,
                                    damping: 10,
                                }}
                                onMouseEnter={() => {
                                    clearHoverLeaveTimeout();
                                    setHoveredMarkerId(tooltipReport.id);
                                }}
                                onMouseLeave={() => {
                                    if (!activeReplyReportId) {
                                        scheduleHoverLeave(tooltipReport.id);
                                    }
                                }}
                                onClick={() => openReplyComposer(tooltipReport)}
                                style={{
                                    ...styles.markerTooltip,
                                    left: Math.min(Math.max(tooltipAnchor.left - 12, 16), window.innerWidth - 296),
                                    top: Math.max(tooltipAnchor.top - (activeReplyReport ? 232 : 104), 16),
                                    backgroundColor: activeReplyReport ? palette.panel : resolvedAppearance === "dark" ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.72)",
                                    borderColor: palette.panelBorder,
                                    color: palette.text,
                                    pointerEvents: "auto",
                                    cursor: activeReplyReport ? "default" : "pointer",
                                    backdropFilter: "blur(14px)",
                                }}
                            >
                                <strong style={{ fontSize: 12 }}>
                                    {tooltipReport.report_type} · {tooltipReport.report_id}
                                </strong>
                                <div style={styles.markerTooltipHeader}>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            ...getReplyStatusTone(hasReply(tooltipReport)),
                                        }}
                                    >
                                        {hasReply(tooltipReport) ? "답변 완료" : "답변 미완료"}
                                    </span>
                                    <span
                                        style={{
                                            ...styles.reportMeta,
                                            margin: 0,
                                            color: palette.muted,
                                        }}
                                    >
                                        {formatDate(tooltipReport.created_at)}
                                    </span>
                                </div>
                                {tooltipFieldTags.length ? (
                                    <div style={styles.tagList}>
                                        {tooltipFieldTags.map((fieldTag) => (
                                            <span
                                                key={fieldTag.key}
                                                style={{
                                                    ...styles.fieldTag,
                                                    backgroundColor: palette.chip,
                                                    color: palette.text,
                                                }}
                                            >
                                                {fieldTag.label}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                <p
                                    style={{
                                        ...styles.markerTooltipMessage,
                                        color: palette.text,
                                    }}
                                >
                                    {tooltipReport.message}
                                </p>
                                {activeReplyReport ? (
                                    <div style={styles.editorSection}>
                                        {activeReplyReport.replies.length ? (
                                            <div style={styles.replyList}>
                                                {activeReplyReport.replies.map((reply) => (
                                                    <div
                                                        key={reply.id}
                                                        style={{
                                                            ...styles.replyItem,
                                                            backgroundColor: palette.chip,
                                                            color: palette.text,
                                                        }}
                                                    >
                                                        <p style={{ margin: 0, fontSize: 12 }}>{reply.message}</p>
                                                        <p
                                                            style={{
                                                                ...styles.reportMeta,
                                                                color: palette.muted,
                                                            }}
                                                        >
                                                            {formatDate(reply.created_at)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                        <textarea
                                            value={replyDraft}
                                            onChange={(event) => setReplyDraft(event.target.value)}
                                            placeholder="답변을 입력해주세요."
                                            onClick={(event) => event.stopPropagation()}
                                            style={{
                                                ...styles.textarea,
                                                minHeight: 96,
                                                backgroundColor: palette.input,
                                                borderColor: palette.inputBorder,
                                                color: palette.inputText,
                                            }}
                                        />
                                        <div style={styles.buttonRow}>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    closeReplyComposer();
                                                }}
                                                style={{
                                                    ...styles.secondaryButton,
                                                    borderColor: palette.inputBorder,
                                                    color: palette.text,
                                                }}
                                            >
                                                닫기
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    void handleReplySubmit();
                                                }}
                                                disabled={isUpdating}
                                                style={{
                                                    ...styles.primaryButton,
                                                    backgroundColor: "#2563eb",
                                                }}
                                            >
                                                {isUpdating ? "전송 중..." : "전송"}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>
                        ) : null}
                    </AnimatedPresence>

                    {draft ? (
                        <div
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                ...styles.draftCard,
                                left: isMobileViewport ? 16 : Math.max(16, Math.min(draft.clientX + 16, window.innerWidth - 336)),
                                top: isMobileViewport ? Math.max(80, window.innerHeight - 360) : Math.max(16, Math.min(draft.clientY + 16, window.innerHeight - 320)),
                                width: isMobileViewport ? "calc(100vw - 32px)" : 320,
                                backgroundColor: palette.card,
                                borderColor: palette.panelBorder,
                                color: palette.text,
                            }}
                        >
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                                {draft.reportType} · {draft.reportId}
                            </p>

                            <div style={styles.fieldStack}>
                                {renderFieldEditor(
                                    fields,
                                    draft.message,
                                    draft.fieldValues,
                                    palette,
                                    (nextMessage) => setDraft((current) => (current ? { ...current, message: nextMessage } : current)),
                                    (key, nextValue) =>
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
                                        ),
                                )}
                            </div>

                            <div style={styles.buttonRow}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraft(null);
                                        setSelectedTarget(null);
                                    }}
                                    style={{
                                        ...styles.secondaryButton,
                                        borderColor: palette.inputBorder,
                                        color: palette.text,
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleCreateSubmit()}
                                    disabled={isCreating}
                                    style={{
                                        ...styles.primaryButton,
                                        backgroundColor: "#2563eb",
                                    }}
                                >
                                    {isCreating ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {mode === "view" && showFeedbackList ? (
                <aside
                    style={{
                        ...styles.sidePanel,
                        backgroundColor: palette.panel,
                        borderColor: palette.panelBorder,
                        color: palette.text,
                        width: isMobileViewport ? "calc(100vw - 32px)" : 360,
                        maxHeight: isMobileViewport ? "min(68vh, 560px)" : "calc(100vh - 32px)",
                        top: isMobileViewport ? "auto" : 16,
                        bottom: isMobileViewport ? 16 : "auto",
                        left: isMobileViewport ? 16 : "auto",
                        right: 16,
                        boxShadow: resolvedAppearance === "dark" ? "0 18px 48px rgba(15, 23, 42, 0.42)" : "0 18px 48px rgba(15, 23, 42, 0.16)",
                        backdropFilter: "blur(14px)",
                    }}
                >
                    <div style={styles.sidePanelHeader}>
                        <strong>피드백 목록</strong>
                        <span
                            style={{
                                ...styles.badge,
                                backgroundColor: palette.chip,
                                color: palette.muted,
                            }}
                        >
                            {filteredReports.length}
                        </span>
                    </div>

                    <div style={styles.filterGrid}>
                        <input
                            value={filters.keyword}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    keyword: event.target.value,
                                }))
                            }
                            placeholder="메시지 / report id 검색"
                            style={{
                                ...styles.input,
                                backgroundColor: palette.input,
                                borderColor: palette.inputBorder,
                                color: palette.inputText,
                            }}
                        />
                        <select
                            value={filters.status}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    status: event.target.value as ReportFilters["status"],
                                }))
                            }
                            style={{
                                ...styles.input,
                                backgroundColor: palette.input,
                                borderColor: palette.inputBorder,
                                color: palette.inputText,
                            }}
                        >
                            <option value="all">전체 상태</option>
                            <option value="open">open</option>
                            <option value="resolved">resolved</option>
                            <option value="archived">archived</option>
                        </select>
                        <select
                            value={filters.reportType}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    reportType: event.target.value as ReportFilters["reportType"],
                                }))
                            }
                            style={{
                                ...styles.input,
                                backgroundColor: palette.input,
                                borderColor: palette.inputBorder,
                                color: palette.inputText,
                            }}
                        >
                            <option value="all">전체 타입</option>
                            <option value="item">item</option>
                            <option value="group">group</option>
                        </select>
                    </div>

                    <div style={styles.reportList}>
                        {isError ? (
                            <div
                                style={{
                                    ...styles.stateCard,
                                    backgroundColor: palette.chip,
                                    borderColor: palette.inputBorder,
                                }}
                            >
                                <strong style={{ color: palette.text }}>목록을 불러오지 못했어요.</strong>
                                <p style={{ ...styles.reportMeta, color: palette.muted }}>{error?.message ?? "잠시 후 다시 시도해주세요."}</p>
                                <button
                                    type="button"
                                    onClick={() => void refetch()}
                                    style={{
                                        ...styles.secondaryButton,
                                        borderColor: palette.inputBorder,
                                        color: palette.text,
                                    }}
                                >
                                    다시 시도
                                </button>
                            </div>
                        ) : null}

                        {!isError && !isFetching && filteredReports.length === 0 ? (
                            <div
                                style={{
                                    ...styles.stateCard,
                                    backgroundColor: palette.chip,
                                    borderColor: palette.inputBorder,
                                }}
                            >
                                <strong style={{ color: palette.text }}>표시할 피드백이 없습니다.</strong>
                                <p style={{ ...styles.reportMeta, color: palette.muted }}>
                                    {reports.length === 0 ? "아직 등록된 피드백이 없어요. 리포트 모드에서 첫 피드백을 남겨보세요." : "현재 필터 조건과 일치하는 결과가 없어요."}
                                </p>
                            </div>
                        ) : null}

                        {filteredReports.map((report) => {
                            const isSelected = report.id === selectedReport?.id;
                            const isEditing = report.id === editingReportId && editableDraft;
                            const isArchived = report.status === "archived";

                            return (
                                <div
                                    key={report.id}
                                    style={{
                                        ...styles.reportCard,
                                        backgroundColor: isSelected ? palette.chip : "transparent",
                                        borderColor: isSelected ? palette.inputBorder : "transparent",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => selectReport(report.id)}
                                        style={styles.reportCardButton}
                                    >
                                        <div style={styles.reportCardHeader}>
                                            <strong style={{ color: palette.text }}>{report.report_id}</strong>
                                            <span
                                                style={{
                                                    ...styles.statusBadge,
                                                    ...getStatusTone(report.status),
                                                }}
                                            >
                                                {report.status}
                                            </span>
                                        </div>
                                        <p style={{ ...styles.reportMeta, color: palette.muted }}>
                                            {report.report_type} · {formatDate(report.created_at)}
                                        </p>
                                        <p style={{ ...styles.reportMessage, color: palette.text }}>{report.message}</p>
                                    </button>

                                    <div style={styles.cardActions}>
                                        <button
                                            type="button"
                                            onClick={() => startEditing(report)}
                                            disabled={isArchived}
                                            style={{
                                                ...styles.linkButton,
                                                color: isArchived ? palette.muted : "#2563eb",
                                                opacity: isArchived ? 0.6 : 1,
                                            }}
                                        >
                                            {isArchived ? "보관됨" : isEditing ? "수정 중" : "수정"}
                                        </button>
                                    </div>

                                    {isEditing ? (
                                        <div style={styles.editorSection}>
                                            <div style={styles.fieldStack}>
                                                {renderFieldEditor(
                                                    fields,
                                                    editableDraft.message,
                                                    editableDraft.fieldValues,
                                                    palette,
                                                    (nextMessage) => setEditableDraft((current) => (current ? { ...current, message: nextMessage } : current)),
                                                    (key, nextValue) =>
                                                        setEditableDraft((current) =>
                                                            current
                                                                ? {
                                                                      ...current,
                                                                      fieldValues: {
                                                                          ...current.fieldValues,
                                                                          [key]: nextValue,
                                                                      },
                                                                  }
                                                                : current,
                                                        ),
                                                )}
                                            </div>

                                            <select
                                                value={editableDraft.status}
                                                onChange={(event) =>
                                                    setEditableDraft((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  status: event.target.value as ReportStatus,
                                                              }
                                                            : current,
                                                    )
                                                }
                                                style={{
                                                    ...styles.input,
                                                    backgroundColor: palette.input,
                                                    borderColor: palette.inputBorder,
                                                    color: palette.inputText,
                                                }}
                                            >
                                                <option value="open">open</option>
                                                <option value="resolved">resolved</option>
                                                <option value="archived">archived</option>
                                            </select>

                                            <div style={styles.buttonRow}>
                                                <button
                                                    type="button"
                                                    onClick={stopEditing}
                                                    style={{
                                                        ...styles.secondaryButton,
                                                        borderColor: palette.inputBorder,
                                                        color: palette.text,
                                                    }}
                                                >
                                                    닫기
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleUpdateSubmit()}
                                                    disabled={isUpdating}
                                                    style={{
                                                        ...styles.primaryButton,
                                                        backgroundColor: "#2563eb",
                                                    }}
                                                >
                                                    {isUpdating ? "저장 중..." : "수정 저장"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </aside>
            ) : null}
        </>
    );
}

const styles: Record<string, CSSProperties> = {
    floatingPanel: {
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 1110,
        maxWidth: "calc(100vw - 32px)",
        border: "1px solid",
        borderRadius: 16,
        padding: 16,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    panelHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 32,
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
    },
    helperText: {
        margin: "10px 0 0",
        fontSize: 13,
        lineHeight: 1.45,
    },
    buttonRow: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 12,
    },
    primaryButton: {
        appearance: "none",
        border: 0,
        borderRadius: 12,
        color: "#ffffff",
        cursor: "pointer",
        flex: 1,
        fontSize: 13,
        fontWeight: 700,
        padding: "10px 12px",
    },
    secondaryButton: {
        appearance: "none",
        backgroundColor: "transparent",
        border: "1px solid",
        borderRadius: 12,
        cursor: "pointer",
        flex: 1,
        fontSize: 13,
        fontWeight: 600,
        padding: "10px 12px",
    },
    errorText: {
        margin: "10px 0 0",
        fontSize: 12,
        fontWeight: 600,
    },
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1090,
    },
    highlightBox: {
        position: "absolute",
        borderRadius: 12,
        pointerEvents: "none",
    },
    highlightLabel: {
        position: "absolute",
        top: -30,
        left: 0,
        borderRadius: 999,
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 700,
        padding: "6px 8px",
        whiteSpace: "nowrap",
    },
    readonlyRect: {
        position: "absolute",
        borderRadius: 12,
        pointerEvents: "none",
    },
    markerButton: {
        position: "absolute",
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: 999,
        border: "2px solid #ffffff",
        boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.2)",
        cursor: "pointer",
        pointerEvents: "auto",
        transition: "transform 0.15s ease, background-color 0.15s ease",
    },
    markerTooltip: {
        position: "absolute",
        zIndex: 1106,
        width: 280,
        border: "1px solid",
        borderRadius: 12,
        padding: 10,
        boxShadow: "0 14px 32px rgba(15, 23, 42, 0.16)",
        pointerEvents: "none",
    },
    markerTooltipMessage: {
        margin: "6px 0 0",
        fontSize: 12,
        lineHeight: 1.45,
        wordBreak: "break-word",
    },
    markerTooltipHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginTop: 8,
    },
    tagList: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    fieldTag: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        padding: "4px 8px",
        wordBreak: "break-word",
    },
    draftCard: {
        position: "absolute",
        width: 320,
        border: "1px solid",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.18)",
    },
    fieldStack: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 12,
    },
    fieldBlock: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: 600,
    },
    textarea: {
        width: "100%",
        minHeight: 88,
        resize: "vertical",
        border: "1px solid",
        borderRadius: 12,
        fontFamily: "inherit",
        fontSize: 13,
        lineHeight: 1.5,
        padding: 12,
        boxSizing: "border-box",
    },
    checkboxRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
    },
    sidePanel: {
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1105,
        width: 360,
        maxHeight: "calc(100vh - 32px)",
        overflow: "auto",
        border: "1px solid",
        borderRadius: 16,
        padding: 16,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    sidePanelHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    filterGrid: {
        display: "grid",
        gap: 8,
        marginTop: 12,
    },
    input: {
        width: "100%",
        border: "1px solid",
        borderRadius: 12,
        fontFamily: "inherit",
        fontSize: 13,
        padding: "10px 12px",
        boxSizing: "border-box",
    },
    reportList: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 14,
    },
    stateCard: {
        border: "1px solid",
        borderRadius: 14,
        padding: 14,
    },
    reportCard: {
        border: "1px solid",
        borderRadius: 14,
        padding: 12,
    },
    reportCardButton: {
        width: "100%",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
    },
    reportCardHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    statusBadge: {
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 8px",
        textTransform: "uppercase",
    },
    reportMeta: {
        margin: "6px 0 0",
        fontSize: 12,
        lineHeight: 1.45,
    },
    reportMessage: {
        margin: "8px 0 0",
        fontSize: 13,
        lineHeight: 1.5,
        wordBreak: "break-word",
    },
    cardActions: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 10,
    },
    linkButton: {
        appearance: "none",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        padding: 0,
    },
    editorSection: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 12,
    },
    replyList: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    replyItem: {
        borderRadius: 12,
        padding: 10,
    },
};
