import type { ReportLocale } from "../shared/i18n/types.js";
import type { MarkerShape } from "../shared/constants/markerAppearance.js";
import type { FivePixelsDemoScene } from "./types.js";
export type DemoCopy = {
    localeLabel: string;
    close: string;
    minimize: string;
    maximize: string;
    marker: {
        title: string;
        category: string;
        author: string;
        age: string;
        score: string;
    };
    composer: {
        placeholder: string;
        caseLabel: string;
        categoryLabel: string;
        categories: string[];
        send: string;
    };
    panel: {
        activity: string;
        created: string;
        replied: string;
        assigned: string;
        currentPage: string;
        network: string;
        today: string;
        yesterday: string;
        statuses: string[];
        project: string;
        environment: string;
    };
    inspector: {
        recent: string[];
        tag: string;
        size: string;
        display: string;
        padding: string;
        margin: string;
        reportId: string;
        edit: string;
        reset: string;
        color: string;
        spacing: string;
    };
    device: {
        title: string;
        url: string;
        go: string;
        previewTitle: string;
        cards: string[];
    };
    thread: {
        title: string;
        unassigned: string;
        newCase: string;
        share: string;
        askAi: string;
        caseLabel: string;
        score: string;
        message: string;
        reply: string;
        replyPlaceholder: string;
        delete: string;
        creator: string;
        mine: string;
        status: string;
    };
    settings: {
        title: string;
        appearance: string;
        markerShape: string;
        markerSize: string;
        themeOptions: string[];
        shapeLabels: Record<MarkerShape, string>;
        sizes: string[];
    };
    notifications: {
        editMode: string;
        reset: string;
        undo: string;
        redo: string;
        networkError: string;
        retry: string;
        hiddenMarkers: string;
        show: string;
        activity: string;
        activityItems: string[];
    };
};
export declare const DEMO_SCENE_SIZE: Record<FivePixelsDemoScene, {
    width: number;
    height: number;
}>;
export declare function getDemoCopy(locale: ReportLocale): DemoCopy;
//# sourceMappingURL=fixtures.d.ts.map