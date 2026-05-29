import { createContext, useContext } from "react";
import type { useReportController } from "../hooks/useReportController.js";

export type ReportContextValue = ReturnType<typeof useReportController>;

const ReportContext = createContext<ReportContextValue | null>(null);

export function useReport() {
    const context = useContext(ReportContext);

    if (!context) {
        throw new Error("useReport must be used within ReportProvider");
    }

    return context;
}

export { ReportContext };
