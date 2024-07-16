
import { CalendarOff, CheckCheck, Loader } from "lucide-react";

export const statuses = [
    {
        value: "pending",
        label: "Pending",
        icon: Loader,
    },
    {
        value: "completed",
        label: "Completed",
        icon: CheckCheck,
    },
    {
        value: "canceled",
        label: "Canceled",
        icon: CalendarOff,
    },
]