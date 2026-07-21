import { useReportPreferences } from "@/providers/reportContext.js";

export function PanelProjectFooter() {
    const { projectId, environment, appVersion, persistenceStatus, messages } = useReportPreferences();
    const statusLabel = persistenceStatus.mode === "conflict" ? "conflict · localStorage" : persistenceStatus.mode;

    return (
        <footer className="mt-auto flex shrink-0 justify-center gap-[8px] border-t border-[var(--adaptive-black200)] bg-[var(--adaptive-black100)] text-[12px] uppercase text-[var(--adaptive-black500)] rounded-b-[12px_12px]">
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{projectId}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{appVersion ?? "-"}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            <p className="py-[4px] font-[500] text-[var(--adaptive-black500)]">{environment ?? "-"}</p>
            <div className="h-auto w-[1px] self-stretch bg-[var(--adaptive-black300)]" />
            {persistenceStatus.mode === "conflict" ? (
                <details className="group relative py-[4px] normal-case">
                    <summary
                        className="cursor-pointer font-[700] text-[#d97706]"
                        aria-label={messages.panel.persistenceStatusAriaLabel}
                    >
                        {statusLabel}
                    </summary>
                    <div className="absolute right-0 bottom-full z-[30] mb-[6px] w-[300px] rounded-[10px] border border-[#f59e0b] bg-[var(--adaptive-black50)] p-[12px] text-left normal-case shadow-[0_12px_32px_rgba(15,23,42,0.24)]">
                        <p className="text-[12px] font-[700] text-[var(--adaptive-black900)]">
                            {messages.panel.persistenceConflictTitle}
                        </p>
                        <p className="mt-[4px] text-[11px] leading-[1.5] text-[var(--adaptive-black600)]">
                            {messages.panel.persistenceConflictDescription}
                        </p>

                        <p className="mt-[10px] text-[11px] font-[700] text-[var(--adaptive-black700)]">
                            {messages.panel.persistenceRequiredForApi}
                        </p>
                        <ul className="mt-[4px] space-y-[2px] font-mono text-[11px] text-[var(--adaptive-black700)]">
                            {(["onList", "onCreate", "onUpdate"] as const).map((handlerName) => {
                                const missing = persistenceStatus.missingHandlers.includes(handlerName);

                                return (
                                    <li key={handlerName} className={missing ? "text-[#dc2626]" : "text-[#15803d]"}>
                                        {missing ? "✕" : "✓"} {handlerName}
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="mt-[10px] text-[11px] font-[700] text-[var(--adaptive-black700)]">
                            {messages.panel.persistenceProvidedButIgnored}
                        </p>
                        <p className="mt-[4px] break-words font-mono text-[11px] text-[var(--adaptive-black600)]">
                            {persistenceStatus.ignoredHandlers.join(", ")}
                        </p>
                        <p className="mt-[10px] border-t border-[var(--adaptive-black200)] pt-[8px] text-[11px] leading-[1.5] text-[var(--adaptive-black600)]">
                            {messages.panel.persistenceConflictFix}
                        </p>
                    </div>
                </details>
            ) : (
                <p className="py-[4px] font-[700] normal-case text-[var(--adaptive-black600)]">{statusLabel}</p>
            )}
        </footer>
    );
}
