export { Report } from "../shared/ui/Report.js";
export type { ReportProps } from "../shared/ui/Report.js";
export { createLocalStorageReportAdapter, localStorageReportAdapter } from "./storage/localStorageAdapter.js";
export type {
    CreateReportFeedbackPayload,
    ReportAppearance,
    ReportFeedback,
    ReportField,
    ReportFieldBase,
    ReportFieldType,
    ReportFieldValues,
    ReportReply,
    ReportStatus,
    ReportStorageAdapter,
    ReportTargetType,
    SerializedReportFeedback,
    SerializedReportReply,
    UpdateReportFeedbackPayload,
} from "../entities/report/model/report.type.js";
export { REPORT_STATUS_FLOW, REPORT_STATUS_TRANSITIONS } from "../entities/report/model/report.type.js";
