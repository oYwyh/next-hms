'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import FormField from "@/components/ui/custom/FormField";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import DoctorCard from '../_components/drCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import { stat } from 'fs';

export default function Book() {
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

    const { data: userId } = useQuery({
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

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-row gap-2 items-center">
                        <FormField form={form} name="specialty" select="specialty" setState={setSpecialty} />
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
                    {userId && (
                        <>
                            {doctors.length != 0 ? (doctors.map((doctor: any) => {
                                return <DoctorCard key={doctor.user.id} doctor={doctor} userId={userId.id} />
                            })) : (
                                <p className='text-red-500 font-bold text-xl'>No doctors found</p>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
}