import type { ReportField, ReportFieldValues } from "../../types/report.js";

type FieldEditorProps = {
    fields: ReportField[];
    message: string;
    fieldValues: ReportFieldValues;
    onMessageChange: (nextValue: string) => void;
    onFieldChange: (key: string, nextValue: string | boolean) => void;
    variant?: "default" | "draft-bubble";
};

export function FieldEditor({ fields, message, fieldValues, onMessageChange, onFieldChange, variant = "default" }: FieldEditorProps) {
    const isDraftBubble = variant === "draft-bubble";
    return (
        <>
            {fields.map((field) => {
                if (field.key === "message") {
                    return (
                        <label
                            key={field.key}
                            className={`${isDraftBubble ? "flex flex-col gap-1" : "flex flex-col gap-1 text-xs"} w-full`}
                            // className={isDraftBubble ? "flex flex-col gap-1" : "flex flex-col gap-1 text-xs"}
                        >
                            {/* {isDraftBubble ? (
                                <span className="text-[11px] font-medium text-white/70">{field.label}</span>
                            ) : (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">{field.label}</span>
                            )} */}
                            <textarea
                                autoFocus={isDraftBubble}
                                value={message}
                                onChange={(event) => onMessageChange(event.target.value)}
                                className="bg-[var(--adaptive-grey50)] rounded-[16px] shadow-[var(--shadow-normal)] p-[14px]"
                                // className={
                                //     isDraftBubble
                                //         ? "h-[72px] w-full resize-none rounded-[14px] bg-white/12 px-3 py-2 text-[13px] leading-[1.4] text-white outline-none ring-0 placeholder:text-white/45 focus:bg-white/16"
                                //         : "h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                                // }
                            />
                        </label>
                    );
                }

                if (field.type === "checkbox") {
                    return (
                        <label
                            key={field.key}
                            className={isDraftBubble ? "flex flex-row items-center gap-2 text-xs text-white/90" : "flex flex-row items-center gap-2 text-xs text-slate-700 dark:text-slate-200"}
                        >
                            <input
                                type="checkbox"
                                className={
                                    isDraftBubble
                                        ? "h-3.5 w-3.5 rounded border-white/50 bg-white/10 text-white accent-white"
                                        : "h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-600"
                                }
                                checked={fieldValues[field.key] === true}
                                onChange={(event) => onFieldChange(field.key, event.target.checked)}
                            />
                            <span>{field.label}</span>
                        </label>
                    );
                }

                return (
                    <label
                        key={field.key}
                        className="flex flex-col gap-1 text-xs"
                    >
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{field.label}</span>
                        <textarea
                            value={String(fieldValues[field.key] ?? "")}
                            onChange={(event) => onFieldChange(field.key, event.target.value)}
                            className="h-16 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-700"
                        />
                    </label>
                );
            })}
        </>
    );
}
