/** Perimeter order for a 2×3 grid: top → right → bottom → left. */
const DOT_DELAYS_MS: Record<number, number> = {
    0: 0,
    1: 200,
    2: 1000,
    3: 400,
    4: 800,
    5: 600,
};
const DOT_COUNT = 6;
const CYCLE_DURATION_MS = 1200;

type ProcessingDotsProps = {
    className?: string;
};

export function ProcessingDots({ className = "" }: ProcessingDotsProps) {
    return (
        <span
            aria-hidden
            className={`fivepixels-processing-dots inline-grid shrink-0 grid-cols-2 grid-rows-3 gap-[2px] ${className}`.trim()}
        >
            {Array.from({ length: DOT_COUNT }, (_, index) => (
                <span
                    key={index}
                    className="fivepixels-processing-dots__dot h-[2px] w-[2px] rounded-full bg-[var(--adaptive-blue400)]"
                    style={{
                        animationDuration: `${CYCLE_DURATION_MS}ms`,
                        animationDelay: `${DOT_DELAYS_MS[index] ?? 0}ms`,
                    }}
                />
            ))}
        </span>
    );
}
