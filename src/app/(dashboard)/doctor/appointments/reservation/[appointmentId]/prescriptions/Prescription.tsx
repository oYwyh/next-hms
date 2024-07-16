'use client'


import * as htmlToImage from 'html-to-image';
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Textarea } from "@/components/ui/Textarea";
import { User } from "@/lib/types";
import { useEffect, useState } from "react";
import { createPrescription } from '@/app/(dashboard)/doctor/doctor.actions';
import { useRouter } from 'next/navigation';
import { getSignUrl } from '@/lib/r2';
import { revalidatePath } from 'next/cache';

type TReservation = {
    id: string;
    [key: string]: any;
}

export default function Prescription(
    {
        appointmentId,
        reservation,
        prescription,
        patient,
        diagnosis,
        prescriptionType
    }:
        {
            appointmentId: string | number
            reservation: any,
            prescription: any,
            patient: any /* User */,
            diagnosis: string
            prescriptionType: 'laboratory' | 'radiology' | 'medicine'
        }
) {
    const [values, setValues] = useState<string[]>(reservation[prescriptionType].split(','));
    const [textareaValue, setTextareaValue] = useState<string>(reservation[prescriptionType].split(',').join('\n'));
    const [prescriptionTypes] = useState(['laboratory', 'radiology', 'medicine']);
    const [existingPrescriptionTypes, setExistingPrescriptionTypes] = useState<string[]>([]);
    const [clicked, setClicked] = useState<boolean>(false);
    const router = useRouter()

    useEffect(() => {
        const prescriptionTypesKeys = Object.keys(reservation).filter(key => prescriptionTypes.includes(key) && key !== prescriptionType);
        const newExists = prescriptionTypesKeys
            .filter((item) => {
                const reservationHasValue = reservation[item] && reservation[item].trim() !== '';
                const prescriptionHasValue = prescription[item] && prescription[item].trim() !== ''

                // Keep the item if it has a value in reservation but not in prescription
                // Remove the item if it has a value in both reservation and prescription
                // Remove the item if it doesn't have a value in either reservation or prescription
                return reservationHasValue && !prescriptionHasValue;
            })
            .map(item => item);

        setExistingPrescriptionTypes(newExists);
    }, [reservation, prescription, prescriptionTypes]);


    useEffect(() => {
        if (existingPrescriptionTypes.length > 0) {
            console.log(existingPrescriptionTypes)
        }
    }, [existingPrescriptionTypes]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextareaValue(e.target.value);
    };

    const handleSaveClick = async () => {
        const lines = textareaValue.split('\n').filter(line => line.trim() !== '');
        setValues(lines);
    };

    const handleConvertToImageThenSave = async () => {

    };


    const handleSubmit = async () => {
        const element = document.getElementById('test'); // Replace with your div id
        const scale = 2; // Adjust the scale factor as needed (2 means 2x the original resolution)

        if (!element) return;
        const dataUrl = await htmlToImage.toBlob(element, { pixelRatio: scale })
            .catch((error) => {
                console.error('Error converting div to image:', error);
            });

        if (!dataUrl) return;

        const signedUrlResult = await getSignUrl('prescription.png', 'image/png', dataUrl.size);

        const { url, fileName } = signedUrlResult.success;

        let result;
        if (existingPrescriptionTypes.length === 0) {
            result = await createPrescription(appointmentId, reservation.id, fileName, prescriptionType, true)
        } else {
            result = await createPrescription(appointmentId, reservation.id, fileName, prescriptionType, false)
        }
        await handleConvertToImageThenSave()

        if (result && result.done) {
            // Upload to S3
            await fetch(url, {
                method: 'PUT',
                body: dataUrl,
                headers: {
                    'Content-Type': 'image/png',
                }
            });
            setClicked(true)
            setExistingPrescriptionTypes((prevTypes) => {
                const updatedTypes = prevTypes.filter((type) => type !== prescriptionType);
                return updatedTypes;
            });
        }
    }

    // Add this useEffect hook to handle redirection
    useEffect(() => {
        if (existingPrescriptionTypes && clicked) {
            if (existingPrescriptionTypes.length === 0) {
                router.push('/doctor/appointments');
            } else if (existingPrescriptionTypes.includes('laboratory')) {
                router.push(`/doctor/appointments/reservation/${appointmentId}/prescriptions/laboratory`);
            } else if (existingPrescriptionTypes.includes('radiology')) {
                router.push(`/doctor/appointments/reservation/${appointmentId}/prescriptions/radiology`);
            } else if (existingPrescriptionTypes.includes('medicine')) {
                router.push(`/doctor/appointments/reservation/${appointmentId}/prescriptions/medicine`);
            }
        }
    }, [existingPrescriptionTypes, clicked]);


    return (
        <div className='flex flex-col gap-5'>
            <div className="grid grid-cols-2 gap-3 justify-between py-3 mx-3">
                <div id='test' className="bg-white h-[100%] min-w-[500px] max-w-[500px] m-auto py-2 px-5 rounded-sm">
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