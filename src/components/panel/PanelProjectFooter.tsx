import { useReport } from "@/providers/reportContext.js";

export function PanelProjectFooter() {
    const { projectId, environment, appVersion } = useReport();

    return (
        <footer className="mt-auto flex shrink-0 justify-center gap-[8px] border-t border-[var(--adaptive-black200)] bg-[var(--adaptive-black100)] text-[12px] uppercase text-[var(--adaptive-black500)] rounded-b-[12px_12px]">
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{projectId}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{appVersion ?? "-"}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{environment ?? "-"}</p>
        </footer>
    );
}
