'use client'

import { Star, StarHalf, Stethoscope, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { book } from "@/actions/appointment.actions";
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { getDateByDayName } from "@/lib/funcs";
import Add from "@/app/dashboard/_components/Add";
import { TDoctor, TReceiptTypes, TUser, TWorkDay } from "@/types/index.types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import FormField from "@/components/ui/custom/FormField";
import { Control, useForm } from "react-hook-form";
import { z } from "zod";
import { daysList, departments } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/Form";
import { ReservationContext } from "@/context/reservation.context";
import { IBookingData } from "@/app/_components/Booking";
import { Separator } from "@/components/ui/Separator";

function BookingInfoDialog(
    {
        form,
        bookingData,
        setBookingData,
        triggerLabel,
        triggerClassName = '',
    }:
        {
            form: any;
            setBookingData: Dispatch<SetStateAction<IBookingData | undefined>>;
            bookingData: IBookingData;
            triggerLabel?: string;
            triggerClassName?: string
        }) {
    return (
        <>
            <Dialog>
                <DialogTrigger className={`
                        w-full p-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                        ${triggerClassName}
                    `}
                >
                    {triggerLabel ? triggerLabel : <>Book</>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Department and Receipt Type</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form className="flex flex-col gap-1" onSubmit={(e) => {
                            e.preventDefault()
                            setBookingData({
                                ...bookingData,
                                department: form.getValues('department'),
                                receiptType: form.getValues('type')
                            })
                        }}>
                            <FormField form={form} name="department" select="department" defaultValue="opd" label='Department' />
                            <FormField form={form} name="type" select="receiptType" defaultValue="cash" label='Receipt Type' />
                            <Button className="w-full">Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function DoctorCard({
    doctor: { user, doctor, workDays },
    userId,
    role,
    setBookingData
}:
    {
        doctor: { user: TUser, doctor: TDoctor, workDays: TWorkDay[] },
        userId: string,
        role?: "receptionist" | 'user',
        setBookingData?: React.Dispatch<React.SetStateAction<IBookingData | undefined>>
    }) {
    const router = useRouter()
    const context = useContext(ReservationContext);

    const onSubmit = async ({
        doctorId,
        date,
        from,
        to,
        data
    }: {
        doctorId: number,
        date: string,
        from: string,
        to: string,
        data?: z.infer<typeof departmentAndReceiptSchema>
    }) => {
        if (userId) {

            const result = await book({ userId, doctorId, date, from, to, department: data?.department });

            // if (setBookingData) {
            //     setBookingData(result);
            // }

            if (context) {
                if (result?.reserved) {
                    context.setReservation({ appointmentId: result?.appointment?.id });
                    router.push('/reservation');
                } else {
                    throw new Error('Failed to book appointment');
                }
            }
        }
    }

    const onDrPage = async () => {
        const doctorUsername = user.username
        router.push('dr/' + doctorUsername)
    }

    // Step 1: Extract the values into an array
    const departmentValues = departments.map(department => department.value) as [string, ...string[]];

    // Step 2: Create the Zod schema using the extracted values
    const departmentAndReceiptSchema = z.object({
        department: z.enum(['opd', 'ipd']).default('opd'),
        type: z.enum(['cash', 'credit', 'electroinc']).default('cash'),
    });

    const departmentAndReceiptForm = useForm<z.infer<typeof departmentAndReceiptSchema>>({
        resolver: zodResolver(departmentAndReceiptSchema)
    })

    const daysOfWeek = daysList.map(day => day.value) as string[]

    const workDayItems = useMemo(() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDate = new Date();
        const currentDayName = days[currentDate.getDay()].toLowerCase();

        return (
            <>
                {workDays.map((day) => (
                    <div className="flex flex-col gap-3 z-20">
                        <div key={day.id} className="flex flex-col gap-1">
                            <p className="text-[14px] font-bold capitalize z-20">
                                {day.day === currentDayName ?
                                    `Today ${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}` :
                                    `${day.day} ${new Date(getDateByDayName(day.day)).getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`
                                }
                            </p>
                            {day.workHours.map((hour) => {
                                return (
                                    <div key={hour.id} className="flex flex-col gap-2">
                                        <div className="z-20 flex flex-row items-center gap-1">
                                            <p className="text-[14px] z-20">From: {hour.from}</p>
                                            <p className="text-[14px] z-20">To: {hour.to}</p>
                                        </div>
                                        {role == 'user' && (
                                            <Button className="z-20" onClick={() => onSubmit({ doctorId: doctor.id, date: getDateByDayName(day.day), from: hour.from, to: hour.to, data: departmentAndReceiptForm.getValues() })}>
                                                Book
                                            </Button>
                                        )}
                                        {role == 'receptionist' && setBookingData && (
                                            <div className="z-20">
                                                <BookingInfoDialog
                                                    form={departmentAndReceiptForm}
                                                    bookingData={
                                                        {
                                                            doctorId: doctor.id,
                                                            service: doctor.specialty,
                                                            amount: String(doctor.fee),
                                                            date: getDateByDayName(day.day),
                                                            from: hour.from,
                                                            to: hour.to,
                                                            department: departmentAndReceiptForm.getValues().department,
                                                            receiptType: departmentAndReceiptForm.getValues().type as TReceiptTypes
                                                        }
                                                    }
                                                    setBookingData={setBookingData}
                                                    triggerClassName="border border-input bg-background hover:bg-accent hover:text-accent-foreground"

                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <Separator />
                    </div>
                ))}
                {setBookingData && (
                    <div className="flex flex-col gap-2 z-20">
                        <p className="text-[14px] font-bold capitalize z-20">Book Now</p>
                        <BookingInfoDialog
                            form={departmentAndReceiptForm}
                            bookingData={
                                {
                                    doctorId: doctor.id,
                                    service: doctor.specialty,
                                    amount: String(doctor.fee),
                                    date: getDateByDayName(daysOfWeek[new Date().getDay()]),
                                    from: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
                                    to: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
                                    department: departmentAndReceiptForm.getValues().department,
                                    receiptType: departmentAndReceiptForm.getValues().type as TReceiptTypes
                                }
                            }
                            setBookingData={setBookingData}
                            triggerLabel={'Book Now'}
                            triggerClassName="bg-primary text-primary-foreground hover:bg-primary/90"
                        />
                    </div>
                )}
            </>
        );
    }, [workDays, userId, context, router]);

    return (
        <div
            className="relative flex flex-row gap-8 px-5 py-5 mt-5 bg-white rounded-md w-fit"
        >
            <div
                className="w-[100%] h-[100%] transition ease-in-out cursor-pointer bg-white hover:bg-slate-200 absolute top-0 left-0 z-10 rounded-md"
                onClick={onDrPage}
            >
            </div>
            <div>
                <Avatar className="z-20 w-[100px] h-[100px] rounded-full border-solid border-black border-1">
                    <AvatarImage src={user.picture ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/${user.picture}` : 'default.jpg'} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col gap-4 ">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-0">
                        <div className="flex flex-row gap-1 items-baseline text-[#0070CD]">
                            <span className="text-[14px] z-20">Doctor</span>
                            <p className="text-[21px] z-20">{user.firstname} {user.lastname}</p>
                        </div>
                        <p className="text-sm text-[#87888B] min-w-[650px] z-20">Professor and Consultant  of {doctor.specialty} & Cardiovascular diseases  - AL Azhar university</p>
                    </div>
                    <div className="flex flex-col gap-0">
                        <div className="z-20 flex flex-row gap-1">
                            <Star size='20' color="gold" fill="gold" />
                            <Star size='20' color="gold" fill="gold" />
                            <Star size='20' color="gold" fill="gold" />
                            <Star size='20' color="gold" fill="gold" />
                            <StarHalf size="20" color="gold" />
                        </div>
                        <p className="text-[12px] text-[#98989A] z-20">Overall Rating From 1000 visitors</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-1 items-end text-[#0070CD]">
                        <Stethoscope size="17" className="z-20 border-2 border-t-0 border-l-0 border-r-0 border-red-500 border-solid" />
                        <p className="z-20 text-[14px]">{doctor.specialty}</p>
                    </div>
                    <div className="flex flex-row gap-1 items-end text-[#0070CD]">
                        <Wallet size="17" className="z-20 border-2 border-t-0 border-l-0 border-r-0 border-red-500 border-solid" />
                        <p className="z-20 text-[14px]">{doctor.fee}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {workDayItems}
            </div>
        </div>
    )
}