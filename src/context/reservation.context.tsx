import { createContext, Dispatch, SetStateAction, useContext } from "react";

export type TReservation = {
    appointmentId: number;
    receiptId?: number;
};

type TReservationContext = {
    reservation: TReservation;
    setReservation: Dispatch<SetStateAction<TReservation>>;
};

export const ReservationContext = createContext<TReservationContext>({
    reservation: { appointmentId: 0, receiptId: 0 }, // Default values, assuming 0 is invalid
    setReservation: () => { throw new Error("setReservation function must be overridden"); }
});

// Custom hook to access the ReservationContext
export const useReservationContext = () => {
    const context = useContext(ReservationContext);
    if (!context) {
        throw new Error("useReservationContext must be used within a ReservationProvider");
    }
    return context;
};
