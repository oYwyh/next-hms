'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/custom/FormField";
import { Form } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import DoctorCard from '@/app/_components/drCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { specialties } from '@/constants';
import { invalidateQueries } from '@/lib/funcs';
import { TDepartments, TReceiptTypes } from '@/types/index.types';

export interface IBookingData {
    doctorId: number;
    service: string;
    amount: string;
    date: string;
    from: string;
    to: string;
    department: TDepartments;
    receiptType: TReceiptTypes;
}

export default function Booking({ role, userId, setBookingData }: { role: 'receptionist' | 'user', userId?: string, setBookingData?: React.Dispatch<React.SetStateAction<IBookingData | undefined>> }) {
    const [specialty, setSpecialty] = useState<string>('all');
    const [selectDoctor, setSelectDoctor] = useState<string>('');
    const [doctors, setDoctors] = useState([]);
    const [doctorsList, setDoctorsList] = useState<[]>([]);
    const queryClient = useQueryClient();

    const { data: QdoctorsList, isLoading: isDoctorsListLoading } = useQuery({
        queryKey: ['doctors', 'list', specialty],
        queryFn: async () => {
            const response = await fetch(`/api/doctors/list/${specialty}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        }
    })

    const { data: Qdoctors, isLoading: isDoctorsLoading } = useQuery({
        queryKey: ['doctors', selectDoctor],
        queryFn: async () => {
            const response = await fetch(`/api/doctors?doctor=${selectDoctor}&specialty=${specialty}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        },
    })

    useEffect(() => {
        if (Qdoctors) {
            setDoctors(Qdoctors)
            return;
        }
    }, [Qdoctors])


    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user/info');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        }
    })

    useEffect(() => {
        if (QdoctorsList) {
            setDoctorsList(QdoctorsList)
            return;
        }
    }, [QdoctorsList])

    useEffect(() => {
        console.log(specialty)
        invalidateQueries({ queryClient, key: ['doctors', 'list', specialty] })
        form.resetField('doctor');
    }, [specialty])

    const form = useForm({
        defaultValues: {
            specialty: 'all',
            doctor: 'all'
        }
    })

    const onSubmit = async (data: any) => {
        setSelectDoctor(data.doctor);
        invalidateQueries({ queryClient, key: ['doctors', selectDoctor] })
    }

    const specialtyOpts = [
        { label: "All Speicalties", value: "all" },
        ...specialties,
    ]

    return (
        <div className='flex flex-col gap-2'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-row items-center gap-2 w-fit">
                        <FormField form={form} name="specialty" select="specialty" label='' specialties={specialtyOpts} setState={setSpecialty} />
                        {isDoctorsListLoading ? (
                            <>Loading...</>
                        ) : (
                            <>
                                <FormField form={form} name="doctor" select="doctors" doctors={doctorsList} />
                                <Button type="submit">Search</Button>
                            </>
                        )}
                    </div>
                </form>
            </Form>
            {isDoctorsLoading ? (
                <>Loading...</>
            ) : (
                <>
                    {user && (
                        <>
                            {doctors.length != 0 ? (doctors.map((doctor: any) => {
                                return (
                                    <>
                                        <DoctorCard
                                            key={doctor.user.id}
                                            doctor={doctor}
                                            userId={userId || user.id}
                                            role={role}
                                            setBookingData={setBookingData}
                                        />
                                    </>
                                )
                            })) : (
                                <p className='text-xl font-bold text-red-500'>No doctors found</p>
                            )}
                        </>
                    )
                    }
                </>
            )
            }
        </div >
    );
}