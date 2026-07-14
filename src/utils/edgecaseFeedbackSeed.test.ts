import { describe, expect, it } from "vitest";

import { createEdgecaseFeedbackSeed } from "../../examples/basic/src/features/edgecase/model/createEdgecaseFeedbackSeed.js";
import { FEEDBACK_DISPLAY_STATUS_ORDER } from "@/constants/feedbackStatus.js";
import type { ReportReplyStatus, ReportStatus } from "@/types/report.js";
import { getFeedbackDisplayStatus } from "@/utils/feedbackThread.js";
import { getCaseLatestStatus } from "@/utils/feedbackThread.js";
import { parseFeedbackImportJson } from "@/utils/feedbackTransferSchema.js";
import { getRouteDetailStatus } from "@/utils/routeDetailStatus.js";

describe("edgecase feedback seed", () => {
    it("parses every seed item through the import schema", () => {
        const items = createEdgecaseFeedbackSeed();
        const payload = parseFeedbackImportJson(JSON.stringify(items));

        expect(payload.items).toHaveLength(items.length);
        expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
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

            if (item.target_selector && item.position.anchor === null) {
                detachedTarget = true;
            }

            displayStatuses.add(getFeedbackDisplayStatus(item));
            displayStatuses.add(getFeedbackDisplayStatus(item, true));
            routeDetailStatuses.add(getRouteDetailStatus(item));

            for (const caseItem of item.cases) {
                displayStatuses.add(getCaseLatestStatus(item, caseItem.id));
            }

            for (const reply of item.replies ?? []) {
                replyStatuses.add(reply.status);

                if (reply.author_type === "system") {
                    systemReply = true;
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
    });
});
