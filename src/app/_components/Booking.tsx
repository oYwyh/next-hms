'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/custom/FormField";
import { Form } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import DoctorCard from '@/app/_components/appointment/drCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Booking() {
    const [specialty, setSpecialty] = useState<string>('all');
    const [selectDoctor, setSelectDoctor] = useState<string>('');
    const [doctors, setDoctors] = useState([]);
    const [doctorsList, setDoctorsList] = useState<[]>([]);
    const queryClient = useQueryClient();

    const { data: QdoctorsList, isLoading: isDoctorListLoading } = useQuery({
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
        queryKey: ['user', 'id'],
        queryFn: async () => {
            const response = await fetch('/api/global/user');
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
        queryClient.invalidateQueries({ queryKey: ['doctors', 'list', specialty] })
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
        queryClient.invalidateQueries({ queryKey: ['doctors', selectDoctor] })
    }

    const specialtyOpts = [
        { label: "All Speicalties", value: "all" },
        { label: "General Surgery", value: "general_surgery" },
        { label: "Podo", value: "podo" },
        { label: "Orthopedics", value: "orthopedics" },
    ]

    return (
        <div className='flex flex-col gap-2'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-row gap-2 items-center w-fit">
                        <FormField form={form} name="specialty" select="specialty" specialties={specialtyOpts} setState={setSpecialty} />
                        {isDoctorListLoading ? (
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
                                    <DoctorCard key={doctor.user.id} doctor={doctor} userId={user.role == 'user' ? user.id : null} />
                                )
                            })) : (
                                <p className='text-red-500 font-bold text-xl'>No doctors found</p>
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