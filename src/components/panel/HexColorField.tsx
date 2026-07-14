import { useEffect, useRef, useState } from "react";
import { displayToHex, getHexColorPreview, hexToColorInputValue, hexToDisplay, sanitizeHexDisplayInput } from "@/utils/hexColor.js";

type HexColorFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export function HexColorField({ label, value, onChange, placeholder = "ededed" }: HexColorFieldProps) {
    const colorInputRef = useRef<HTMLInputElement | null>(null);
    const [displayValue, setDisplayValue] = useState(() => hexToDisplay(value));
    const preview = getHexColorPreview(value);

    useEffect(() => {
        setDisplayValue(hexToDisplay(value));
    }, [value]);

    const commitDisplayValue = (raw: string) => {
        const sanitized = sanitizeHexDisplayInput(raw);
        setDisplayValue(sanitized);

        if (sanitized.length === 6) {
            const hex = displayToHex(sanitized);

            if (hex) {
                onChange(hex);
            }
        }
    };

    return (
        <label className="flex flex-col gap-[4px] text-[11px]">
            <span className="font-medium text-[var(--adaptive-black500)]">{label}</span>
            <div className="flex items-center gap-[6px]">
                <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="relative h-[30px] w-[30px] shrink-0 overflow-hidden rounded-[8px] border border-[var(--adaptive-border-subtle)]"
                    aria-label={label}
                >
                    <span
                        className="absolute inset-0"
                        style={{ backgroundColor: preview ?? "transparent" }}
                        aria-hidden
                    />
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={hexToColorInputValue(value)}
                        onChange={(event) => onChange(event.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        tabIndex={-1}
                    />
                </button>
                <input
                    type="text"
                    value={displayValue}
                    onChange={(event) => commitDisplayValue(event.target.value)}
                    placeholder={placeholder}
                    className="min-w-0 flex-1 rounded-[8px] border border-[var(--adaptive-border-subtle)] bg-[var(--adaptive-black50)] px-[8px] py-[6px] font-[var(--coding-font)] text-[12px] uppercase text-[var(--adaptive-black900)] outline-none focus:border-[var(--adaptive-blue500)]"
                />
            </div>
        </label>
    );
}
