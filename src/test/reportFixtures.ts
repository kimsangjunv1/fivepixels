import type { CreateReportFeedbackPayload } from "../types/report.js";

export function createReportPayload(
    overrides: Partial<CreateReportFeedbackPayload> = {},
): CreateReportFeedbackPayload {
    return {
        pathname: "/demo",
        report_id: "hero",
        report_type: "group",
        message: "테스트 메시지",
        status: "open",
        field_values: { message: "테스트 메시지" },
        x_ratio: 0.5,
        y_ratio: 0.5,
        element_x_ratio: 0.25,
        element_y_ratio: 0.75,
        scroll_y: 0,
        document_y: 120,
        viewport_width: 1024,
        viewport_height: 768,
        design_width: 1024,
        design_height: 768,
        ...overrides,
    };
}
