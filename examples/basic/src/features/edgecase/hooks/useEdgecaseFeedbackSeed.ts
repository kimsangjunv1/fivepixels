import { useEffect } from "react";
import { EDGECASE_FEEDBACK_SEED_IDS } from "../model/createEdgecaseFeedbackSeed";
import { ensureEdgecaseFeedbackSeed } from "../model/ensureEdgecaseFeedbackSeed";

export function useEdgecaseFeedbackSeed() {
    useEffect(() => {
        ensureEdgecaseFeedbackSeed();
    }, []);
}

export { EDGECASE_FEEDBACK_SEED_IDS };
