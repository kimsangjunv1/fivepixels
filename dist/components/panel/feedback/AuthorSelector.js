import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon.js";
import { PanelDropdownMenu, PanelDropdownMenuItem } from "../PanelDropdownMenu.js";
export function AuthorSelector({ authors, value, onChange }) {
    const [menuOpen, setMenuOpen] = useState(false);
    if (authors.length === 0) {
        return (_jsx("input", { type: "text", value: value, onChange: (event) => onChange(event.target.value), placeholder: "\uC791\uC131\uC790", className: "min-w-0 flex-1 rounded-full bg-[var(--adaptive-black800)] px-[12px] py-[4px] h-[24px] text-[12px] text-[var(--adaptive-black900)] outline-none placeholder:text-[var(--adaptive-black500)]" }));
    }
    return (_jsx(PanelDropdownMenu, { open: menuOpen, onClose: () => setMenuOpen(false), align: "left", menuClassName: "min-w-full", trigger: _jsxs("button", { type: "button", onClick: () => setMenuOpen((current) => !current), "aria-expanded": menuOpen, "aria-haspopup": "menu", "aria-label": "\uC791\uC131\uC790 \uC120\uD0DD", className: "flex w-full min-w-0 items-center justify-between rounded-full bg-[var(--adaptive-black800)] py-[4px] h-[24px] pr-[10px] pl-[12px] text-[12px] outline-none", children: [_jsx("span", { className: `truncate ${value ? "text-[var(--adaptive-black900)]" : "text-[var(--adaptive-black500)]"}`, children: value || "작성자 선택" }), _jsx(ChevronDownIcon, { className: `h-[14px] w-[14px] shrink-0 text-[var(--adaptive-black600)] transition-transform ${menuOpen ? "rotate-180" : ""}` })] }), children: authors.map((author) => (_jsx(PanelDropdownMenuItem, { active: value === author.name, onClick: () => {
                setMenuOpen(false);
                onChange(author.name);
            }, children: author.name }, author.id))) }));
}
//# sourceMappingURL=AuthorSelector.js.map