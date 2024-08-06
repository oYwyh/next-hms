'use client'

import { Star, StarHalf, Stethoscope, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { book } from "@/actions/appointment.actions";
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from "react";
import { AppointmentContext } from "@/context/appointment.context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { getDateByDayName } from "@/lib/funcs";
import Add from "@/app/dashboard/_components/admin/Add";
import { TDoctor, TUser, TWorkDay } from "@/types/index.types";

export default function DoctorCard({ doctor: { user, doctor, workDays }, userId }: { doctor: { user: TUser, doctor: TDoctor, workDays: TWorkDay[] }, userId?: string }) {
    const router = useRouter()
    const context = useContext(AppointmentContext);

    const onSubmit = async (doctorId: number, date: string, from: string, to: string) => {
        if (userId) {

            const result = await book({ userId, doctorId, date, from, to });
            console.log("Booking result:", result);

            if (context) {
                if (result?.reserved) {
                    context.setAppointmentId(result?.appointment?.id);
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

    return (
        <div
            className="relative  bg-white flex-row flex gap-8 py-5 mt-5 px-5 rounded-md w-fit"
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
                        <div className="flex flex-row gap-1 z-20">
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
                        <Stethoscope size="17" className="z-20 border-solid border-2 border-red-500 border-t-0 border-l-0 border-r-0" />
                        <p className="z-20 text-[14px]">{doctor.specialty}</p>
                    </div>
                    <div className="flex flex-row gap-1 items-end text-[#0070CD]">
                        <Wallet size="17" className="z-20 border-solid border-2 border-red-500 border-t-0 border-l-0 border-r-0" />
                        <p className="z-20 text-[14px]">Fees</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {/* <pre>{JSON.stringify(doctor, null, 2)}</pre> */}
                {workDays.map((day: any) => {
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var date = new Date();
                    var dayName = days[date.getDay()].toLowerCase();

                    return (
                        <div key={day.id} className="flex flex-col gap-1">
                            <p className="text-[14px] font-bold capitalize z-20">
                                {day.day == dayName ?
                                    `Today ${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${date.getMonth() + 1}`
                                    : `${day.day} ${new Date(getDateByDayName(day.day)).getDate() < 10 ? `0${date.getDate()}` : new Date(getDateByDayName(day.day)).getDate()}/${date.getMonth() + 1}`
                                }
                            </p>
                            {day.workHours.map((hour: any) => {
                                return (
                                    <>
                                        <div key={hour.id} className="flex flex-row gap-1 items-center z-20">
                                            <p className="text-[14px] z-20">From: {hour.from}</p>
                                            <p className="text-[14px] z-20">To: {hour.to}</p>
                                        </div>
                                        {userId ? (
                                            <Button className="z-20" onClick={() => onSubmit(doctor.id, getDateByDayName(day.day), hour.from, hour.to)}>
                                                Book
                                            </Button>
                                        ) : (
                                            <div className="z-20">
                                                <Add role={'user'}
                                                />
                                            </div>
                                        )}
                                    </>
                                )
                            }
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}