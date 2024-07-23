import { createContext, Dispatch, SetStateAction, useContext } from "react";

type AppointmentContextType = {
    appointmentId: string | number;
    setAppointmentId: Dispatch<SetStateAction<string | number>>
}

export const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useGetAppointmentId = () => {
    const appointmentId = useContext(AppointmentContext)
    if (appointmentId == undefined) {
        throw new Error("useGetAppointmentId must be used within an AppointmentProvider")
    }
    return appointmentId;
}
