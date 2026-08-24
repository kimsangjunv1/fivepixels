import { useEffect } from "react";
import {
    DEMO_INVEST_FEEDBACK_SEED_CATALOG,
    DEMO_INVEST_FEEDBACK_SEED_IDS,
} from "../model/createDemoInvestFeedbackSeed";
import {
    EDGECASE_FEEDBACK_SEED_CATALOG,
    EDGECASE_FEEDBACK_SEED_IDS,
} from "../model/createEdgecaseFeedbackSeed";
import {
    SETTINGS_FEEDBACK_SEED_CATALOG,
    SETTINGS_FEEDBACK_SEED_IDS,
} from "../model/createSettingsFeedbackSeed";
import { ensureDemoFeedbackSeed } from "../model/ensureDemoFeedbackSeed";

export function useDemoFeedbackSeed() {
    useEffect(() => {
        ensureDemoFeedbackSeed();
    }, []);
}

export {
    DEMO_INVEST_FEEDBACK_SEED_CATALOG,
    DEMO_INVEST_FEEDBACK_SEED_IDS,
    EDGECASE_FEEDBACK_SEED_CATALOG,
    EDGECASE_FEEDBACK_SEED_IDS,
    SETTINGS_FEEDBACK_SEED_CATALOG,
    SETTINGS_FEEDBACK_SEED_IDS,
};
