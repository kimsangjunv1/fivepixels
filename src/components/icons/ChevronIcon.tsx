import { MaterialIcon } from "@/components/icons/MaterialIcon.js";

type ChevronIconProps = {
    className?: string;
};

export function ChevronLeftIcon({ className }: ChevronIconProps) {
    return (
        <MaterialIcon className={className}>
            <path d="m432-480 156 156q11 11 11 28t-11 28q-11 11-28 11t-28-11L348-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 28-11t28 11q11 11 11 28t-11 28L432-480Z" />
        </MaterialIcon>
    );
}

export function ChevronRightIcon({ className }: ChevronIconProps) {
    return (
        <MaterialIcon className={className}>
            <path d="M504-480 348-636q-11-11-11-28t11-28q11-11 28-11t28 11l184 184q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L404-268q-11 11-28 11t-28-11q-11-11-11-28t11-28l156-156Z" />
        </MaterialIcon>
    );
}
