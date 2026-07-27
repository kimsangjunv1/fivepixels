import { describe, expect, it } from "vitest";

import {
    createEdgecaseFeedbackSeed,
    EDGECASE_FEEDBACK_SEED_CATALOG,
    EDGECASE_FEEDBACK_SEED_IDS,
} from "../../../examples/basic/src/features/edgecase/model/createEdgecaseFeedbackSeed.js";
import { FEEDBACK_DISPLAY_STATUS_ORDER } from "@/constants/feedbackStatus.js";
import type { ReportReplyStatus, ReportStatus } from "@/types/report.js";
import { getFeedbackDisplayStatus, getCaseLatestStatus } from "@/utils/feedback/feedbackThread.js";
import { parseFeedbackImportJson } from "@/utils/feedback/feedbackTransferSchema.js";
import { getRouteDetailStatus } from "@/utils/panel/routeDetailStatus.js";

const REQUIRED_STORY_IDS = [
    "edgecase-seed-story-happy-path-resolved",
    "edgecase-seed-story-deny-then-approve",
    "edgecase-seed-story-deny-of-deny",
    "edgecase-seed-story-deny-of-deny-open",
    "edgecase-seed-story-recheck-first",
    "edgecase-seed-story-long-qa-then-resolve",
    "edgecase-seed-story-stuck-found-error",
    "edgecase-seed-story-stuck-recheck",
    "edgecase-seed-story-transfer-then-fight",
    "edgecase-seed-open-with-mentions",
    "edgecase-seed-open-multicase-diverged",
] as const;

describe("edgecase feedback seed", () => {
    it("parses every seed item through the import schema", () => {
        const items = createEdgecaseFeedbackSeed();
        const payload = parseFeedbackImportJson(JSON.stringify(items));

        expect(payload.items).toHaveLength(items.length);
        expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    });

    it("keeps catalog ids aligned with seed items", () => {
        expect(EDGECASE_FEEDBACK_SEED_IDS).toEqual(createEdgecaseFeedbackSeed().map((item) => item.id));
        expect(new Set(EDGECASE_FEEDBACK_SEED_CATALOG.map((entry) => entry.id))).toEqual(new Set(EDGECASE_FEEDBACK_SEED_IDS));
    });

    it("includes required lifecycle story scenarios", () => {
        const ids = new Set(EDGECASE_FEEDBACK_SEED_IDS);

        for (const storyId of REQUIRED_STORY_IDS) {
            expect(ids.has(storyId)).toBe(true);
        }
    });

    it("covers feedback statuses, reply statuses, and display states", () => {
        const items = createEdgecaseFeedbackSeed();

        const reportStatuses = new Set<ReportStatus>();
        const replyStatuses = new Set<ReportReplyStatus>();
        const displayStatuses = new Set<string>();
        const routeDetailStatuses = new Set<string>();
        let taggedCount = 0;
        let untaggedCount = 0;
        let groupCount = 0;
        let itemCount = 0;
        let systemReply = false;
        let githubIntegration = false;
        let checkboxFields = false;
        let multiCase = false;
        let assigneeCase = false;
        let resolvedCase = false;
        let detachedTarget = false;
        let mentionCase = false;
        let mentionReply = false;
        let previousAssignee = false;
        let denyOfDenyChain = false;

        for (const item of items) {
            reportStatuses.add(item.status);

            if (item.target_selector) {
                untaggedCount += 1;
            } else {
                taggedCount += 1;
            }

            if (item.report_type === "group") {
                groupCount += 1;
            } else {
                itemCount += 1;
            }

            if (item.integrations?.github) {
                githubIntegration = true;
            }

            if (item.field_values.isBug === true && item.field_values.isImportant === true) {
                checkboxFields = true;
            }

            if (item.cases.length > 1) {
                multiCase = true;
            }

            if (item.cases.some((caseItem) => caseItem.assignee_name)) {
                assigneeCase = true;
            }

            if (item.cases.some((caseItem) => caseItem.status === "resolved")) {
                resolvedCase = true;
            }

            if (item.cases.some((caseItem) => caseItem.previous_assignee_name)) {
                previousAssignee = true;
            }

            if (item.cases.some((caseItem) => (caseItem.mentions?.length ?? 0) > 0)) {
                mentionCase = true;
            }

            if (item.target_selector && item.position.anchor === null) {
                detachedTarget = true;
            }

            displayStatuses.add(getFeedbackDisplayStatus(item));
            displayStatuses.add(getFeedbackDisplayStatus(item, true));
            routeDetailStatuses.add(getRouteDetailStatus(item));

            for (const caseItem of item.cases) {
                displayStatuses.add(getCaseLatestStatus(item, caseItem.id));
            }

            const replyStatusSequence = (item.replies ?? []).map((entry) => entry.status);

            if (
                replyStatusSequence.includes("suggested") &&
                replyStatusSequence.includes("found_error") &&
                replyStatusSequence.includes("recheck_requested") &&
                replyStatusSequence.filter((status) => status === "found_error").length >= 2
            ) {
                denyOfDenyChain = true;
            }

            for (const reply of item.replies ?? []) {
                replyStatuses.add(reply.status);

                if (reply.author_type === "system") {
                    systemReply = true;
                }

                if ((reply.mentions?.length ?? 0) > 0) {
                    mentionReply = true;
                }
            }
        }

        expect(reportStatuses).toEqual(new Set(["open", "git_issued", "resolved", "archived"]));
        expect(replyStatuses).toEqual(
            new Set([
                "suggested",
                "additional_question",
                "found_error",
                "recheck_requested",
                "resolved",
                "assignee_assigned",
                "assignee_transferred",
            ]),
        );
        expect(FEEDBACK_DISPLAY_STATUS_ORDER.every((status) => displayStatuses.has(status))).toBe(true);
        expect(displayStatuses.has("currently_wait")).toBe(true);
        expect(routeDetailStatuses).toEqual(new Set(["wait", "suggested", "git_issued", "resolved"]));
        expect(taggedCount).toBeGreaterThan(0);
        expect(untaggedCount).toBeGreaterThan(0);
        expect(groupCount).toBeGreaterThan(0);
        expect(itemCount).toBeGreaterThan(0);
        expect(systemReply).toBe(true);
        expect(githubIntegration).toBe(true);
        expect(checkboxFields).toBe(true);
        expect(multiCase).toBe(true);
        expect(assigneeCase).toBe(true);
        expect(resolvedCase).toBe(true);
        expect(detachedTarget).toBe(true);
        expect(mentionCase).toBe(true);
        expect(mentionReply).toBe(true);
        expect(previousAssignee).toBe(true);
        expect(denyOfDenyChain).toBe(true);
    });
});
