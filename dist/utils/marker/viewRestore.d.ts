export declare const VIEW_ATTRIBUTE = "data-fp-view";
export declare const OPEN_ATTRIBUTE = "data-fp-open";
export declare function getFeedbackViewTrigger(viewPath: string[] | undefined, options?: {
    visibleOnly?: boolean;
}): {
    element: HTMLElement;
    viewKey: string;
} | null;
export declare function getFeedbackViewPath(element: HTMLElement | null): string[];
export declare function restoreFeedbackViews(viewPath: string[] | undefined): Promise<boolean>;
//# sourceMappingURL=viewRestore.d.ts.map