'use client'

import FormField from "@/components/ui/custom/FormField";
import { Form, FormMessage } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { diagnosisSchema, TdiagnosisSchema } from "@/app/(dashboard)/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { useEffect, useState } from "react";
import { createReservation } from "@/app/(dashboard)/_actions/appointment.actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Lable";

const laboratoryList = [
    { value: "laboratory1", label: "Laboratory 1" },
    { value: "laboratory2", label: "Laboratory 2" },
    { value: "laboratory3", label: "Laboratory 3" },
    { value: "laboratory4", label: "Laboratory 4" },
    { value: "laboratory5", label: "Laboratory 5" },
    { value: "laboratory6", label: "Laboratory 6" },
    { value: "laboratory7", label: "Laboratory 7" },
]

export default function Diagnosis({ appointmentId, view, reservation }: { appointmentId: string | number, view: boolean, reservation?: any }) {
    const [selectedLaboratory, setSelectedLaboratory] = useState<string[]>([]);
    const [selectedRadiology, setSelectedRadiology] = useState<string[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [laboratories, setLaboratories] = useState<any[]>([]);
    const [radiologies, setRadiologies] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const router = useRouter()

    useEffect(() => {
        if (view == true) {
            setLaboratories(reservation?.laboratory.split(',') || []);
            setRadiologies(reservation?.radiology.split(',') || []);
            setMedicines(reservation?.medicine.split(',') || []);
        }
    }, [view])

    const form = useForm<TdiagnosisSchema>({
        resolver: zodResolver(diagnosisSchema),
        defaultValues: {
            history: reservation ? reservation.history : '',
            diagnosis: reservation ? reservation.diagnosis : '',
        }
    })

    const onSubmit = async (data: TdiagnosisSchema) => {
        const result = await createReservation(Number(appointmentId), data, selectedLaboratory, selectedRadiology, selectedMedicine);

        if (result && result.reserved) {
            if (selectedLaboratory.length > 0) {
                return router.push(`/doctor/appointments/reservation/${appointmentId}/prescriptions/laboratory`)
            }
            if (selectedRadiology.length > 0) {
                return router.push(`/doctor/appointments/reservation/${appointmentId}/prescriptions/radiology`)
            }
            if (selectedMedicine.length > 0) {
                return router.push(`/doctor/appointments/reservation/${appointmentId}/prescriptions/medicine`)
            }
            return router.push('/doctor/appointments');
        }
    }

    return (
        <>
            <div className="flex flex-col gap-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <FormField form={form} name="history" disabled={view} isTextarea={true} placeholder="Enter Patient History" />
                            <FormField form={form} name="diagnosis" disabled={view} isTextarea={true} placeholder="Enter Patient Diagnosis" />
                        </div>
                        {view && (
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 w-[100%] gap-3">
                                    {reservation.laboratory != '' && (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <Label>Laboratory</Label>
                                                <div className="flex flex-row gap-3">
                                                    {laboratories.map((laboratory: any) => (
                                                        <Badge>{laboratory}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {reservation.radiology != '' && (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <Label>Radiology</Label>
                                                <div className="flex flex-row gap-3">
                                                    {laboratories.map((radiologies: any) => (
                                                        <Badge>{radiologies}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {reservation.medicine != '' && (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <Label>Medicine</Label>
                                            <div className="flex flex-row gap-3">
                                                {medicines.map((medicine: any) => (
                                                    <Badge>{medicine}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {!view && (
                            <>
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 w-[100%] gap-3">
                                        <MultiSelect
                                            className="w-[100%]"
                                            options={laboratoryList}
                                            onValueChange={setSelectedLaboratory}
                                            defaultValue={selectedLaboratory}
                                            placeholder="Select Laboratories"
                                            variant="inverted"
                                            animation={2}
                                            maxCount={3}
                                            disabled={view}
                                            label="Select Laboratories"
                                        />
                                        <MultiSelect
                                            options={laboratoryList}
                                            onValueChange={setSelectedRadiology}
                                            defaultValue={selectedRadiology}
                                            placeholder="Select Radiologies"
                                            variant="inverted"
                                            animation={2}
                                            maxCount={3}
                                            disabled={view}
                                            label="Select Radiologies"
                                        />
                                    </div>
                                    <MultiSelect
                                        options={laboratoryList}
                                        onValueChange={setSelectedMedicine}
                                        defaultValue={selectedMedicine}
                                        placeholder="Select Medicines"
                                        variant="inverted"
                                        animation={2}
                                        maxCount={3}
                                        disabled={view}
                                        label="Select Medicines"
                                    />
                                    {error && <FormMessage>{error}</FormMessage>}
                                </div>
                            </>
                        )}
                        {!view && (
                            <Button type="submit">Submit</Button>
                        )}
                    </form>
                </Form>
            </div >
        </>
    )
}