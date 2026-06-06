import { ChevronDownIcon } from "../../icons/ChevronDownIcon.js";
import type { ReportAuthor } from "../../../types/report.js";

type AuthorSelectorProps = {
    authors: ReportAuthor[];
    value: string;
    onChange: (nextValue: string) => void;
};

export function AuthorSelector({ authors, value, onChange }: AuthorSelectorProps) {
    if (authors.length === 0) {
        return (
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="작성자"
                className="min-w-0 flex-1 rounded-full bg-[var(--adaptive-black800)] px-[12px] py-[4px] h-[24px] text-[12px] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)]"
            />
        );
    }

    return (
        <div className="relative min-w-0">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full appearance-none rounded-full bg-[var(--adaptive-black800)] py-[4px] h-[24px] pr-[28px] pl-[12px] text-[12px] text-[var(--adaptive-black500)] outline-none"
            >
                {!value ? (
                    <option
                        value=""
                        disabled
                    >
                        작성자 선택
                    </option>
                ) : null}
                {authors.map((author) => (
                    <option
                        key={author.id}
                        value={author.name}
                    >
                        {author.name}
                    </option>
                ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-[10px] h-[14px] w-[14px] -translate-y-1/2 text-[var(--adaptive-black600)]" />
        </div>
    );
}
