import { useState, type DragEvent } from "react";
import { PANEL_ROLE_VALUES, type PanelRole } from "@/constants/panelRole.js";
import { useReport } from "@/providers/reportContext.js";
import { ChevronDownIcon } from "@/components/icons/Icons.js";
import { PanelDropdownMenuItem } from "./PanelDropdownMenu.js";
import { isPersonalKeyFile, readPersonalKeyFile } from "@/utils/feedbackDataTransfer.js";

type OnboardingStep = "intro" | "restore" | "role" | "key" | "done";

type CompletedInfo = {
    name: string;
    authorId: string;
    publicKey: string;
};

function buildReviewerSnippet(info: CompletedInfo) {
    return `{ id: "${info.authorId}", name: "${info.name}", publicKey: "${info.publicKey}" }`;
}

function resolveOnboardingResumeState({
    selfProfile,
    personalKey,
    publicKey,
}: {
    selfProfile: { name: string; authorId: string; completed: boolean } | null;
    personalKey: string | null;
    publicKey: string | null;
}): { step: OnboardingStep; completed: CompletedInfo | null; name: string } {
    if (selfProfile && !selfProfile.completed && personalKey && publicKey) {
        return {
            step: "done",
            completed: { name: selfProfile.name, authorId: selfProfile.authorId, publicKey },
            name: selfProfile.name,
        };
    }

    return { step: "intro", completed: null, name: selfProfile?.name ?? "" };
}

export function PanelOnboarding() {
    const {
        messages,
        panelRole,
        setPanelRole,
        completeOnboarding,
        restoreFromBackup,
        skipOnboarding,
        setErrorMessage,
        selfProfile,
        personalKey,
        publicKey,
    } = useReport();
    const onboarding = messages.onboarding;
    const resumeState = resolveOnboardingResumeState({ selfProfile, personalKey, publicKey });
    const [step, setStep] = useState<OnboardingStep>(resumeState.step);
    const [name, setName] = useState(resumeState.name);
    const [isCreating, setIsCreating] = useState(false);
    const [completed, setCompleted] = useState<CompletedInfo | null>(resumeState.completed);
    const [copied, setCopied] = useState(false);
    const [keyInfoOpen, setKeyInfoOpen] = useState(false);
    const [backupKey, setBackupKey] = useState("");
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreError, setRestoreError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    const handleSelectRole = (role: PanelRole) => {
        setPanelRole(role);
    };

    const handleCreateKey = async () => {
        if (!name.trim() || isCreating) {
            return;
        }

        setIsCreating(true);

        try {
            const issued = await completeOnboarding({ name: name.trim() });
            setCompleted({ name: name.trim(), authorId: issued.authorId, publicKey: issued.publicKey });
            setStep("done");
        } catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        } finally {
            setIsCreating(false);
        }
    };

    const handleRestore = async () => {
        if (!backupKey.trim() || isRestoring) {
            return;
        }

        setIsRestoring(true);
        setRestoreError("");

        try {
            const result = await restoreFromBackup(backupKey.trim());

            if (!result.restored) {
                if (result.reason === "unauthorized") {
                    setRestoreError(onboarding.restoreNotAuthorized);
                } else if (result.reason === "project-mismatch") {
                    setRestoreError(messages.personalKey.restoreProjectMismatch);
                } else {
                    setRestoreError(messages.personalKey.invalidKey);
                }
                return;
            }

            if (typeof window !== "undefined") {
                window.location.reload();
            }
        } catch {
            setRestoreError(messages.personalKey.invalidKey);
        } finally {
            setIsRestoring(false);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (!Array.from(event.dataTransfer.types).includes("Files")) {
            return;
        }

        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
            return;
        }

        setIsDragOver(false);
    };

    const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);

        const file = event.dataTransfer.files.item(0);

        if (!file) {
            return;
        }

        if (!isPersonalKeyFile(file)) {
            setRestoreError(onboarding.restoreDropInvalid);
            return;
        }

        try {
            const key = await readPersonalKeyFile(file);
            setBackupKey(key);
            setRestoreError("");
        } catch {
            setRestoreError(onboarding.restoreDropFailed);
        }
    };

    const handleFinish = () => {
        skipOnboarding();

        if (typeof window !== "undefined") {
            window.location.reload();
        }
    };

    const handleCopySnippet = async () => {
        if (!completed) {
            return;
        }

        try {
            await navigator.clipboard.writeText(buildReviewerSnippet(completed));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setErrorMessage(messages.errors.clipboardCopyFailed);
        }
    };

    return (
        <section className="flex flex-col gap-[12px] bg-[var(--adaptive-black50)] p-[16px]">
            {step === "intro" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.introTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.introDescription}</p>
                    </div>

                    <div className="flex flex-col gap-[8px]">
                        <button
                            type="button"
                            onClick={() => setStep("role")}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[10px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
                        >
                            {onboarding.newUser}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("restore")}
                            className="rounded-[8px] border border-[var(--adaptive-black200)] px-[12px] py-[10px] text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                        >
                            {onboarding.existingUser}
                        </button>
                    </div>
                </>
            ) : step === "restore" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.restoreTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.restoreDescription}</p>
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(event) => void handleDrop(event)}
                        className={`relative rounded-[8px] transition-colors ${isDragOver ? "ring-2 ring-[var(--adaptive-blue500)]" : ""}`}
                    >
                        <textarea
                            autoFocus
                            value={backupKey}
                            onChange={(event) => {
                                setBackupKey(event.target.value);
                                setRestoreError("");
                            }}
                            placeholder={onboarding.restorePlaceholder}
                            rows={3}
                            className="w-full resize-none rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none"
                        />
                        {isDragOver ? (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[8px] bg-[var(--adaptive-blue100)]/80 text-[12px] font-semibold text-[var(--adaptive-blue500)]">
                                {onboarding.restoreDropActive}
                            </div>
                        ) : null}
                    </div>

                    <p className="text-[11px] text-[var(--adaptive-black500)]">{onboarding.restoreDropHint}</p>

                    {restoreError ? <p className="text-[12px] text-rose-700">{restoreError}</p> : null}

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("intro")}
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            disabled={!backupKey.trim() || isRestoring}
                            onClick={() => void handleRestore()}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50"
                        >
                            {onboarding.restoreAction}
                        </button>
                    </div>
                </>
            ) : step === "role" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.roleStepTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.roleStepDescription}</p>
                    </div>

                    <div className="overflow-hidden rounded-[10px] border border-[var(--adaptive-black200)]">
                        {PANEL_ROLE_VALUES.map((role) => (
                            <PanelDropdownMenuItem
                                key={role}
                                active={role === panelRole}
                                onClick={() => handleSelectRole(role)}
                            >
                                {messages.panel.roles[role]}
                            </PanelDropdownMenuItem>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("intro")}
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("key")}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
                        >
                            {onboarding.next}
                        </button>
                    </div>
                </>
            ) : step === "key" ? (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.keyStepTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.keyStepDescription}</p>
                    </div>

                    <input
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={onboarding.namePlaceholder}
                        className="w-full rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-surface)] px-[10px] py-[8px] text-[12px] text-[var(--adaptive-text-primary)] outline-none"
                    />

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setStep("role")}
                            className="text-[12px] font-semibold text-[var(--adaptive-black500)] hover:text-[var(--adaptive-black700)]"
                        >
                            {onboarding.back}
                        </button>
                        <button
                            type="button"
                            disabled={!name.trim() || isCreating}
                            onClick={() => void handleCreateKey()}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)] disabled:opacity-50"
                        >
                            {onboarding.createKey}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <h6 className="text-[14px] font-bold text-[var(--adaptive-black900)]">{onboarding.doneTitle}</h6>
                        <p className="mt-[4px] text-[12px] leading-[1.5] text-[var(--adaptive-black600)]">{onboarding.doneDescription}</p>
                    </div>

                    {completed ? (
                        <div className="flex flex-col gap-[6px] overflow-hidden rounded-[8px] border border-[var(--adaptive-black200)]">
                            <button
                                type="button"
                                onClick={() => setKeyInfoOpen((current) => !current)}
                                aria-expanded={keyInfoOpen}
                                className="flex items-center justify-between gap-[8px] px-[10px] py-[8px] text-left text-[12px] font-semibold text-[var(--adaptive-black700)] hover:bg-[var(--adaptive-black100)]"
                            >
                                <span>{onboarding.keyInfoToggle}</span>
                                <ChevronDownIcon className={`h-[14px] w-[14px] shrink-0 transition-transform ${keyInfoOpen ? "rotate-180" : ""}`} />
                            </button>

                            {keyInfoOpen ? (
                                <div className="flex flex-col gap-[6px] px-[10px] pb-[10px]">
                                    <p className="text-[11px] font-semibold text-[var(--adaptive-black500)]">{onboarding.reviewerSnippetHint}</p>
                                    <pre className="max-h-[120px] overflow-auto whitespace-pre-wrap break-all rounded-[8px] bg-[var(--adaptive-black100)] p-[10px] text-[11px] leading-[1.5] text-[var(--adaptive-black800)]">
                                        {buildReviewerSnippet(completed)}
                                    </pre>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex items-center justify-end gap-[10px]">
                        <button
                            type="button"
                            onClick={() => void handleCopySnippet()}
                            className="rounded-[8px] bg-[var(--adaptive-grey300)] px-[12px] py-[6px] text-[12px] font-semibold text-[var(--adaptive-black700)]"
                        >
                            {copied ? onboarding.copied : onboarding.copySnippet}
                        </button>
                        <button
                            type="button"
                            onClick={handleFinish}
                            className="rounded-[8px] bg-[var(--adaptive-blue100)] px-[12px] py-[6px] text-[12px] font-bold text-[var(--adaptive-blue500)]"
                        >
                            {onboarding.refresh}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
