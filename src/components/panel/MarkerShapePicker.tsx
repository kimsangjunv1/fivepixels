import type { MarkerShape } from "@/constants/markerAppearance.js";
import { MARKER_SHAPE_VALUES } from "@/constants/markerAppearance.js";
import { CheckIcon } from "@/components/icons/Icons.js";

type MarkerShapePickerProps = {
    value: MarkerShape;
    onChange: (value: MarkerShape) => void;
    labels: Record<MarkerShape, string>;
    ariaLabel: string;
};

function ShapePreview({ shape }: { shape: MarkerShape }) {
    if (shape === "square") {
        return <span className="block h-[14px] w-[14px] rounded-[3px] bg-[var(--adaptive-blue500)]" />;
    }

    if (shape === "pill") {
        return <span className="block h-[10px] w-[18px] rounded-full bg-[var(--adaptive-blue500)]" />;
    }

    if (shape === "pin") {
        return (
            <span
                className="block h-[16px] w-[12px] bg-[var(--adaptive-blue500)]"
                style={{ clipPath: "polygon(50% 100%, 6% 42%, 6% 8%, 94% 8%, 94% 42%)" }}
            />
        );
    }

    return <span className="block h-[14px] w-[14px] rounded-full bg-[var(--adaptive-blue500)]" />;
}

export function MarkerShapePicker({ value, onChange, labels, ariaLabel }: MarkerShapePickerProps) {
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className="grid grid-cols-4 gap-[6px]"
        >
            {MARKER_SHAPE_VALUES.map((shape) => {
                const active = shape === value;

                return (
                    <button
                        key={shape}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(shape)}
                        className={`group relative flex flex-col items-center gap-[5px] rounded-[8px] p-[4px] transition-colors ${
                            active
                                ? "ring-2 ring-[var(--adaptive-blue500)] ring-offset-1 ring-offset-[var(--adaptive-black50)]"
                                : "ring-1 ring-[var(--adaptive-black200)] hover:ring-[var(--adaptive-black300)]"
                        }`}
                    >
                        <div className="relative flex h-[28px] w-full items-center justify-center rounded-[5px] bg-[var(--adaptive-black100)]">
                            <ShapePreview shape={shape} />
                            {active ? (
                                <span className="absolute right-[2px] bottom-[2px] flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[var(--adaptive-blue500)] text-white">
                                    <CheckIcon className="h-[7px] w-[7px]" />
                                </span>
                            ) : null}
                        </div>
                        <span
                            className={`w-full truncate text-center text-[9px] leading-[1.2] ${
                                active
                                    ? "font-semibold text-[var(--adaptive-blue500)]"
                                    : "font-medium text-[var(--adaptive-black600)] group-hover:text-[var(--adaptive-black800)]"
                            }`}
                        >
                            {labels[shape]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
