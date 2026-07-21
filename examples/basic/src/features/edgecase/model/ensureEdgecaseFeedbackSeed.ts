import { dispatchFeedbackStorageChanged } from "@/constants/feedbackStorageEvents.js";
import { upsertFeedbackItems } from "@/utils/feedback/feedbackDataTransfer.js";
import { createEdgecaseFeedbackSeed } from "./createEdgecaseFeedbackSeed.js";
import { BASIC_EXAMPLE_PROJECT_SCOPE } from "./reportProjectScope.js";

export function ensureEdgecaseFeedbackSeed() {
    const items = createEdgecaseFeedbackSeed();
    const result = upsertFeedbackItems(BASIC_EXAMPLE_PROJECT_SCOPE, items);

    dispatchFeedbackStorageChanged();

    return result;
}
