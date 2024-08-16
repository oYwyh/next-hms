'use client'

import { getByField } from "@/actions/index.actions"
import CheckCredential from "@/app/_components/CheckCredential"
import NewUser from "@/app/dashboard/_components/receptionist/NewUser"
import { InsertedCredential, TAppointment, TDepartments, TDoctor, TReceipt, TReceiptTypes, TReceptionist, TUser } from "@/types/index.types"
import { use, useContext, useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table"
import { eq } from "drizzle-orm"
import { Button } from "@/components/ui/Button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/AlertDialog"
import { useQuery } from "@tanstack/react-query"
import { createReceipt } from "@/actions/receipt.actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { Form } from "@/components/ui/Form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import FormField from "@/components/ui/custom/FormField"
import { useRouter } from "next/navigation"
import { ReservationContext } from "@/context/reservation.context"
import Booking from "@/app/_components/Booking"
import { book } from "@/actions/appointment.actions"

export type TFullAppointment = TAppointment & {
    doctor: TDoctor & TUser;
    receipt: TReceipt | null;
};

type TFullReceptionist = TUser & Omit<TReceptionist, 'id'> & { receptionistId: number }

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

export default function ExistingUser({ credential }: { credential: Required<InsertedCredential> }) {
    const router = useRouter();
    const context = useContext(ReservationContext);
    const [user, setUser] = useState<TUser>()
    const [receptionist, setReceptionist] = useState<TFullReceptionist>()
    const [appointments, setAppointments] = useState<TFullAppointment[]>()
    const [newAppointment, setNewAppointment] = useState<boolean>(false)
    const [bookingData, setBookingData] = useState<IBookingData>();

    useEffect(() => {
        async function getData() {

            const [user] = await getByField({
                value: credential.credential,
                tableName: 'user',
                fieldToMatch: credential.column,
            })

            const appointments = await getByField({
                value: user.id,
                tableName: 'appointment',
                fieldToMatch: 'userId'
            })

            const doctors = await Promise.all(
                appointments.map(async (appointment: any) => {
                    const [doctor] = await getByField({
                        value: appointment.doctorId,
                        tableName: 'doctor',
                        fieldToMatch: 'id'
                    });

                    return doctor as TDoctor;
                })
            );


            const doctorUsers = await Promise.all(doctors.map(async (doctor: TDoctor) => {
                const [user] = await getByField({
                    value: doctor.userId,
                    tableName: 'user',
                    fieldToMatch: 'id'
                });

                return user as TUser;
            }));

            const receipts = await Promise.all(appointments.map(async (appointment: any) => {
                const [receipt] = await getByField({
                    value: appointment.id,
                    tableName: 'receipt',
                    fieldToMatch: 'appointmentId'
                });

                return receipt as TReceipt;
            }));


            const FullAppointments = appointments.map((appointment: any) => {
                const doctor = doctors.find((doc: TDoctor) => doc.id === appointment.doctorId);
                const doctorUser = doctorUsers.find((user) => user.id === doctor?.userId);
                const receipt = receipts.find((receipt: TReceipt | undefined) => receipt?.appointmentId === appointment.id);

                return {
                    ...appointment,
                    doctor: {
                        ...doctorUser,
                        fee: doctor?.fee,
                        specialty: doctor?.specialty,
                        doctorId: doctor?.id,
                    },
                    receipt: receipt || null,
                };
            });


            if (!user || !appointments) return

            if (user && appointments) {
                setUser(user)
                setAppointments(FullAppointments)
            }
        }
        getData()
    }, [])

    const { data: receptionistUserData } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user/info');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        }
    })

    useEffect(() => {
        async function getReceptionist() {
            if (receptionistUserData) {
                const [receptionistData] = await getByField({
                    value: receptionistUserData.id,
                    tableName: 'receptionist',
                    fieldToMatch: 'userId'
                });

                if (!receptionistData) {
                    throw new Error("Receptionist data is missing");
                }

                const receptionist: TFullReceptionist = {
                    ...receptionistUserData,
                    receptionistId: receptionistData.id,
                    department: receptionistData.department as TDepartments,
                };

                setReceptionist(receptionist);
            }
        }
        getReceptionist()
    }, [receptionistUserData])

    const receiptTypeSchema = z.object({
        type: z.enum(['cash', 'credit', 'electronic'])
    })

    const receiptTypeForm = useForm<z.infer<typeof receiptTypeSchema>>({
        resolver: zodResolver(receiptTypeSchema)
    })

    const handleSubmit = async (data: z.infer<typeof receiptTypeSchema>, appointment: TFullAppointment, receptionist: TFullReceptionist) => {
        const receiptData: Partial<TReceipt> = {
            service: appointment.doctor.specialty,
            amount: String(appointment.doctor.fee),
            userId: user?.id,
            doctorId: appointment.doctorId,
            appointmentId: appointment.id,
            receptionistId: receptionist.receptionistId,
            type: data.type,
        };

        const receipt = await createReceipt(receiptData);

        if (receipt && context) {
            context.setReservation({ appointmentId: appointment.id, receiptId: receipt.id });
            router.push('/dashboard/reservation');
        } else {
            throw new Error('Failed to book appointment');
        }
    }

    const handleBooking = async () => {
        if (!bookingData || !user || !receptionist) return;

        const appointment = await book({
            userId: user.id,
            doctorId: bookingData.doctorId,
            date: bookingData.date,
            from: bookingData.from,
            to: bookingData.to,
            department: bookingData.department
        });
        if (!appointment) return;

        const receiptData: Partial<TReceipt> = {
            service: bookingData.service,
            amount: bookingData.amount,
            userId: user.id,
            doctorId: bookingData.doctorId,
            appointmentId: appointment.appointment.id,
            receptionistId: receptionist.receptionistId,
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

    useEffect(() => {
        if (user && bookingData) {
            handleBooking();
        }
    }, [bookingData, user, receptionist]);

    return (
        <div className="w-full p-4">
            {newAppointment && user ? (
                <Booking
                    role='receptionist'
                    userId={user.id}
                    setBookingData={setBookingData}
                />
            ) : (
                <div className="flex flex-col gap-2">
                    <Button variant={'secondary'} className="w-fit" onClick={() => setNewAppointment(true)}>New Appointment</Button>
                    {user && appointments && receptionist && (
                        <Table>
                            <TableCaption>
                                {appointments.length > 0 ? (
                                    <>
                                        <p>Appointments</p>
                                    </>
                                ) : (
                                    <p className="text-red-500">No appointments.</p>
                                )}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">id</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments && appointments.length > 0 && (
                                    <>
                                        {appointments.filter((appointment) => appointment.status === 'pending' && !appointment.receipt)?.map((appointment, index) => {
                                            return (
                                                <TableRow>
                                                    <TableCell className="font-medium">{appointment.id}</TableCell>
                                                    <TableCell className="capitalize">{appointment.doctor?.firstname} {appointment.doctor?.lastname}</TableCell>
                                                    <TableCell className="capitalize">{appointment.doctor?.specialty.replace(/_/g, ' ')}</TableCell>
                                                    <TableCell>{appointment.date}</TableCell>
                                                    <TableCell>{appointment.from}</TableCell>
                                                    <TableCell>{appointment.to}</TableCell>
                                                    <TableCell className="text-orange-400">{appointment.status}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Dialog>
                                                            <DialogTrigger>Take Receipt</DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Take Receipt</DialogTitle>
                                                                    <DialogDescription>
                                                                        This action cannot be undone. This will permanently delete your account
                                                                        and remove your data from our servers.
                                                                    </DialogDescription>
                                                                    <Form {...receiptTypeForm}>
                                                                        <form onSubmit={(e) => {
                                                                            e.preventDefault()
                                                                            handleSubmit(receiptTypeForm.getValues(), appointment, receptionist)
                                                                        }}>
                                                                            <FormField form={receiptTypeForm} name="type" select="receiptType" defaultValue="cash" label='' />
                                                                            <Button className="mt-2 w-full">Take it</Button>
                                                                        </form>
                                                                    </Form>
                                                                </DialogHeader>
                                                            </DialogContent>
                                                        </Dialog>

                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            )}
        </div>
    )
}