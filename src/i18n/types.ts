import type { ReportAppearance } from "../types/report.js";

export type ReportLocale = "en" | "ko";

type RouteDetailStatus = "wait" | "suggested" | "resolved";

type FeedbackDisplayStatus = "currently_wait" | "wait_for_reply" | "suggested" | "found_error" | "resolved";

export type ReportMessages = {
    common: {
        cancel: string;
        confirm: string;
        proceed: string;
        delete: string;
        copy: string;
        copied: string;
        close: string;
        execute: string;
        executing: string;
        ok: string;
        retry: string;
        none: string;
        all: string;
    };
    panel: {
        expand: string;
        collapse: string;
        repositionAriaLabel: string;
        repositionTitle: string;
        stopFeedback: string;
        addFeedback: string;
        viewOptionsAriaLabel: string;
        viewSelectableElements: string;
        viewFeedbacks: string;
        importDragOverlay: string;
        statsFound: string;
        statsGroup: string;
        statsItem: string;
        tabPageDetails: string;
        tabFeedbackList: string;
    };
    feedbackList: {
        filterStatusAll: string;
        filterTypeAll: string;
        filterStatusAriaLabel: string;
        filterTypeAriaLabel: string;
        searchPlaceholder: string;
        loadFailedTitle: string;
        loadFailedRetry: string;
        emptyTitle: string;
        emptyNoFeedback: string;
        emptyNoMatch: string;
        loadingMore: string;
        deleteAriaLabel: string;
        deleteConfirmAriaLabel: string;
        deleteTitle: string;
        deleteConfirmTitle: string;
        deleteConfirmLabel: string;
        copyAriaLabel: string;
        copyTitle: string;
        copiedTitle: string;
        reportTypeItem: string;
        reportTypeGroup: string;
        filterGitHubIssueAll: string;
        filterGitHubIssueIssued: string;
        filterGitHubIssueNotIssued: string;
        filterGitHubIssueAriaLabel: string;
        gitIssueAddAriaLabel: string;
        gitIssueAddTitle: string;
        gitIssueConfirmAriaLabel: string;
        gitIssueConfirmTitle: string;
        gitIssueConfirmLabel: string;
        gitIssueCreatingLabel: string;
        gitIssueViewAriaLabel: string;
        gitIssueViewTitle: string;
        gitIssueIssuedBadge: string;
    };
    author: {
        placeholder: string;
        selectAriaLabel: string;
        selectPlaceholder: string;
    };
    composer: {
        placeholder: string;
        sendAriaLabel: string;
    };
    fieldEditor: {
        messagePlaceholder: string;
    };
    thread: {
        scrollHintUp: string;
        scrollHintDown: string;
        denied: string;
        resolved: string;
        select: string;
        leaveResult: string;
    };
    routeDetails: {
        all: string;
        today: string;
    };
    moreMenu: {
        import: string;
        export: string;
        theme: string;
        themeAriaLabel: string;
        language: string;
        languageAriaLabel: string;
        command: string;
    };
    localeOption: Record<ReportLocale, string>;
    appearance: Record<ReportAppearance, string>;
    command: {
        title: string;
        description: string;
        jsonPlaceholder: string;
        insertFailed: string;
    };
    importConfirm: {
        title: string;
        description: string;
        applyDirectly: string;
        backupAndApply: string;
    };
    importMismatch: {
        title: string;
        description: string;
        currentData: string;
        updatedData: string;
        exportedAtLabel: string;
    };
    commandReplace: {
        title: string;
        description: string;
        existingMessage: string;
        replacementMessage: string;
        idLabel: string;
        reportIdLabel: string;
    };
    projectComparison: {
        projectId: string;
        projectVersion: string;
        projectEnv: string;
    };
    status: {
        routeDetail: Record<RouteDetailStatus, string>;
        feedback: Record<FeedbackDisplayStatus, string>;
    };
    statusText: {
        ready: string;
        loadingFeedback: string;
        showingSelectableTargets: (count: number) => string;
        noSelectableTargets: string;
        selectedItem: string;
        selectedGroup: string;
    };
    defaults: {
        fields: {
            message: string;
            checkbox1: string;
            checkbox2: string;
        };
    };
    resolution: {
        issueResolvedMessage: string;
    };
    importValidation: {
        fieldValuesObjectRequired: string;
        fieldValuesEntryType: (key: string) => string;
        replyObjectRequired: (replyIndex: number) => string;
        replyIdRequired: (replyIndex: number) => string;
        replyMessageRequired: (replyIndex: number) => string;
        replyCreatedAtRequired: (replyIndex: number) => string;
        replyStatusInvalid: (replyIndex: number) => string;
        repliesArrayRequired: string;
        objectRequired: string;
        stringFieldRequired: (field: string) => string;
        createdAtInvalid: string;
        reportTypeInvalid: string;
        statusInvalid: string;
        numberFieldRequired: (field: string) => string;
        elementXRatioInvalid: string;
        elementYRatioInvalid: string;
        optionalStringFieldInvalid: (field: string) => string;
        duplicateId: (id: string) => string;
        integrationsObjectInvalid: string;
        githubIntegrationObjectInvalid: string;
        githubIssueNumberInvalid: string;
        githubIssueUrlInvalid: string;
        githubIssuedAtInvalid: string;
        githubIssueStateInvalid: string;
    };
    errors: {
        feedbackNotFound: string;
        deleteHandlerMissing: string;
        clickSelectableArea: string;
        saveFeedbackFailed: string;
        archivedReadOnly: string;
        archivedNotEditable: string;
        updateFeedbackFailed: string;
        replyContentRequired: string;
        authorRequired: string;
        saveReplyFailed: string;
        reviewerRequired: string;
        confirmResolutionFailed: string;
        deleteFeedbackFailed: string;
        createGitHubIssueFailed: string;
        loadFeedbackFailed: string;
        createFeedbackFailed: string;
        localStorageTransferOnly: string;
        jsonImportFailed: string;
        jsonExportFailed: string;
        localStorageCommandOnly: string;
        backupExportFailedAbortImport: string;
        jsonFileOnly: string;
        commandInsertFailed: string;
        commandSuccessInsertedReplaced: (inserted: number, replaced: number) => string;
        commandSuccessReplaced: (count: number) => string;
        commandSuccessInserted: (count: number) => string;
        duplicateIdIncluded: string;
        clipboardCopyFailed: string;
        invalidJson: string;
        invalidFeedbackFormat: string;
        feedbackArrayRequired: string;
        importDataEmpty: string;
        invalidExportedAt: string;
        importInvalidFormat: (index: number, detail: string) => string;
        fieldRequiredInput: (label: string) => string;
        fieldRequiredConfirm: (label: string) => string;
    };
};

export type DeepPartialReportMessages = {
    [K in keyof ReportMessages]?: ReportMessages[K] extends (...args: infer Args) => infer Result
        ? (...args: Args) => Result
        : ReportMessages[K] extends Record<string, unknown>
          ? { [P in keyof ReportMessages[K]]?: ReportMessages[K][P] }
          : ReportMessages[K];
};
