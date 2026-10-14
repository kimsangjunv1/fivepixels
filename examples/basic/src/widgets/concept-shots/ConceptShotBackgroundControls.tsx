import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { CONCEPT_SHOT_STAGE_STYLE, detectConceptMediaKind } from "./conceptShotConfig";

export type ConceptShotMedia =
    | { kind: "default" }
    | { kind: "remote"; src: string; media: "image" | "video" }
    | { kind: "local"; src: string; media: "image" | "video"; objectUrl: string };

type ConceptShotBackgroundControlsProps = {
    media: ConceptShotMedia;
    onChange: (next: ConceptShotMedia) => void;
};

export function ConceptShotStageBackground({ media }: { media: ConceptShotMedia }) {
    if (media.kind === "default") {
        return (
            <div
                className="concept-shots__bg concept-shots__bg--default"
                style={CONCEPT_SHOT_STAGE_STYLE}
                aria-hidden
            />
        );
    }

    if (media.media === "video") {
        return (
            <video
                className="concept-shots__bg concept-shots__bg--media"
                src={media.src}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden
            />
        );
    }

    return (
        <div
            className="concept-shots__bg concept-shots__bg--media"
            style={{ backgroundImage: `url("${media.src}")` }}
            aria-hidden
        />
    );
}

export function ConceptShotBackgroundControls({ media, onChange }: ConceptShotBackgroundControlsProps) {
    const fileInputId = useId();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [urlDraft, setUrlDraft] = useState(media.kind === "remote" ? media.src : "");

    return (
        <section className="concept-shots__bg-controls" aria-label="Concept shot background">
            <form
                className="concept-shots__bg-form"
                onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    const nextUrl = urlDraft.trim();
                    if (!nextUrl) {
                        return;
                    }
                    onChange({ kind: "remote", src: nextUrl, media: detectConceptMediaKind(nextUrl) });
                }}
            >
                <label className="concept-shots__bg-label" htmlFor="concept-shot-bg-url">
                    Background URL
                </label>
                <input
                    id="concept-shot-bg-url"
                    className="concept-shots__bg-input"
                    type="url"
                    placeholder="https://…/image.jpg or /video.mp4"
                    value={urlDraft}
                    onChange={(event) => setUrlDraft(event.target.value)}
                />
                <button type="submit" className="concept-shots__bg-button">
                    Apply
                </button>
            </form>

            <div className="concept-shots__bg-actions">
                <input
                    ref={fileInputRef}
                    id={fileInputId}
                    className="concept-shots__bg-file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) {
                            return;
                        }
                        const objectUrl = URL.createObjectURL(file);
                        onChange({
                            kind: "local",
                            src: objectUrl,
                            objectUrl,
                            media: detectConceptMediaKind(file.name, file.type),
                        });
                    }}
                />
                <button
                    type="button"
                    className="concept-shots__bg-button concept-shots__bg-button--secondary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Upload image / video
                </button>
                <button
                    type="button"
                    className="concept-shots__bg-button concept-shots__bg-button--ghost"
                    disabled={media.kind === "default"}
                    onClick={() => {
                        setUrlDraft("");
                        onChange({ kind: "default" });
                    }}
                >
                    Reset
                </button>
                <span className="concept-shots__bg-note">Client-only · not uploaded to a server</span>
            </div>
        </section>
    );
}
