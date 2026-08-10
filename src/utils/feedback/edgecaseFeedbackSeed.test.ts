import { describe, expect, it } from "vitest";

import {
    createEdgecaseFeedbackSeed,
    EDGECASE_FEEDBACK_SEED_CATALOG,
    EDGECASE_FEEDBACK_SEED_IDS,
} from "../../../examples/basic/src/features/edgecase/model/createEdgecaseFeedbackSeed.js";
import {
    createSettingsFeedbackSeed,
    SETTINGS_FEEDBACK_SEED_CATALOG,
    SETTINGS_FEEDBACK_SEED_IDS,
} from "../../../examples/basic/src/features/edgecase/model/createSettingsFeedbackSeed.js";
import { EDGECASE_PATHNAME, SETTINGS_PATHNAME } from "../../../examples/basic/src/features/edgecase/model/reportProjectScope.js";
import { FEEDBACK_DISPLAY_STATUS_ORDER } from "@/constants/feedbackStatus.js";
import type { ReportReplyStatus, ReportStatus } from "@/types/report.js";
import { getFeedbackDisplayStatus, getCaseLatestStatus } from "@/utils/feedback/feedbackThread.js";
import { parseFeedbackImportJson } from "@/utils/feedback/feedbackTransferSchema.js";
import { getRouteDetailStatus } from "@/utils/panel/routeDetailStatus.js";

const REQUIRED_EDGECASE_STORY_IDS = [
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
    "edgecase-seed-eight-case-sprint",
    "edgecase-seed-six-case-review",
] as const;

const REQUIRED_SETTINGS_STORY_IDS = [
    "settings-seed-modal-opacity-overlay-resolved",
    "settings-seed-modal-display-overlay-stuck",
    "settings-seed-modal-conditional-target-eight",
    "settings-seed-modal-conditional-overlay-transfer",
    "settings-seed-page-display-demo-wait",
    "settings-seed-page-conditional-demo-two",
    "settings-seed-page-visibility-demo-pending",
    "settings-seed-page-offscreen-demo-stuck",
    "settings-seed-page-zustand-git",
] as const;

const MODAL_DEMO_PAGE_IDS = [
    "modal-opacity-demo",
    "modal-display-demo",
    "modal-conditional-demo",
    "modal-visibility-demo",
    "modal-offscreen-demo",
    "modal-zustand-demo",
] as const;

const MODAL_OVERLAY_IDS = [
    "modal-opacity-overlay",
    "modal-display-overlay",
    "modal-conditional-overlay",
    "modal-visibility-overlay",
    "modal-offscreen-overlay",
    "modal-zustand-overlay",
] as const;

const MODAL_TARGET_IDS = [
    "modal-opacity-target",
    "modal-display-target",
    "modal-conditional-target",
    "modal-visibility-target",
    "modal-offscreen-target",
    "modal-zustand-target",
] as const;

function collectCoverage(items: ReturnType<typeof createEdgecaseFeedbackSeed>) {
    const reportStatuses = new Set<ReportStatus>();
    const replyStatuses = new Set<ReportReplyStatus>();
    const displayStatuses = new Set<string>();
    const routeDetailStatuses = new Set<string>();
    const caseCounts = new Set<number>();
    let taggedCount = 0;
    let untaggedCount = 0;
    let groupCount = 0;
    let itemCount = 0;
    let systemReply = false;
    let githubIntegration = false;
    let checkboxFields = false;
    let multiCase = false;
    let maxCaseCount = 0;
    let assigneeCase = false;
    let resolvedCase = false;
    let detachedTarget = false;
    let mentionCase = false;
    let mentionReply = false;
    let previousAssignee = false;
    let denyOfDenyChain = false;

    for (const item of items) {
        reportStatuses.add(item.status);
        caseCounts.add(item.cases.length);
        maxCaseCount = Math.max(maxCaseCount, item.cases.length);

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

    return {
        reportStatuses,
        replyStatuses,
        displayStatuses,
        routeDetailStatuses,
        caseCounts,
        maxCaseCount,
        taggedCount,
        untaggedCount,
        groupCount,
        itemCount,
        systemReply,
        githubIntegration,
        checkboxFields,
        multiCase,
        assigneeCase,
        resolvedCase,
        detachedTarget,
        mentionCase,
        mentionReply,
        previousAssignee,
        denyOfDenyChain,
    };
}

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

        for (const storyId of REQUIRED_EDGECASE_STORY_IDS) {
            expect(ids.has(storyId)).toBe(true);
        }
    });

    it("covers feedback statuses, reply statuses, and display states", () => {
        const coverage = collectCoverage(createEdgecaseFeedbackSeed());

        expect(coverage.reportStatuses).toEqual(new Set(["open", "git_issued", "resolved", "archived"]));
        expect(coverage.replyStatuses).toEqual(
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
        expect(FEEDBACK_DISPLAY_STATUS_ORDER.every((status) => coverage.displayStatuses.has(status))).toBe(true);
        expect(coverage.displayStatuses.has("currently_wait")).toBe(true);
        expect(coverage.routeDetailStatuses).toEqual(new Set(["wait", "suggested", "git_issued", "resolved"]));
        expect(coverage.taggedCount).toBeGreaterThan(0);
        expect(coverage.untaggedCount).toBeGreaterThan(0);
        expect(coverage.groupCount).toBeGreaterThan(0);
        expect(coverage.itemCount).toBeGreaterThan(0);
        expect(coverage.systemReply).toBe(true);
        expect(coverage.githubIntegration).toBe(true);
        expect(coverage.checkboxFields).toBe(true);
        expect(coverage.multiCase).toBe(true);
        expect(coverage.maxCaseCount).toBe(8);
        expect(coverage.caseCounts.has(1)).toBe(true);
        expect(coverage.caseCounts.has(8)).toBe(true);
        expect(coverage.assigneeCase).toBe(true);
        expect(coverage.resolvedCase).toBe(true);
        expect(coverage.detachedTarget).toBe(true);
        expect(coverage.mentionCase).toBe(true);
        expect(coverage.mentionReply).toBe(true);
        expect(coverage.previousAssignee).toBe(true);
        expect(coverage.denyOfDenyChain).toBe(true);
    });

    it("targets only /edgecase pathname", () => {
        for (const item of createEdgecaseFeedbackSeed()) {
            expect(item.pathname).toBe(EDGECASE_PATHNAME);
        }
    });
});

describe("settings feedback seed", () => {
    it("parses every seed item through the import schema", () => {
        const items = createSettingsFeedbackSeed();
        const payload = parseFeedbackImportJson(JSON.stringify(items));

        expect(payload.items).toHaveLength(items.length);
        expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    });

    it("keeps catalog ids aligned with seed items", () => {
        expect(SETTINGS_FEEDBACK_SEED_IDS).toEqual(createSettingsFeedbackSeed().map((item) => item.id));
        expect(new Set(SETTINGS_FEEDBACK_SEED_CATALOG.map((entry) => entry.id))).toEqual(new Set(SETTINGS_FEEDBACK_SEED_IDS));
    });

    it("includes required settings and modal scenarios", () => {
        const ids = new Set(SETTINGS_FEEDBACK_SEED_IDS);

        for (const storyId of REQUIRED_SETTINGS_STORY_IDS) {
            expect(ids.has(storyId)).toBe(true);
        }
    });

    it("assigns exactly three markers (page + overlay + target) per modal demo", () => {
        const items = createSettingsFeedbackSeed();
        const countByReportId = new Map<string, number>();

        for (const item of items) {
            countByReportId.set(item.report_id, (countByReportId.get(item.report_id) ?? 0) + 1);
        }

        expect(items).toHaveLength(18);

        for (const pageId of MODAL_DEMO_PAGE_IDS) {
            expect(countByReportId.get(pageId)).toBe(1);
        }

        for (const overlayId of MODAL_OVERLAY_IDS) {
            expect(countByReportId.get(overlayId)).toBe(1);
        }

        for (const targetId of MODAL_TARGET_IDS) {
            expect(countByReportId.get(targetId)).toBe(1);
        }
    });

    it("includes feedback on modal overlays and dialog targets", () => {
        const items = createSettingsFeedbackSeed();
        const reportIds = new Set(items.map((item) => item.report_id));

        for (const overlayId of MODAL_OVERLAY_IDS) {
            expect(reportIds.has(overlayId)).toBe(true);
        }

        for (const targetId of MODAL_TARGET_IDS) {
            expect(reportIds.has(targetId)).toBe(true);
        }
    });

    it("covers 1~8 cases per feedback", () => {
        const caseCounts = createSettingsFeedbackSeed().map((item) => item.cases.length);
        const uniqueCounts = new Set(caseCounts);

        expect(Math.min(...caseCounts)).toBeGreaterThanOrEqual(1);
        expect(Math.max(...caseCounts)).toBeLessThanOrEqual(8);
        expect(uniqueCounts.has(1)).toBe(true);
        expect(uniqueCounts.has(8)).toBe(true);
    });

    it("targets only /settings pathname", () => {
        for (const item of createSettingsFeedbackSeed()) {
            expect(item.pathname).toBe(SETTINGS_PATHNAME);
        }
    });
});
