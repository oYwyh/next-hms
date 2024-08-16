'use client'

import FormField from "@/components/ui/custom/FormField";
import { Form, FormMessage } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { diagnosisSchema, TdiagnosisSchema } from "@/types/dashboard.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { useEffect, useState } from "react";
import { createReservation } from "@/actions/appointment.actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Lable";
import { laboratoriesList, medicinesList, radiologiesList } from "@/constants";
import { TReservation } from "@/types/index.types";

export default function Diagnosis({ appointmentId, view, reservation }: { appointmentId: number, view: boolean, reservation?: TReservation }) {
    const [selectedLaboratories, setSelectedLaboratories] = useState<string[]>([]);
    const [selectedRadiologies, setSelectedRadiologies] = useState<string[]>([]);
    const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
    const router = useRouter()

    useEffect(() => {
        if (reservation && view == true) {
            setSelectedLaboratories(reservation.laboratories.split(',') || []);
            setSelectedRadiologies(reservation.radiologies.split(',') || []);
            setSelectedMedicines(reservation.medicines.split(',') || []);
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
        const result = await createReservation({
            data,
            appointmentId: appointmentId,
            laboratories: selectedLaboratories,
            radiologies: selectedRadiologies,
            medicines: selectedMedicines
        });

        if (result && result.reserved) {
            if (selectedLaboratories.length > 0) {
                return router.push(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/laboratory`)
            }
            if (selectedRadiologies.length > 0) {
                return router.push(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/radiology`)
            }
            if (selectedMedicines.length > 0) {
                return router.push(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/medicine`)
            }
            return router.push('/dashboard/appointments');
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
                        {reservation && view && (
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 w-[100%] gap-3">
                                    {reservation.laboratories != '' && (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <Label>Laboratory</Label>
                                                <div className="flex flex-row gap-3">
                                                    {selectedLaboratories.map((laboratory: any) => (
                                                        <Badge>{laboratory}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {reservation.radiologies != '' && (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <Label>Radiology</Label>
                                                <div className="flex flex-row gap-3">
                                                    {selectedRadiologies.map((radiologies: any) => (
                                                        <Badge>{radiologies}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {reservation.medicines != '' && (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <Label>Medicine</Label>
                                            <div className="flex flex-row gap-3">
                                                {selectedMedicines.map((medicine: any) => (
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
                                            options={laboratoriesList}
                                            onValueChange={setSelectedLaboratories}
                                            defaultValue={selectedLaboratories}
                                            placeholder="Select Laboratories"
                                            variant="inverted"
                                            animation={2}
                                            maxCount={3}
                                            disabled={view}
                                            label="Select Laboratories"
                                        />
                                        <MultiSelect
                                            options={radiologiesList}
                                            onValueChange={setSelectedRadiologies}
                                            defaultValue={selectedRadiologies}
                                            placeholder="Select Radiologies"
                                            variant="inverted"
                                            animation={2}
                                            maxCount={3}
                                            disabled={view}
                                            label="Select Radiologies"
                                        />
                                    </div>
                                    <MultiSelect
                                        options={medicinesList}
                                        onValueChange={setSelectedMedicines}
                                        defaultValue={selectedMedicines}
                                        placeholder="Select Medicines"
                                        variant="inverted"
                                        animation={2}
                                        maxCount={3}
                                        disabled={view}
                                        label="Select Medicines"
                                    />
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