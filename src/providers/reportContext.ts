import { createContext, useContext } from "react";
import type { useReportState } from "@/hooks/useReportState.js";

export type ReportContextValue = ReturnType<typeof useReportState>;

const ReportContext = createContext<ReportContextValue | null>(null);

export function useReport() {
    const context = useContext(ReportContext);

    if (!context) {
        throw new Error("useReport must be used within ReportProvider");
    }

    return context;
}

export { ReportContext };
