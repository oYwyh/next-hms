'use client'

import { Star, StarHalf, Stethoscope, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { book } from "../user.actions";
import { useRouter } from 'next/navigation'
import { useContext } from "react";
import { AppointmentContext } from "../context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

export default function DoctorCard({ doctor, userId }: { doctor: any, userId: string }) {
    const router = useRouter()
    const context = useContext(AppointmentContext);

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

    const onDrPage = async () => {
        const doctorUsername = doctor.user.username
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
                    <AvatarImage src={doctor.user.picture ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/${doctor.user.picture}` : 'default.jpg'} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col gap-4 ">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-0">
                        <div className="flex flex-row gap-1 items-baseline text-[#0070CD]">
                            <span className="text-[14px] z-20">Doctor</span>
                            <p className="text-[21px] z-20">{doctor.user.firsname} {doctor.user.lastname}</p>
                        </div>
                        <p className="text-sm text-[#87888B] min-w-[650px] z-20">Professor and Consultant  of {doctor.doctor.specialty} & Cardiovascular diseases  - AL Azhar university</p>
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
                        <p className="z-20 text-[14px]">{doctor.doctor.specialty}</p>
                    </div>
                    <div className="flex flex-row gap-1 items-end text-[#0070CD]">
                        <Wallet size="17" className="z-20 border-solid border-2 border-red-500 border-t-0 border-l-0 border-r-0" />
                        <p className="z-20 text-[14px]">Fees</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {/* <pre>{JSON.stringify(doctor, null, 2)}</pre> */}
                {doctor.workDays.map((day: any) => {
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
                                        <Button className="z-20" onClick={() => onSubmit(doctor.user.id, getDateByDayName(day.day), hour.from, hour.to)}>
                                            Book
                                        </Button>
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

/*
                {doctor.workDays.map((day: any) => {
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var date = new Date();
                    var dayName = days[date.getDay()].toLowerCase();

                    return (
                        <div key={day.id} className="flex flex-row">
                            <div className="text-[14px] font-bold capitalize min-w-[90px]">
                                {day.day == dayName ? (
                                    <div className="flex flex-col gap-1">
                                        <p className="z-20">today</p>
                                        <p className="z-20">{date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/{date.getMonth() + 1}</p>
                                    </div>
                                )
                                    : (
                                        <div className="flex flex-col gap-1 z-20">
                                            <p className="z-20">{day.day}</p>
                                            <p className="z-20">{new Date(getDateByDayName(day.day)).getDate() < 10 ? `0${date.getDate()}` : new Date(getDateByDayName(day.day)).getDate()}/{date.getMonth() + 1}</p>
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
                                                transition ease-in-out hover:shadow-2xl hover:bg-[#0099A8] hover:border-[#084F6D] z-20"
                                                onClick={() => onSubmit(doctor.user.id, getDateByDayName(day.day), hour.from, hour.to)}
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
*/