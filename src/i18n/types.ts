import type { ReportAppearance } from "@/types/report.js";

export type ReportLocale = "en" | "ko";

type RouteDetailStatus = "wait" | "suggested" | "git_issued" | "resolved";

type FeedbackDisplayStatus = "currently_wait" | "wait_for_reply" | "git_issued" | "suggested" | "additional_question" | "found_error" | "recheck_requested" | "resolved";

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
        statsResolved: string;
        statsInProgress: string;
        tabPageDetails: string;
        tabFeedbackList: string;
        tabSettings: string;
        resizeWidthAriaLabel: string;
        resizeHeightAriaLabel: string;
        resetSize: string;
        resetSizeTitle: string;
    };
    feedbackList: {
        scopeAriaLabel: string;
        scopeCurrentPage: string;
        scopeAllPages: string;
        filterRangeLabel: string;
        filterCategoryLabel: string;
        threadReplyPrefix: string;
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
        gitIssueAddAriaLabel: string;
        gitIssueAddTitle: string;
        gitIssueConfirmAriaLabel: string;
        gitIssueConfirmTitle: string;
        gitIssueConfirmLabel: string;
        gitIssueCreatingLabel: string;
        gitIssueViewAriaLabel: string;
        gitIssueViewTitle: string;
    };
    author: {
        placeholder: string;
        selectAriaLabel: string;
        selectPlaceholder: string;
        creatorLabel: string;
    };
    composer: {
        placeholder: string;
        questionPlaceholder: string;
        askQuestionLabel: string;
        sendAriaLabel: string;
        gitIssueSendAriaLabel: string;
        gitIssueSendTitle: string;
        gitIssueSendLabel: string;
        gitIssueSendingLabel: string;
        casePlaceholder: string;
        addCase: string;
        removeCaseAriaLabel: (index: number) => string;
    };
    fieldEditor: {
        messagePlaceholder: string;
    };
    cases: {
        title: string;
        edit: string;
        save: string;
        saving: string;
        open: string;
        resolved: string;
        selectForDiscussion: string;
        selectToView: string;
        unassigned: string;
        assignee: string;
        summaryMore: (count: number) => string;
        progressResolved: (resolved: number, total: number) => string;
    };
    thread: {
        scrollHintUp: string;
        scrollHintDown: string;
        denied: string;
        resolved: string;
        resolvedConfirmLabel: string;
        resolvedConfirmAriaLabel: string;
        select: string;
        leaveResult: string;
        askQuestion: string;
    };
    routeDetails: {
        all: string;
        today: string;
    };
    moreMenu: {
        settings: string;
        sectionTransfer: string;
        sectionKey: string;
        sectionAdvanced: string;
        import: string;
        export: string;
        keyCopy: string;
        publicKeyCopy: string;
        keyInsert: string;
        keyChange: string;
        keyRotate: string;
        theme: string;
        themeAriaLabel: string;
        language: string;
        languageAriaLabel: string;
        command: string;
    };
    personalKey: {
        requiredTitle: string;
        requiredDescription: string;
        backupWarning: string;
        restoreGuide: string;
        insertTitle: string;
        insertDescription: string;
        inputPlaceholder: string;
        reviewerPlaceholder: string;
        copySuccess: string;
        setupSuccess: string;
        publicKeyCopied: string;
        registrationPending: string;
        rotateTitle: string;
        rotateDescription: string;
        rotateWarning: string;
        invalidKey: string;
        ownerRequired: string;
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
    marker: {
        detachedAriaLabel: string;
        detachedHint: string;
        detachedBadge: string;
        detachedModalAriaLabel: string;
        detachedModalHint: string;
        detachedModalBadge: string;
        moreIssuesAbove: (count: number) => string;
        moreIssuesBelow: (count: number) => string;
        moreIssuesLeft: (count: number) => string;
        moreIssuesRight: (count: number) => string;
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
        gitIssuedMessage: string;
        gitIssuedOpenLink: string;
        gitIssuedCopyLinkAriaLabel: string;
        gitIssuedCopyLinkTitle: string;
        gitIssuedCopiedTitle: string;
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
        positionObjectRequired: string;
        positionRatioInvalid: (label: string) => string;
        positionViewportInvalid: string;
        positionScrollYInvalid: string;
        positionAnchorInvalid: string;
        optionalStringFieldInvalid: (field: string) => string;
        duplicateId: (id: string) => string;
        integrationsObjectInvalid: string;
        githubIntegrationObjectInvalid: string;
        githubIssueNumberInvalid: string;
        githubIssueUrlInvalid: string;
        githubIssuedAtInvalid: string;
        casesRequired: string;
        caseInvalid: (caseIndex: number) => string;
        caseTextRequired: (caseIndex: number) => string;
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
        loadRepliesFailed: string;
        createReplyFailed: string;
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
        casesRequired: string;
        caseTextRequired: (index: number) => string;
        caseSelectionRequired: string;
        selectCaseFirst: string;
        caseAssigneeOnly: string;
        personalKeyRequired: string;
    };
};

export type DeepPartialReportMessages = {
    [K in keyof ReportMessages]?: ReportMessages[K] extends (...args: infer Args) => infer Result
        ? (...args: Args) => Result
        : ReportMessages[K] extends Record<string, unknown>
          ? { [P in keyof ReportMessages[K]]?: ReportMessages[K][P] }
          : ReportMessages[K];
};
