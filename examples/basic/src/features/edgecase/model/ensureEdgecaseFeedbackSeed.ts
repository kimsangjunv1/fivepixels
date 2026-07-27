import { dispatchFeedbackStorageChanged } from "@/constants/feedbackStorageEvents.js";
import { readAllFeedback, writeAllFeedback } from "@/utils/feedback/feedbackDataTransfer.js";
import { createEdgecaseFeedbackSeed } from "./createEdgecaseFeedbackSeed.js";
import { BASIC_EXAMPLE_PROJECT_SCOPE } from "./reportProjectScope.js";

const EDGECASE_SEED_ID_PREFIX = "edgecase-seed-";

/** Replace all `edgecase-seed-*` items so story data stays in sync with the current catalog. */
export function ensureEdgecaseFeedbackSeed() {
    const items = createEdgecaseFeedbackSeed();
    const existing = readAllFeedback(BASIC_EXAMPLE_PROJECT_SCOPE);
    const nonSeedItems = existing.filter((item) => !item.id.startsWith(EDGECASE_SEED_ID_PREFIX));

    writeAllFeedback(BASIC_EXAMPLE_PROJECT_SCOPE, [...nonSeedItems, ...items]);
    dispatchFeedbackStorageChanged();

    return {
        inserted: items.length,
        updated: 0,
        kept: nonSeedItems.length,
        localRepliesPreserved: 0,
        replaced: existing.length - nonSeedItems.length,
    };
}
