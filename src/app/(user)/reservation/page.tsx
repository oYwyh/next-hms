'use client'

import { useContext, useEffect, useState } from "react";
import { AppointmentContext } from "@/context/appointment.context";
import { appointmentDetails } from "@/actions/user.actions";
import { redirect } from "next/navigation";

export default function ReservationPage() {
    const context = useContext(AppointmentContext);

    if (context == undefined || !context?.appointmentId) {
        redirect('/appointments')
        return;
    }

    const { appointmentId } = context || {};

    const [appointment, setAppointment] = useState({});
    const [user, setUser] = useState({});
    const [doctor, setDoctor] = useState({});

    const getAppointmentDetails = async () => {

        const result = await appointmentDetails(appointmentId);

        if (!result) throw new Error('Failed to get appointment details');

        setAppointment(result.appointment);
        setUser(result.user);
        setDoctor(result.doctor);

        return {
            appointment: result.appointment,
            user: result.user,
            doctor: result.doctor
        };
    }

    useEffect(() => {
        getAppointmentDetails()
    }, [])

    return (
        <>
            Reservation {appointmentId}

            <pre>{JSON.stringify({ appointment, user, doctor }, null, 2)}</pre>
        </>
    )
}