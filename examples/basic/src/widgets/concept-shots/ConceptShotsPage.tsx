import { useEffect, useMemo, useRef, useState } from "react";

import { ConceptShotBackgroundControls, ConceptShotStageBackground, type ConceptShotMedia } from "./ConceptShotBackgroundControls";
import { ConceptShotFivepixels } from "./ConceptShotFivepixels";
import { ConceptShotScene } from "./ConceptShotScenes";
import { CONCEPT_SHOT_TABS, type ConceptShotSceneId } from "./conceptShotConfig";

import "../../../styles/concept-shots.css";

export function ConceptShotsPage() {
    const [activeTabId, setActiveTabId] = useState<ConceptShotSceneId>(CONCEPT_SHOT_TABS[0]?.id ?? "checkout");
    const [locale, setLocale] = useState<"ko" | "en">("en");
    const [appearance, setAppearance] = useState<"light" | "dark">("light");
    const [media, setMedia] = useState<ConceptShotMedia>({ kind: "default" });
    const objectUrlRef = useRef<string | null>(null);
    const activeTab = useMemo(() => CONCEPT_SHOT_TABS.find((tab) => tab.id === activeTabId) ?? CONCEPT_SHOT_TABS[0], [activeTabId]);

    const replaceMedia = (next: ConceptShotMedia) => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        if (next.kind === "local") {
            objectUrlRef.current = next.objectUrl;
        }
        setMedia(next);
    };

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    if (!activeTab) {
        return null;
    }

    return (
        <div className="concept-shots">
            <header className="concept-shots__chrome">
                <div className="concept-shots__brand">
                    <span aria-hidden>fp</span>
                    <strong>fivepixels</strong>
                    <em>concept shots</em>
                </div>

                <div className="concept-shots__quick-controls">
                    <div className="concept-shots__segment" role="group" aria-label="Demo language">
                        {(["ko", "en"] as const).map((option) => (
                            <button key={option} type="button" aria-pressed={locale === option} onClick={() => setLocale(option)}>
                                {option.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="concept-shots__segment" role="group" aria-label="Demo appearance">
                        {(["light", "dark"] as const).map((option) => (
                            <button key={option} type="button" aria-pressed={appearance === option} onClick={() => setAppearance(option)}>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="concept-shots__hint">Real product context · capture-ready</p>
            </header>

            <main className="concept-shots__main">
                <nav className="concept-shots__tabs" aria-label="Fivepixels concept shot scenes">
                    {CONCEPT_SHOT_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className="concept-shots__tab"
                            aria-pressed={tab.id === activeTab.id}
                            onClick={() => setActiveTabId(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="concept-shots__caption-row">
                    <p className="concept-shots__caption">{activeTab.caption}</p>
                    <span>Multiple live markers · active tooltip</span>
                </div>

                <section className={`concept-shots__stage concept-shots__stage--${appearance}`} aria-label={`${activeTab.label} concept stage`}>
                    <ConceptShotStageBackground media={media} />
                    <div className="concept-shots__scene">
                        <ConceptShotFivepixels
                            key={`${activeTab.id}-${locale}-${appearance}`}
                            scene={activeTab.id}
                            activeTargetId={activeTab.activeTargetId}
                            locale={locale}
                            appearance={appearance}
                        >
                            <ConceptShotScene scene={activeTab.id} />
                        </ConceptShotFivepixels>
                    </div>
                </section>

                <ConceptShotBackgroundControls media={media} onChange={replaceMedia} />
            </main>
        </div>
    );
}
