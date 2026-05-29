import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_FIELDS } from "../constants/report.js";
import { useReportController } from "../hooks/useReportController.js";
import { ReportContext } from "./reportContext.js";
export function ReportProvider({ appearance = "system", fields = DEFAULT_FIELDS, pathname, showFeedbackList = true, storage = "local", children, }) {
    const config = {
        appearance,
        fields,
        pathname,
        showFeedbackList,
        storage,
    };
    const value = useReportController(config);
    return _jsx(ReportContext.Provider, { value: value, children: children });
}
//# sourceMappingURL=ReportProvider.js.map