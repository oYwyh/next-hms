'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppointmentContext } from "./(dashboard)/user/context";
import { useState } from "react";


export const ClientStuffProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient();

    const [appointmentId, setAppointmentId] = useState<string | number>("");

    return (
        <QueryClientProvider client={queryClient}>
            <AppointmentContext.Provider value={{ appointmentId, setAppointmentId }}>
                {children}
            </AppointmentContext.Provider>
            <ReactQueryDevtools />
        </QueryClientProvider >
    )
}