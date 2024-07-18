'use client'

import { useState } from "react";
import { AppointmentContext } from "./context";


export default function ClientStuffProvider({ children }: { children: React.ReactNode }) {
    const [appointmentId, setAppointmentId] = useState<string | number>("");


    return (
        <AppointmentContext.Provider value={{ appointmentId, setAppointmentId }}>
            {children}
        </AppointmentContext.Provider>
    )
}