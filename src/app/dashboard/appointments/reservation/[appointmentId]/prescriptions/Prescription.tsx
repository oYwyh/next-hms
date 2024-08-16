'use client'

import * as htmlToImage from 'html-to-image';
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Textarea } from "@/components/ui/Textarea";
import { TPrescriptions, TUser } from "@/types/index.types";
import { useEffect, useState } from "react";
import { createPrescription } from '@/actions/appointment.actions';
import { useRouter } from 'next/navigation';
import { getSignUrl } from '@/lib/r2';
import { revalidatePath } from 'next/cache';
import { prescriptions } from '@/constants';

interface IReservation {
    laboratories: string;
    radiologies: string;
    medicines: string;
    [key: string]: string;  // Allow dynamic key access
}

export default function Prescription(
    {
        appointmentId,
        reservation,
        prescription,
        patient,
        diagnosis,
        existingPrescriptions,
        prescriptionType
    }:
        {
            appointmentId: string | number
            reservation: any,
            prescription: any,
            patient: any,
            diagnosis: string,
            existingPrescriptions: string[],
            prescriptionType: TPrescriptions
        }
) {
    const presecriptionMap = {
        laboratory: 'laboratories',
        radiology: 'radiologies',
        medicine: 'medicines'
    };

    // Access the appropriate field in the reservation object
    const selectedField = presecriptionMap[prescriptionType];
    const [values, setValues] = useState<string[]>(reservation[selectedField].split(','));
    const [textareaValue, setTextareaValue] = useState<string>(reservation[selectedField].split(',').join('\n'));
    const [clicked, setClicked] = useState<boolean>(false);
    const router = useRouter()

    useEffect(() => {
        existingPrescriptions = existingPrescriptions.filter(prescription => prescription !== prescriptionType);
    }, [existingPrescriptions])

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextareaValue(e.target.value);
    };

    const handleSaveClick = async () => {
        const lines = textareaValue.split('\n').filter(line => line.trim() !== '');
        setValues(lines);
    };

    const handleSubmit = async () => {
        const element = document.getElementById('prescription'); // Replace with your div id
        const scale = 2; // Adjust the scale factor as needed (2 means 2x the original resolution)

        if (!element) return;
        const dataUrl = await htmlToImage.toBlob(element, { pixelRatio: scale })
            .catch((error) => {
                console.error('Error converting div to image:', error);
            });

        if (!dataUrl) return;

        const signedUrlResult = await getSignUrl({
            key: 'prescription',
            type: 'image/jpg',
            size: dataUrl.size
        });

        const { url, fileName } = signedUrlResult.success;

        let result;
        if (existingPrescriptions.length === 0) {
            result = await createPrescription({
                appointmentId,
                reservationId: reservation.id,
                name: fileName,
                type: prescriptionType,
                last: true
            })
        } else {
            result = await createPrescription({
                appointmentId,
                reservationId: reservation.id,
                name: fileName,
                type: prescriptionType,
                last: false
            })
        }

        if (result && result.done) {
            // Upload to S3
            await fetch(url, {
                method: 'PUT',
                body: dataUrl,
                headers: {
                    'Content-Type': 'image/jpg',
                }
            });

            setClicked(true)
        }
    }

    // Add this useEffect hook to handle redirection
    useEffect(() => {
        if (existingPrescriptions && clicked) {
            if (existingPrescriptions.length === 0) {
                router.push('/dashboard/appointments');
            } else if (existingPrescriptions.includes('laboratory')) {
                router.push(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/laboratory`);
            } else if (existingPrescriptions.includes('radiology')) {
                router.push(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/radiology`);
            } else if (existingPrescriptions.includes('medicine')) {
                router.push(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/medicine`);
            }
        }
    }, [existingPrescriptions, clicked]);


    return (
        <div className='flex flex-col gap-5'>
            <div className="grid grid-cols-2 gap-3 justify-between py-3 mx-3">
                <div id='prescription' className="bg-white h-[100%] min-w-[500px] max-w-[500px] m-auto py-2 px-5 rounded-sm">
                    <div className="flex flex-row justify-between gap-3">
                        <div className="flex flex-col">
                            <p>Name: {patient.firstname + ' ' + patient.lastname}</p>
                            <p>Email: {patient.age}</p>
                        </div>
                        <div className="flex flex-col">
                            <p>Diagnosis: {diagnosis}</p>
                            <p>Age: {patient.age}</p>
                        </div>
                    </div>
                    <Separator className="my-3" />
                    <div>
                        {values.map((value, index) => {
                            return <p key={index}>- {value}</p>
                        })}
                    </div>
                </div>
                <div className="flex flex-col">
                    <Textarea name="laboratory" value={textareaValue} onChange={handleTextareaChange} />
                    <Button onClick={handleSaveClick}>Save</Button>
                </div>
            </div>
            <Button onClick={handleSubmit}>
                Continue
            </Button>
        </div>
    )
}