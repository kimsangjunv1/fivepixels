import { useReportPreferences } from "@/providers/reportContext.js";

export function PanelProjectFooter() {
    const { projectId, environment, appVersion, persistenceStatus, messages } = useReportPreferences();
    const statusLabel =
        persistenceStatus.mode === "conflict"
            ? "conflict · localStorage"
            : persistenceStatus.mode === "unavailable"
              ? "API required"
              : persistenceStatus.mode;

    return (
        <footer className="mt-auto flex shrink-0 justify-center gap-[8px] border-t border-[var(--adaptive-black200)] bg-[var(--adaptive-black100)] text-[12px] uppercase text-[var(--adaptive-black500)] rounded-b-[16px]">
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)] text-[12px]">{projectId}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)] text-[12px]">{appVersion ?? "-"}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)] text-[12px]">{environment ?? "-"}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            {persistenceStatus.mode === "unavailable" ? (
                <p
                    className="py-[4px] font-[700] normal-case text-[#d97706]"
                    title={persistenceStatus.missingHandlers.join(", ")}
                    aria-label={messages.panel.persistenceStatusAriaLabel}
                >
                    {statusLabel}
                </p>
            ) : null}
        </footer>
    );
}
