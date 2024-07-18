'use client'

import { AppointmentContext } from "@/app/(user)/context";
import { book } from "@/app/(user)/user.actions";
import { Button } from "@/components/ui/Button";
import db from "@/lib/db";
import { doctorTable, userTable, workDaysTable, workHoursTable } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";

export default function Time({ appointmentInfo, userId }: { appointmentInfo: any, userId: string }) {
    const router = useRouter()
    const context = useContext(AppointmentContext);

    function formatTime(timeString: string) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }

    function getDateByDayName(dayName: string) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'faturday'];
        const today = new Date();
        const currentDay = today.getDay();
        const targetDay = days.indexOf(dayName);
        let diff = targetDay - currentDay;

        if (diff <= 0) {
            diff += 7;
        }

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const onSubmit = async (doctorId: string, date: string, from: string, to: string) => {
        console.log(doctorId, date, from, to)
        const result = await book(userId, doctorId, date, from, to);

        console.log(context)


        if (context) {
            if (result?.reserved) {
                router.push('/reservation')
                context.setAppointmentId(result?.appointment?.id)
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
                                                onClick={() => onSubmit(appointmentInfo[0].user.id, getDateByDayName(day.day), hour.from, hour.to)}
                                            >
                                                <p className="text-[14px] z-20">{formatTime(hour.from)} -</p>
                                                <p className="text-[14px] z-20">{formatTime(hour.to)}</p>
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