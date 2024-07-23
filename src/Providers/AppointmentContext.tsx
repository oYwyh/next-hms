'use client'

import { useState } from "react";
import { AppointmentContext } from "@/context/appointment.context";


export default function AppointmentContextProvider({ children }: { children: React.ReactNode }) {
    const [appointmentId, setAppointmentId] = useState<string | number>("");


    return (
        <AppointmentContext.Provider value={{ appointmentId, setAppointmentId }}>
            {children}
        </AppointmentContext.Provider>
    )
}