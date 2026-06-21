type GitHubIssueIconProps = {
    className?: string;
};

export function GitHubIssueIcon({ className }: GitHubIssueIconProps) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <circle
                cx="8"
                cy="8"
                r="6.25"
                stroke="currentColor"
                strokeWidth="1.25"
            />
            <path
                d="M8 4.75V11.25M5.25 8H10.75"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
            />
        </svg>
    );
}
