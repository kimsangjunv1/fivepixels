import type { CreateReportFeedbackPayload, ReportFeedback } from "@/types/report.js";
import { createReportPosition } from "./reportPosition.js";

export function createReportPayload(overrides: Partial<CreateReportFeedbackPayload> = {}): CreateReportFeedbackPayload {
    const { position, ...rest } = overrides;

    return {
        pathname: "/demo",
        report_id: "hero",
        report_type: "group",
        message: "테스트 메시지",
        status: "open",
        field_values: { message: "테스트 메시지" },
        position: createReportPosition(position),
        ...rest,
    };
}

export function createReportFeedback(overrides: Partial<ReportFeedback> = {}): ReportFeedback {
    const { position, ...rest } = overrides;

    return {
        ...createReportPayload({ position }),
        id: "report-1",
        created_at: "2026-05-31T00:00:00.000Z",
        replies: [],
        ...rest,
    };
}
