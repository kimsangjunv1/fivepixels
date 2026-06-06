import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon.js";
export function AuthorSelector({ authors, value, onChange }) {
    if (authors.length === 0) {
        return (_jsx("input", { type: "text", value: value, onChange: (event) => onChange(event.target.value), placeholder: "\uC791\uC131\uC790", className: "min-w-0 flex-1 rounded-full bg-[var(--adaptive-black800)] px-[12px] py-[4px] h-[24px] text-[12px] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)]" }));
    }
    return (_jsxs("div", { className: "relative min-w-0", children: [_jsxs("select", { value: value, onChange: (event) => onChange(event.target.value), className: "w-full appearance-none rounded-full bg-[var(--adaptive-black800)] py-[4px] h-[24px] pr-[28px] pl-[12px] text-[12px] text-[var(--adaptive-black500)] outline-none", children: [!value ? (_jsx("option", { value: "", disabled: true, children: "\uC791\uC131\uC790 \uC120\uD0DD" })) : null, authors.map((author) => (_jsx("option", { value: author.name, children: author.name }, author.id)))] }), _jsx(ChevronDownIcon, { className: "pointer-events-none absolute top-1/2 right-[10px] h-[14px] w-[14px] -translate-y-1/2 text-[var(--adaptive-black600)]" })] }));
}
//# sourceMappingURL=AuthorSelector.js.map