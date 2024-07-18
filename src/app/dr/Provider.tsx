'use client'

import { AppointmentContext } from "@/app/(user)/context";
import { useState } from "react";


export default function ClientStuffProvider({ children }: { children: React.ReactNode }) {
    const [appointmentId, setAppointmentId] = useState<string | number>("");


    return (
        <AppointmentContext.Provider value={{ appointmentId, setAppointmentId }}>
            {children}
        </AppointmentContext.Provider>
    )
}