'use client'

import { useState } from "react";
import { ReservationContext, TReservation } from "@/context/reservation.context";

export default function ReservationProvider({ children }: { children: React.ReactNode }) {
    const [reservation, setReservation] = useState<TReservation>({ appointmentId: 0, receiptId: 0 });

    return (
        <ReservationContext.Provider value={{ reservation, setReservation }}>
            {children}
        </ReservationContext.Provider>
    );
}
