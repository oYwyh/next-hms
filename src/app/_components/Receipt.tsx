'use client'

import { getReservationDetails } from "@/actions/reservation.actions";
import { Separator } from "@/components/ui/Separator";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table"
import { ReservationContext } from "@/context/reservation.context";
import { AppointmentStatus, TAppointment, TDepartments, TDoctor, TReceipt, TReceiptTypes, TReceptionist, TUser, UserRoles } from "@/types/index.types";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Receipt() {
    const context = useContext(ReservationContext);

    if (!context?.reservation.appointmentId || !context.reservation.receiptId) {
        redirect('/dashboard')
        return;
    }

    const { reservation: { appointmentId } } = context;

    const [appointment, setAppointment] = useState<TAppointment>();
    const [user, setUser] = useState<TUser>();
    const [doctor, setDoctor] = useState<{ id: string; doctorId: number; } & Partial<Omit<TUser, 'id'>> & Partial<Omit<TDoctor, 'id'>>>();
    const [receptionist, setReceptionist] = useState<{ id: string; receptionistId: number; } & Partial<Omit<TUser, 'id'>> & Partial<Omit<TReceptionist, 'id'>>>();
    const [receipt, setReceipt] = useState<TReceipt>();

    const reservationDetails = async () => {

        const result = await getReservationDetails(appointmentId, true);

        if (!result) throw new Error('Failed to get appointment details');

        if (!result.appointment || !result.user || !result.doctor || !result.receipt) throw new Error('Failed to get appointment details');

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
        setReceipt({
            id: result.receipt.id,
            service: result.receipt.service,
            amount: result.receipt.amount,
            userId: result.receipt.userId,
            doctorId: result.receipt.doctorId || 0,
            appointmentId: result.receipt.appointmentId || 0,
            receptionistId: result.receipt.receptionistId,
            date: result.receipt.date as Date,
            type: result.receipt.type as TReceiptTypes,
            createdAt: result.receipt.createdAt || new Date(),
            updatedAt: result.receipt.updatedAt || new Date()
        })
        setReceptionist({
            id: result.receptionist?.id as string,
            receptionistId: result.receptionist?.receptionistId as number,
            firstname: result.receptionist?.firstname,
            lastname: result.receptionist?.lastname,
            username: result.receptionist?.username,
            email: result.receptionist?.email,
            phone: result.receptionist?.phone,
            nationalId: result.receptionist?.nationalId,
            dob: result.receptionist?.dob,
            gender: result.receptionist?.gender,
            picture: result.receptionist?.picture,
            role: result.receptionist?.role as UserRoles,
            department: result.receptionist?.department as TDepartments,
            createdAt: result.receptionist?.createdAt || new Date(),
            updatedAt: result.receptionist?.updatedAt || new Date(),
        })

        return {
            appointment: result.appointment,
            user: result.user,
            doctor: result.doctor,
            receipt: result.receipt
        };
    }

    useEffect(() => {
        reservationDetails()
    }, [])
    if (!receipt || !doctor || !user || !receptionist) return;

    return (
        <div className="bg-white rounded-md p-2 flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-2 col-span-1">
                    <p className="text-xs font-bold">Receipt ID: {receipt.id}</p>
                    <p className="text-xs font-bold">Patient ID: {receipt.userId}</p>
                    <p className="text-xs font-bold">Doctor: {doctor.firstname} {doctor.lastname}</p>
                    <p className="text-xs font-bold">Patient: {user.firstname} {user.lastname}</p>
                </div>
                <div className="flex flex-col gap-2 col-span-2 border-2 border-black w-full justify-center items-center h-fit rounded-sm p-2">
                    <p className="text-sm font-bold capitalize">{receipt.type} Receipt</p>
                </div>
                <div className="flex flex-col gap-2 col-span-1">
                    <p className="text-xs font-bold">Receptionist: {receptionist.firstname} {receptionist.lastname}</p>
                    <p className="text-xs font-bold">Receipt Date: {receipt.date.toLocaleString()}</p>
                    <p className="text-xs font-bold">Patient's Gender: {user.gender}</p>
                    <p className="text-xs font-bold">Patient's Date of birth: {user.dob}</p>
                </div>
            </div>
            <Separator className="w-full" />
            <Table>
                <TableCaption>
                    <div className="flex flex-row justify-between">
                        <p>ReceptionistId: {receipt.receptionistId}</p>
                        <p>Print By: {receptionist.firstname} {receptionist.lastname}</p>
                        <p>Print Time: {new Date().toLocaleTimeString()}</p>
                        <p>Print Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">id</TableHead>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">{receipt.id}</TableCell>
                        <TableCell className="capitalize">{receipt.service.split('_').join(' ')}</TableCell>
                        <TableCell>{receipt.amount} EGP</TableCell>
                        <TableCell>0%</TableCell>
                        <TableCell className="text-right">{receipt.amount} EGP</TableCell>
                    </TableRow>
                </TableBody>

            </Table>
        </div>
    )
}