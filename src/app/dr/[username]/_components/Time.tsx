'use client'

import { CalendarDays } from "lucide-react";
import { book } from "@/actions/appointment.actions";
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from "react";
import { AppointmentContext } from "@/context/appointment.context";
import { getDateByDayName } from "@/lib/funcs";
import { UserRoles } from "@/types/index.types";

export default function Time({ appointmentInfo, userId, role }: { appointmentInfo: any, userId: string, role: UserRoles }) {
    const router = useRouter()
    const context = useContext(AppointmentContext);

    const onSubmit = async (doctorId: number, date: string, from: string, to: string) => {
        const result = await book(userId, doctorId, date, from, to);
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

    return (
        <div className="relative">
            <div className="flex flex-col gap-4 bg-white rounded-md w-full h-fit py-4 px-4 fixed">
                <div className="flex flex-row gap-2 items-center"><CalendarDays color="#17A2B8" /> <span className="text-[15px] font-bold">Book an appointment</span></div>
                {appointmentInfo[0].workDays.map((day: any) => {
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var date = new Date();
                    var dayName = days[date.getDay()].toLowerCase();
                    return (
                        <div key={day.id} className="flex flex-row">
                            <div className="text-[14px] font-bold capitalize min-w-[90px]">
                                {day.day == dayName ? (
                                    <div className="flex flex-col gap-1">
                                        <p>today</p>
                                        <p>{date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/{date.getMonth() + 1}</p>
                                    </div>
                                )
                                    : (
                                        <div className="flex flex-col gap-1">
                                            <p>{day.day}</p>
                                            <p>{new Date(getDateByDayName(day.day)).getDate() < 10 ? `0${date.getDate()}` : new Date(getDateByDayName(day.day)).getDate()}/{date.getMonth() + 1}</p>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="grid grid-cols-3 gap-5">
                                {day.workHours.map((hour: any) => {
                                    return (
                                        <div className="flex flex-col gap-2">
                                            <div key={hour.id} className="
                                                flex flex-row gap-1 items-center cursor-pointer h-full border-2 border-[#17A2B8] px-5 py-2 rounded-md
                                                transition ease-in-out hover:shadow-2xl hover:bg-[#0099A8] hover:border-[#084F6D]"
                                                onClick={() => {
                                                    if (role == 'user') {
                                                        onSubmit(appointmentInfo[0].doctor.id, getDateByDayName(day.day), hour.from, hour.to)
                                                    } else {
                                                        alert('Must be a user role')
                                                    }
                                                }}
                                            >
                                                <p className="text-[14px] z-20">{hour.from} -</p>
                                                <p className="text-[14px] z-20">{hour.to}</p>
                                            </div>
                                        </div>
                                    )
                                }
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}