type FeedbackFieldTagsProps = {
    tags: { key: string; label: string }[];
};

export function FeedbackFieldTags({ tags }: FeedbackFieldTagsProps) {
    if (tags.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-[6px]">
            {tags.map((tag) => (
                <span
                    key={tag.key}
                    className="rounded-full border border-[var(--adaptive-grey400)] px-[10px] py-[4px] text-[10px] font-semibold uppercase tracking-wide text-[var(--adaptive-grey500)]"
                >
                    {tag.label}
                </span>
            ))}
        </div>
    );
}
