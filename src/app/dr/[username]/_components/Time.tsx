'use client'

import { CalendarDays } from "lucide-react";
import { book } from "@/actions/appointment.actions";
import { useRouter } from 'next/navigation';
import { useContext, useMemo } from "react";
import { getDateByDayName } from "@/lib/funcs";
import { UserRoles, TWorkDay, TWorkHour } from "@/types/index.types";
import { ReservationContext } from "@/context/reservation.context";

interface TimeProps {
    appointmentInfo: any[];
    userId: string;
    role: UserRoles;
}

export default function Time({ appointmentInfo, userId, role }: TimeProps) {
    const router = useRouter();
    const context = useContext(ReservationContext);

    const days = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);

    const onSubmit = async (doctorId: number, date: string, from: string, to: string) => {
        try {
            const result = await book({ userId, doctorId, date, from, to });
            console.log("Booking result:", result);

            if (context && result?.reserved) {
                context.setReservation({ appointmentId: result.appointment.id });
                router.push('/reservation');
            } else {
                throw new Error('Failed to book appointment');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while booking the appointment.');
        }
    };

    const currentDayName = days[new Date().getDay()].toLowerCase();
    const currentDateString = (date: Date) => `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${date.getMonth() + 1}`;

    return (
        <div className="relative">
            <div className="flex flex-col gap-4 bg-white rounded-md w-full h-fit py-4 px-4 fixed">
                <div className="flex flex-row gap-2 items-center">
                    <CalendarDays color="#17A2B8" />
                    <span className="text-[15px] font-bold">Book an appointment</span>
                </div>
                {appointmentInfo[0].workDays.map((day: TWorkDay) => (
                    <div key={day.id} className="flex flex-row gap-4">
                        <div className="text-[14px] font-bold capitalize min-w-[90px]">
                            <div className="flex flex-col gap-1">
                                <p>{day.day === currentDayName ? 'Today' : day.day}</p>
                                <p>{currentDateString(day.day === currentDayName ? new Date() : new Date(getDateByDayName(day.day)))}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-5">
                            {day.workHours.map((hour: TWorkHour) => (
                                <div key={hour.id} className="flex flex-col gap-2">
                                    <div
                                        className="flex flex-row gap-1 items-center cursor-pointer h-full border-2 border-[#17A2B8] px-5 py-2 rounded-md transition ease-in-out hover:shadow-2xl hover:bg-[#0099A8] hover:border-[#084F6D]"
                                        onClick={() => {
                                            if (role === 'user') {
                                                onSubmit(appointmentInfo[0].doctor.id, getDateByDayName(day.day), hour.from, hour.to);
                                            } else {
                                                alert('You must be a user to book an appointment.');
                                            }
                                        }}
                                    >
                                        <p className="text-[14px] z-20">{hour.from} - {hour.to}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
