import type { KanbanCard, PulseTag } from "../../../features/landing/model/LandingContext";
import { useLandingProvider } from "../../../features/landing/model/LandingContext";

const tagClass: Record<PulseTag, string> = {
    BUG: "pulse-tag--bug",
    COPY: "pulse-tag--copy",
    A11Y: "pulse-tag--a11y",
    UI: "pulse-tag--ui",
};

function KanbanCardView({ card }: { card: KanbanCard }) {
    return (
        <article className="pulse-kanban__card" data-fp-id={card.id} data-fp-type="item">
            <h4 className="pulse-kanban__card-title">{card.title}</h4>
            {card.description ? (
                <div
                    className="pulse-kanban__card-desc"
                    data-fp-id={`${card.id}-desc`}
                    data-fp-type="item"
                >
                    {card.description.split("\n").map((line, index) => (
                        <span key={`${card.id}-line-${index}`}>
                            {line}
                            {index < card.description!.split("\n").length - 1 ? <br /> : null}
                        </span>
                    ))}
                </div>
            ) : null}
            <div className="pulse-kanban__card-footer">
                <div className="pulse-kanban__tags">
                    {card.tags.map((tag) => (
                        <span key={`${card.id}-${tag}`} className={`pulse-tag ${tagClass[tag]}`}>
                            {tag}
                        </span>
                    ))}
                </div>
                <span className="pulse-kanban__assignee">{card.assignee}</span>
            </div>
        </article>
    );
}

export function PulseKanban() {
    const { kanbanColumns } = useLandingProvider();

    return (
        <section className="pulse-kanban" data-fp-id="pulse-kanban" data-fp-type="group">
            {kanbanColumns.map((column) => (
                <div
                    key={column.id}
                    className="pulse-kanban__column"
                    data-fp-id={column.id}
                    data-fp-type="group"
                >
                    <header className="pulse-kanban__column-header">
                        <span>{column.title}</span>
                        <span className="pulse-kanban__count">{column.cards.length}</span>
                    </header>
                    <div className="pulse-kanban__cards">
                        {column.cards.map((card) => (
                            <KanbanCardView key={card.id} card={card} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
