'use client'

import Image from "next/image";
import Img from '../../../../../public/dr.jpg'
import { Star, StarHalf, Stethoscope, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { book } from "../user.actions";
import { useRouter } from 'next/navigation'
import { useContext } from "react";
import { AppointmentContext } from "../context";

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


        if (context) {
            if (result?.reserved) {
                router.push('/user/reservation')
                context.setAppointmentId(result?.appointment?.id)
            } else {
                throw new Error('Failed to book appointment');
            }
        }

    }

    return (
        <div className="bg-white flex-row flex gap-8 py-5 px-5">
            <div>
                <Image src={Img} alt="doctor" className="rounded-full border-solid border-black border-2" width={100} height={100} />
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-0">
                        <div className="flex flex-row gap-1 items-baseline text-[#0070CD]">
                            <span className="text-[14px]">Doctor</span>
                            <p className="text-[21px]">{doctor.user.firsname} {doctor.user.lastname}</p>
                        </div>
                        <p className="text-sm text-[#87888B]">Professor and Consultant  of {doctor.doctor.specialty} & Cardiovascular diseases  - AL Azhar university</p>
                    </div>
                    <div className="flex flex-col gap-0">
                        <div className="flex flex-row gap-1">
                            <Star size='20' color="gold" fill="gold" />
                            <Star size='20' color="gold" fill="gold" />
                            <Star size='20' color="gold" fill="gold" />
                            <Star size='20' color="gold" fill="gold" />
                            <StarHalf size="20" color="gold" />
                        </div>
                        <p className="text-[12px] text-[#98989A]">Overall Rating From 1000 visitors</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-1 items-end text-[#0070CD]">
                        <Stethoscope size="17" className="border-solid border-2 border-red-500 border-t-0 border-l-0 border-r-0" />
                        <p className="text-[14px]">{doctor.doctor.specialty}</p>
                    </div>
                    <div className="flex flex-row gap-1 items-end text-[#0070CD]">
                        <Wallet size="17" className="border-solid border-2 border-red-500 border-t-0 border-l-0 border-r-0" />
                        <p className="text-[14px]">Fees</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {/* <pre>{JSON.stringify(doctor, null, 2)}</pre> */}
                {doctor.work_days.map((day: any) => {
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var date = new Date();
                    var dayName = days[date.getDay()].toLowerCase();

                    return (
                        <div key={day.id} className="flex flex-col gap-1">
                            <p className="text-[14px] font-bold capitalize">
                                {day.day == dayName ?
                                    `Today ${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${date.getMonth() + 1}`
                                    : `${day.day} ${new Date(getDateByDayName(day.day)).getDate() < 10 ? `0${date.getDate()}` : new Date(getDateByDayName(day.day)).getDate()}/${date.getMonth() + 1}`
                                }
                            </p>
                            {day.work_hours.map((hour: any) => {
                                return (
                                    <>
                                        <div key={hour.id} className="flex flex-row gap-1 items-center">
                                            <p className="text-[14px]">From: {hour.startAt}</p>
                                            <p className="text-[14px]">To: {hour.endAt}</p>
                                        </div>
                                        <Button onClick={() => onSubmit(doctor.user.id, getDateByDayName(day.day), hour.startAt, hour.endAt)}>
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