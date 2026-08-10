import { dispatchFeedbackStorageChanged } from "@/constants/feedbackStorageEvents.js";
import { readAllFeedback, writeAllFeedback } from "@/utils/feedback/feedbackDataTransfer.js";
import { createEdgecaseFeedbackSeed } from "./createEdgecaseFeedbackSeed.js";
import { createSettingsFeedbackSeed } from "./createSettingsFeedbackSeed.js";
import { BASIC_EXAMPLE_PROJECT_SCOPE, DEMO_FEEDBACK_SEED_PREFIXES } from "./reportProjectScope.js";

function isDemoSeedItem(id: string) {
    return DEMO_FEEDBACK_SEED_PREFIXES.some((prefix) => id.startsWith(prefix));
}

/** Replace all demo seed items so story data stays in sync with the current catalog. */
export function ensureDemoFeedbackSeed() {
    const items = [...createEdgecaseFeedbackSeed(), ...createSettingsFeedbackSeed()];
    const existing = readAllFeedback(BASIC_EXAMPLE_PROJECT_SCOPE);
    const nonSeedItems = existing.filter((item) => !isDemoSeedItem(item.id));

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

/** @deprecated Use ensureDemoFeedbackSeed */
export const ensureEdgecaseFeedbackSeed = ensureDemoFeedbackSeed;
