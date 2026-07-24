import { Text } from "@/components/ui/Text";

type ComposerFooterWarningProps = {
    message: string;
};

export function ComposerFooterWarning({ message }: ComposerFooterWarningProps) {
    return (
        <div
            role="alert"
            className="flex items-center gap-[6px] border-t border-[var(--adaptive-tintOpacity100)] px-[12px] py-[6px]"
        >
            <Text.Shimmer
                className="text-[12px] font-medium"
                color={{ start: "#000000", end: "#ef4444" }}
                duration={4}
            >
                {message}
            </Text.Shimmer>
        </div>
    );
}
