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
                    className="rounded-[8px] border border-[var(--adaptive-black600)] px-[8px] py-[4px] text-[12px] font-semibold uppercase text-[var(--adaptive-black500)]"
                >
                    {tag.label}
                </span>
            ))}
        </div>
    );
}
