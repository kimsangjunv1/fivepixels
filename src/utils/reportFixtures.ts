import type { CreateReportFeedbackPayload, ReportCase, ReportFeedback } from "@/types/report.js";
import { createReportCase } from "@/utils/reportCases.js";
import { createReportPosition } from "./reportPosition.js";

export { createReportCase };

export function createReportCases(overrides: Partial<ReportCase>[] | string[] = ["테스트 케이스"]): ReportCase[] {
    return overrides.map((item) => {
        if (typeof item === "string") {
            return createReportCase(item);
        }

        const { text = "테스트 케이스", ...rest } = item;

        return createReportCase(text, rest);
    });
}

export function createReportPayload(overrides: Partial<CreateReportFeedbackPayload> = {}): CreateReportFeedbackPayload {
    const { position, cases, ...rest } = overrides;

    return {
        pathname: "/demo",
        report_id: "hero",
        report_type: "group",
        cases: cases ?? createReportCases(["테스트 케이스"]),
        status: "open",
        field_values: {},
        position: createReportPosition(position),
        ...rest,
    };
}

export function createReportFeedback(overrides: Partial<ReportFeedback> = {}): ReportFeedback {
    const { position, cases, ...rest } = overrides;

    return {
        ...createReportPayload({ position, cases }),
        id: "report-1",
        created_at: "2026-05-31T00:00:00.000Z",
        replies: [],
        ...rest,
    };
}
