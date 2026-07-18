import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { ensureReportLocaleMessages, getReportMessages, setActiveReportMessages } from "@/i18n/index.js";
import type { DeepPartialReportMessages } from "@/i18n/types.js";
import type { ReportLocale } from "@/i18n/types.js";
import { useMarkerTargetPreviewPreference } from "../useMarkerTargetPreviewPreference.js";
import { useMarkerAppearancePreference } from "../useMarkerAppearancePreference.js";
import { useTypographyPreference } from "../useTypographyPreference.js";
import { useReportPersistence } from "../useReportPersistence.js";
import { useIsMobileViewport } from "../useIsMobileViewport.js";
import { useAppearancePreference } from "../useAppearancePreference.js";
import { PANEL_APPEARANCE_STORAGE_KEY, TOOLTIP_APPEARANCE_STORAGE_KEY } from "@/constants/appearance.js";
import { useLocalePreference } from "../useLocalePreference.js";
import { useQuestionThreadPreference } from "../useQuestionThreadPreference.js";
import { usePanelRolePreference } from "../usePanelRolePreference.js";
import { usePanelTabPreference } from "../usePanelTabPreference.js";
import { usePinnedFeedbackPreference } from "../usePinnedFeedbackPreference.js";
import { usePanelBootstrap } from "../usePanelBootstrap.js";
import { useResolvedAppearance } from "../useResolvedAppearance.js";
import type { PanelRole } from "@/constants/panelRole.js";
import { buildPanelStats } from "@/utils/panel/panelBootstrap.js";
import { buildPanelRoleStats } from "@/utils/panel/panelRoleStats.js";
import { getPanelRoleTabPreset } from "@/constants/panelTabPresets.js";
import { getPanelTabDefinition, isUserSelectablePanelTab, shouldEnableAllReportsFetch, type UserSelectablePanelTab } from "@/constants/panelTabRegistry.js";
import {
    formatVisibleTabSummary,
    resolveDefaultPanelTab,
    resolveVisibleTabs,
    type PanelTabPreference,
} from "@/utils/panel/panelTabPreference.js";
import type {
    CreateReportFeedbackPayload,
    CreateReplyPayload,
    ReportAppearance,
    ReportActivitySummaryParams,
    ReportActivitySummaryResult,
    ReportFeedback,
    ReportField,
    ReportListAllParams,
    ReportListAllResult,
    ReportPanelBootstrapParams,
    ReportPanelBootstrapResult,
    ReportReply,
    QuestionThreadDisplay,
    UpdateReportFeedbackPayload,
} from "@/types/report.js";
import type { ReportMode, ReportPanelTab } from "@/types/report-ui.js";
import { parseFeedbackDeepLink } from "@/utils/feedback/feedbackDeepLink.js";

function getInitialDeepLinkFeedbackId() {
    if (typeof window === "undefined") {
        return null;
    }

    return parseFeedbackDeepLink()?.feedbackId ?? null;
}

export type ReportPanelShellBridges = {
    setShowTargetPreview: (show: boolean) => void;
    closeReplyComposer: () => void;
    stopEditing: () => void;
};

export type ReportPanelShellConfig = {
    projectId: string;
    environment?: string;
    appVersion?: string;
    panelAppearance: ReportAppearance;
    tooltipAppearance: ReportAppearance;
    questionThreadDefault?: QuestionThreadDisplay;
    fields: ReportField[];
    showFeedbackList: boolean;
    initialLocale: ReportLocale;
    messageOverrides?: DeepPartialReportMessages;
    onList?: (params: { pathname: string }) => Promise<ReportFeedback[]>;
    onListAll?: (params: ReportListAllParams) => Promise<ReportListAllResult>;
    onPanelBootstrap?: (params: ReportPanelBootstrapParams) => Promise<ReportPanelBootstrapResult>;
    onActivitySummary?: (params: ReportActivitySummaryParams) => Promise<ReportActivitySummaryResult>;
    onListReplies?: (commentId: string, params?: import("@/types/report.js").ListRepliesParams) => Promise<import("@/types/report.js").ListRepliesResult | ReportReply[]>;
    onCreate?: (payload: CreateReportFeedbackPayload) => Promise<ReportFeedback>;
    onCreateReply?: (commentId: string, payload: CreateReplyPayload) => Promise<ReportReply>;
    onUpdate?: (id: string, payload: UpdateReportFeedbackPayload) => Promise<ReportFeedback>;
    onDelete?: (id: string) => Promise<void>;
    routeKey?: string;
    replyHistory: import("@/utils/report/reportUi.js").ResolvedReplyHistoryConfig;
    sessionActorName: string | null;
    bridgesRef: MutableRefObject<ReportPanelShellBridges>;
};

export function useReportPanelShell({
    projectId,
    environment,
    appVersion,
    panelAppearance,
    tooltipAppearance,
    questionThreadDefault = "expanded",
    fields,
    showFeedbackList,
    initialLocale,
    messageOverrides,
    onList,
    onListAll,
    onPanelBootstrap,
    onActivitySummary,
    onListReplies,
    onCreate,
    onCreateReply,
    onUpdate,
    onDelete,
    routeKey,
    replyHistory,
    sessionActorName,
    bridgesRef,
}: ReportPanelShellConfig) {
    const { appearance: activePanelAppearance, setAppearance: setPanelAppearance } = useAppearancePreference(PANEL_APPEARANCE_STORAGE_KEY, panelAppearance);
    const { appearance: activeTooltipAppearance, setAppearance: setTooltipAppearance } = useAppearancePreference(TOOLTIP_APPEARANCE_STORAGE_KEY, tooltipAppearance);
    const { showMarkerTargetPreview, setShowMarkerTargetPreview, toggleMarkerTargetPreview } = useMarkerTargetPreviewPreference();
    const { markerAppearance, setMarkerAppearance, setMarkerSize, setMarkerShape, setMarkerColors, setMarkerColor, setFeedbackModeDotColors, setFeedbackModeDotColor } = useMarkerAppearancePreference();
    const { typography, setTypography, setFontSize, setFontFamily } = useTypographyPreference();
    const { questionThreadDisplay, setQuestionThreadDisplay } = useQuestionThreadPreference(questionThreadDefault);
    const { panelRole, setPanelRole } = usePanelRolePreference();
    const { storedPreference, setPanelTabPreference, setVisibleTabs, resetTabsToRoleDefault, applyRoleDefaultTabs } = usePanelTabPreference();
    const { pinnedFeedbackItems, pinRailCollapsed, togglePinnedFeedback, unpinFeedback, setPinRailCollapsed } = usePinnedFeedbackPreference(projectId, environment);
    const { locale, setLocale } = useLocalePreference(initialLocale);
    const [localeMessagesReady, setLocaleMessagesReady] = useState(locale !== "ko");
    const messages = useMemo(() => getReportMessages(locale, messageOverrides), [locale, localeMessagesReady, messageOverrides]);

    useEffect(() => {
        if (locale !== "ko") {
            setLocaleMessagesReady(true);
            return;
        }

        let cancelled = false;
        setLocaleMessagesReady(false);

        void ensureReportLocaleMessages("ko").then(() => {
            if (!cancelled) {
                setLocaleMessagesReady(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [locale]);

    useEffect(() => {
        setActiveReportMessages(messages);
    }, [messages]);

    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const [mode, setMode] = useState<ReportMode>(() => (getInitialDeepLinkFeedbackId() ? "view" : "idle"));
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [panelTab, setPanelTab] = useState<ReportPanelTab | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const panelExpanded = !panelCollapsed && mode !== "report";
    const fetchEnabled = panelExpanded || mode === "view" || mode === "report";

    const tabAvailabilityContext = useMemo(
        () => ({
            showFeedbackList,
            canListAllFeedback: true,
        }),
        [showFeedbackList],
    );

    const visiblePanelTabs = useMemo(
        () => resolveVisibleTabs({ role: panelRole, preference: storedPreference, context: tabAvailabilityContext }),
        [panelRole, storedPreference, tabAvailabilityContext],
    );

    const roleTabPreset = useMemo(() => getPanelRoleTabPreset(panelRole), [panelRole]);

    const needsFullReportList = useMemo(() => {
        if (mode === "view") {
            return true;
        }

        if (!fetchEnabled) {
            return false;
        }

        if (!onPanelBootstrap) {
            return true;
        }

        if (panelTab && isUserSelectablePanelTab(panelTab) && getPanelTabDefinition(panelTab).needsFullReportList) {
            return true;
        }

        return visiblePanelTabs.some((tabId) => getPanelTabDefinition(tabId).needsFullReportList);
    }, [fetchEnabled, mode, onPanelBootstrap, panelTab, visiblePanelTabs]);

    const allReportsFetchEnabled = useMemo(
        () =>
            shouldEnableAllReportsFetch({
                fetchEnabled,
                needsFullReportList,
                activePanelTab: panelTab,
            }),
        [fetchEnabled, needsFullReportList, panelTab],
    );

    const listFetchEnabled = fetchEnabled && needsFullReportList;
    const bootstrapEnabled = fetchEnabled && panelExpanded && Boolean(onPanelBootstrap);

    const resolvedPanelAppearance = useResolvedAppearance(activePanelAppearance);
    const resolvedTooltipAppearance = useResolvedAppearance(activeTooltipAppearance);
    const isMobileViewport = useIsMobileViewport();

    const {
        canTransferFeedback,
        canListAllFeedback,
        currentPathname,
        listScope,
        setListScope,
        filters,
        setFilters,
        selectedReportId,
        setSelectedReportId,
        reports,
        currentPageReports,
        filteredReports,
        currentPageFilteredReports,
        allPageReports,
        allPageFilteredReports,
        routeDetailsStats,
        selectedReport,
        isError,
        isReportsLoading,
        isFetching,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isCreating,
        isUpdating,
        isDeleting,
        queryErrorMessage,
        refetch,
        createFeedback,
        updateFeedback,
        deleteFeedback,
        loadRepliesIfNeeded,
        createReply,
        usesCreateReply,
        replyHistoryByReportId,
        loadOlderReplies,
        goToOlderPaginationPage,
        goToNewerPaginationPage,
        persistenceStatus,
    } = useReportPersistence({
        projectId,
        environment,
        appVersion,
        fields,
        onList,
        onListAll,
        onListReplies,
        onCreate,
        onCreateReply,
        onUpdate,
        onDelete,
        routeKey,
        fetchEnabled,
        listFetchEnabled,
        allReportsFetchEnabled,
        replyHistory,
    });

    const bootstrapParams = useMemo(() => ({ pathname: currentPathname }), [currentPathname]);
    const { bootstrap: panelBootstrap } = usePanelBootstrap({
        enabled: bootstrapEnabled,
        params: bootstrapParams,
        fields,
        reports: currentPageReports,
        pathname: currentPathname,
        onPanelBootstrap,
    });
    const resolvedRouteDetailsStats = useMemo(() => panelBootstrap?.routeDetails ?? routeDetailsStats, [panelBootstrap, routeDetailsStats]);

    const roleStatsReports = useMemo(() => {
        if (roleTabPreset.headerStatsScope !== "all") {
            return currentPageFilteredReports;
        }

        if (listScope === "all") {
            return filteredReports;
        }

        if (allPageFilteredReports.length > 0) {
            return allPageFilteredReports;
        }

        return currentPageFilteredReports;
    }, [allPageFilteredReports, currentPageFilteredReports, filteredReports, listScope, roleTabPreset.headerStatsScope]);

    const targetStats = useMemo(() => {
        if (panelBootstrap?.stats) {
            return panelBootstrap.stats;
        }

        return buildPanelStats(currentPageFilteredReports);
    }, [currentPageFilteredReports, panelBootstrap]);

    const roleStatItems = useMemo(
        () =>
            buildPanelRoleStats({
                role: panelRole,
                reports: roleStatsReports,
                actorName: sessionActorName,
                fallbackStats: targetStats,
                messages,
            }),
        [panelRole, roleStatsReports, sessionActorName, targetStats, messages],
    );

    const listScopeInitializedRef = useRef(false);

    useEffect(() => {
        if (listScopeInitializedRef.current) {
            return;
        }

        if (storedPreference?.customized) {
            listScopeInitializedRef.current = true;
            return;
        }

        setListScope(roleTabPreset.defaultListScope);
        listScopeInitializedRef.current = true;
    }, [roleTabPreset.defaultListScope, setListScope, storedPreference?.customized]);

    useEffect(() => {
        if (!panelTab) {
            return;
        }

        if (panelTab === "settings" || panelTab === "command") {
            return;
        }

        if (!isUserSelectablePanelTab(panelTab)) {
            return;
        }

        if (visiblePanelTabs.includes(panelTab)) {
            return;
        }

        setPanelTab(resolveDefaultPanelTab(panelRole, visiblePanelTabs));
    }, [panelRole, panelTab, visiblePanelTabs]);

    const resolvedTabAvailabilityContext = useMemo(
        () => ({
            showFeedbackList,
            canListAllFeedback,
        }),
        [canListAllFeedback, showFeedbackList],
    );

    const visiblePanelTabLabels = useMemo(() => {
        const labels = {} as Record<UserSelectablePanelTab, string>;

        for (const tabId of visiblePanelTabs) {
            labels[tabId] = messages.panel[getPanelTabDefinition(tabId).labelKey];
        }

        return labels;
    }, [messages.panel, visiblePanelTabs]);

    const visiblePanelTabsSummary = useMemo(() => formatVisibleTabSummary(visiblePanelTabs, visiblePanelTabLabels), [visiblePanelTabLabels, visiblePanelTabs]);

    const setVisiblePanelTabs = useCallback(
        (nextTabs: UserSelectablePanelTab[]) => {
            setVisibleTabs(nextTabs, resolvedTabAvailabilityContext, true);
        },
        [resolvedTabAvailabilityContext, setVisibleTabs],
    );

    const resetVisibleTabsToRoleDefault = useCallback(() => {
        resetTabsToRoleDefault(panelRole, resolvedTabAvailabilityContext);
        setListScope(getPanelRoleTabPreset(panelRole).defaultListScope);
    }, [panelRole, resetTabsToRoleDefault, resolvedTabAvailabilityContext, setListScope]);

    const applyRoleDefaultTabsForOnboarding = useCallback(
        (role: PanelRole) => {
            applyRoleDefaultTabs(role, resolvedTabAvailabilityContext);
        },
        [applyRoleDefaultTabs, resolvedTabAvailabilityContext],
    );

    const savePanelTabPreference = useCallback(
        (preference: PanelTabPreference) => {
            setPanelTabPreference(preference);
            setListScope(getPanelRoleTabPreset(panelRole).defaultListScope);
        },
        [panelRole, setListScope, setPanelTabPreference],
    );

    const toggleReportMode = () => {
        bridgesRef.current.setShowTargetPreview(false);
        setMode((current) => (current === "report" ? "idle" : "report"));
    };

    const togglePanelTab = (nextTab: ReportPanelTab) => {
        setPanelTab((current) => {
            if (current === nextTab) {
                return null;
            }

            return nextTab;
        });
    };

    const enableIssueMode = () => {
        bridgesRef.current.setShowTargetPreview(false);
        bridgesRef.current.closeReplyComposer();
        bridgesRef.current.stopEditing();
        setMode("view");
    };

    const openPanelTab = (nextTab: ReportPanelTab) => {
        const isClosing = panelTab === nextTab;

        setPanelTab(isClosing ? null : nextTab);

        if (!isClosing && nextTab === "feedback-list") {
            enableIssueMode();
        }
    };

    const toggleIssueMode = () => {
        bridgesRef.current.setShowTargetPreview(false);
        bridgesRef.current.closeReplyComposer();
        setMode((current) => (current === "view" ? "idle" : "view"));
        bridgesRef.current.stopEditing();
        setSelectedReportId(null);
    };

    return {
        panelAppearance: activePanelAppearance,
        setPanelAppearance,
        tooltipAppearance: activeTooltipAppearance,
        setTooltipAppearance,
        questionThreadDisplay,
        setQuestionThreadDisplay,
        locale,
        setLocale,
        messages,
        showMarkerTargetPreview,
        setShowMarkerTargetPreview,
        toggleMarkerTargetPreview,
        markerAppearance,
        setMarkerAppearance,
        setMarkerSize,
        setMarkerShape,
        setMarkerColors,
        setMarkerColor,
        setFeedbackModeDotColors,
        setFeedbackModeDotColor,
        typography,
        setTypography,
        setFontSize,
        setFontFamily,
        panelRole,
        setPanelRole,
        storedPanelTabPreference: storedPreference,
        searchInputRef,
        mode,
        setMode,
        panelCollapsed,
        setPanelCollapsed,
        panelTab,
        setPanelTab,
        errorMessage,
        setErrorMessage,
        resolvedPanelAppearance,
        resolvedTooltipAppearance,
        isMobileViewport,
        persistenceStatus,
        canTransferFeedback,
        canListAllFeedback,
        currentPathname,
        listScope,
        setListScope,
        filters,
        setFilters,
        selectedReportId,
        setSelectedReportId,
        reports,
        currentPageReports,
        filteredReports,
        currentPageFilteredReports,
        allPageReports,
        allPageFilteredReports,
        routeDetailsStats: resolvedRouteDetailsStats,
        selectedReport,
        isError,
        isReportsLoading,
        isFetching,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isCreating,
        isUpdating,
        isDeleting,
        queryErrorMessage,
        refetch,
        createFeedback,
        updateFeedback,
        deleteFeedback,
        loadRepliesIfNeeded,
        createReply,
        usesCreateReply,
        replyHistoryByReportId,
        loadOlderReplies,
        goToOlderPaginationPage,
        goToNewerPaginationPage,
        onPanelBootstrap,
        onActivitySummary,
        visiblePanelTabs,
        visiblePanelTabsSummary,
        resolvedTabAvailabilityContext,
        setVisiblePanelTabs,
        resetVisibleTabsToRoleDefault,
        applyRoleDefaultTabsForOnboarding,
        savePanelTabPreference,
        pinnedFeedbackItems,
        pinRailCollapsed,
        togglePinnedFeedback,
        unpinFeedback,
        setPinRailCollapsed,
        targetStats,
        roleStatItems,
        toggleReportMode,
        togglePanelTab,
        enableIssueMode,
        openPanelTab,
        toggleIssueMode,
    };
}
