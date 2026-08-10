import { useEffect } from "react";
import {
    EDGECASE_FEEDBACK_SEED_CATALOG,
    EDGECASE_FEEDBACK_SEED_IDS,
} from "../model/createEdgecaseFeedbackSeed";
import {
    SETTINGS_FEEDBACK_SEED_CATALOG,
    SETTINGS_FEEDBACK_SEED_IDS,
} from "../model/createSettingsFeedbackSeed";
import { ensureDemoFeedbackSeed } from "../model/ensureEdgecaseFeedbackSeed";

export function useDemoFeedbackSeed() {
    useEffect(() => {
        ensureDemoFeedbackSeed();
    }, []);
}

/** @deprecated Use useDemoFeedbackSeed */
export const useEdgecaseFeedbackSeed = useDemoFeedbackSeed;

export {
    EDGECASE_FEEDBACK_SEED_CATALOG,
    EDGECASE_FEEDBACK_SEED_IDS,
    SETTINGS_FEEDBACK_SEED_CATALOG,
    SETTINGS_FEEDBACK_SEED_IDS,
};
