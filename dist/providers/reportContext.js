import { createContext, useContext } from "react";
const ReportContext = createContext(null);
export function useReport() {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error("useReport must be used within ReportProvider");
    }
    return context;
}
export { ReportContext };
//# sourceMappingURL=reportContext.js.map