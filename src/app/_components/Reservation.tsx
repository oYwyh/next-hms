'use client'

import { useContext, useEffect, useState } from "react";
import { ReservationContext } from "@/context/reservation.context";
import { getReservationDetails } from "@/actions/reservation.actions";
import { redirect } from "next/navigation";
import { AppointmentStatus, TAppointment, TDoctor, TUser, UserRoles } from "@/types/index.types";
import { getDayByDate } from "@/lib/funcs";
import { Separator } from "@/components/ui/Separator";
import { CircleDollarSign, Mail } from "lucide-react";

export default function Reservation() {
    const context = useContext(ReservationContext);

    if (!context.reservation.appointmentId) {
        redirect('/appointments')
        return;
    }

    const { reservation: { appointmentId } } = context

    const [appointment, setAppointment] = useState<TAppointment>();
    const [user, setUser] = useState<TUser>();
    const [doctor, setDoctor] = useState<{ id: string; doctorId: number; } & Partial<Omit<TUser, 'id'>> & Partial<Omit<TDoctor, 'id'>>>();

    const reservationDetails = async () => {

        const result = await getReservationDetails(appointmentId);

        if (!result) throw new Error('Failed to get appointment details');

        if (!result.appointment || !result.user || !result.doctor) throw new Error('Failed to get appointment details');

        setAppointment({
            id: result.appointment.id,
            date: result.appointment.date,
            from: result.appointment.from,
            to: result.appointment.to,
            doctorId: result.appointment.doctorId,
            userId: result.appointment.userId,
            status: result.appointment.status as AppointmentStatus,
            createdAt: result.appointment.createdAt || new Date(),
            updatedAt: result.appointment.updatedAt || new Date()
        });
        setUser({
            id: result.user.id,
            firstname: result.user.firstname,
            lastname: result.user.lastname,
            username: result.user.username,
            email: result.user.email,
            phone: result.user.phone,
            nationalId: result.user.nationalId,
            dob: result.user.dob,
            gender: result.user.gender,
            picture: result.user.picture,
            role: result.user.role as UserRoles,
            createdAt: result.user.createdAt || new Date(),
            updatedAt: result.user.updatedAt || new Date()
        });
        setDoctor({
            id: result.doctor.id,
            firstname: result.doctor.firstname,
            lastname: result.doctor.lastname,
            username: result.doctor.username,
            email: result.doctor.email,
            phone: result.doctor.phone,
            nationalId: result.doctor.nationalId,
            dob: result.doctor.dob,
            gender: result.doctor.gender,
            picture: result.doctor.picture,
            role: result.doctor.role as UserRoles,
            specialty: result.doctor.specialty as TDoctor['specialty'],
            fee: result.doctor.fee,
            doctorId: result.doctor.doctorId as TDoctor['id'],
        });

        return {
            appointment: result.appointment,
            user: result.user,
            doctor: result.doctor
        };
    }

    useEffect(() => {
        reservationDetails()
    }, [])

    return (
        <div>
            {user && doctor && appointment && (
                <>
                    <div className="flex flex-col gap-5 bg-white p-2 rounded-md">
                        <ul className="flex flex-col gap-2">
                            <li className="flex flex-row gap-2"><Mail color="#343A40" />we have notified doctor {doctor.firstname} {doctor.lastname} about your appointment</li>
                            <Separator />
                            <li className="flex flex-row gap-10"><span className="flex flex-row gap-2"><CircleDollarSign color="#343A40" /><strong>Examination Fee:</strong></span> {doctor.fee} EGP</li>
                        </ul>
                        <Separator />
                        <ul className="flex flex-col gap-2 ">
                            <li className="flex flex-row gap-10"><strong>Patient Name:</strong> {user.firstname} {user.lastname}</li>
                            <Separator />
                            <li className="flex flex-row gap-10"><strong>Booking Date:</strong> {getDayByDate(appointment.date)}, from {appointment.from} to {appointment.to}</li>
                            <Separator />
                            <li className="flex flex-row gap-10"><strong>Doctor Name:</strong> {doctor.firstname} {doctor.lastname}</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    )
}