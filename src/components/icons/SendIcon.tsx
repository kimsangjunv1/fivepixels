type SendIconProps = {
    className?: string;
};

export function SendIcon({ className }: SendIconProps) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M3 20V14L11 12L3 10V4L22 12L3 20Z"
                fill="var(--adaptive-black50)"
            />
        </svg>
    );
}
