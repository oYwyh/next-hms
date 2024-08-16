'use client';

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { book } from "@/actions/appointment.actions";
import { getByField, uniqueColumnsValidations } from "@/actions/index.actions";
import { add } from "@/actions/operations.actions";
import { createReceipt } from "@/actions/receipt.actions";

import Booking from "@/app/_components/Booking";
import RolesOperationsForm from "@/app/dashboard/_components/RolesOperationsForm";

import { handleError } from "@/lib/funcs";
import { InsertedCredential, TDepartments, TReceipt, TReceiptTypes, TReceptionist, TUser } from "@/types/index.types";
import { addSchema, TAddSchema } from "@/types/operations.types";
import { ReservationContext } from "@/context/reservation.context";

interface IBookingData {
    doctorId: number;
    service: string;
    amount: string;
    date: string;
    from: string;
    to: string;
    department: TDepartments;
    receiptType: TReceiptTypes;
}

export default function NewUser({ credential }: { credential: InsertedCredential }) {
    const router = useRouter();
    const context = useContext(ReservationContext);

    const [userData, setUserData] = useState<TAddSchema | null>(null);
    const [receptionistData, setReceptionistData] = useState<TReceptionist | null>(null);
    const [bookingData, setBookingData] = useState<IBookingData | undefined>();

    const form = useForm<TAddSchema>({
        resolver: zodResolver(addSchema),
    });

    const { data: receptionist } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user/info');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        }
    });

    useEffect(() => {
        const fetchReceptionistData = async () => {
            if (receptionist) {
                const [data] = await getByField({ value: receptionist.id, tableName: 'receptionist', fieldToMatch: 'userId' });
                setReceptionistData(data);
            }
        };
        fetchReceptionistData();
    }, [receptionist]);

    useEffect(() => {
        if (userData && bookingData) {
            handleBooking();
        }
    }, [userData, bookingData]);

    const handleSetUserData = async (data: TAddSchema) => {
        const validation = await uniqueColumnsValidations(data);
        if (validation?.error) {
            handleError(form, validation.error);
            return;
        }
        setUserData(data);
    };

    const handleBooking = async () => {
        if (!bookingData || !userData || !receptionistData) return;

        const { data } = await add({ data: userData, role: 'user' });
        if (!data) return;

        const appointment = await book({
            userId: data.user.id,
            doctorId: bookingData.doctorId,
            date: bookingData.date,
            from: bookingData.from,
            to: bookingData.to,
            department: bookingData.department,
        });
        if (!appointment) return;

        const receiptData: Partial<TReceipt> = {
            service: bookingData.service,
            amount: bookingData.amount,
            userId: data.user.id,
            doctorId: bookingData.doctorId,
            appointmentId: appointment.appointment.id,
            receptionistId: receptionistData.id,
            type: bookingData.receiptType,
        };

        const receipt = await createReceipt(receiptData);

        if (appointment?.reserved && context) {
            context.setReservation({ appointmentId: appointment.appointment.id, receiptId: receipt.id });
            router.push('/dashboard/reservation');
        } else {
            throw new Error('Failed to book appointment');
        }
    };

    return userData ? (
        <Booking
            role='receptionist'
            userId={userData.id}
            setBookingData={setBookingData}
        />
    ) : (
        <RolesOperationsForm
            form={form}
            onSubmit={handleSetUserData}
            role='user'
            operation="add"
            pwd={false}
            credential={credential}
        />
    );
}