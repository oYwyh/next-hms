'use client'

import FormField from "@/components/ui/custom/FormField";
import { Form } from "@/components/ui/form";
import { User } from "@/lib/types";
import { useForm } from "react-hook-form";

export function PatientInfo({ patient, folders, files }: { patient: any /* User */, folders: any, files: any }) {
    if (!patient) throw new Error('Failed to get patient info');
    const { firstname, lastname, username, email, phone, nationalId, age, gender } = patient
    const form = useForm()

    console.log(folders, files)

    return (
        <>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold">Patient Info</p>
                    <Form {...form}>
                        <form>
                            <div className="flex flex-col gap-3 w-[100%]">
                                <div className="flex flex-row justify-between gap-5">
                                    <FormField form={form} name="fullname" defaultValue={firstname + ' ' + lastname} disabled />
                                    <FormField form={form} name="email" defaultValue={email} disabled />
                                </div>
                                <div className="flex flex-row justify-between gap-5">
                                    <FormField form={form} name="phone" defaultValue={phone} disabled />
                                    <FormField form={form} name="nationalId" defaultValue={nationalId} disabled />
                                </div>
                                <div className="flex flex-row justify-between gap-5">
                                    <FormField form={form} name="age" defaultValue={age} disabled />
                                    <FormField form={form} name="gender" select="gender" defaultValue={gender} disabled />
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold">Patient Medical FIles</p>

                </div>
            </div>
        </>
    )
}