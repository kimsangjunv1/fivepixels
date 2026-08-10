type MarkerReplyBadgeProps = {
    size: number;
    /** Marker fill color — badge background matches the marker. */
    accentColor: string;
};

/** Satellite badge on the top-right of a marker when the thread has replies. */
export function MarkerReplyBadge({ size, accentColor }: MarkerReplyBadgeProps) {
    const offset = Math.max(1, Math.round(size * 0.15));

    return (
        <span
            aria-hidden
            className="pointer-events-none absolute rounded-full border-2 border-white"
            style={{
                width: size,
                height: size,
                top: -offset,
                right: -offset,
                backgroundColor: accentColor,
                boxShadow: "0 1px 4px #00000040",
            }}
        />
    );
}
