import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { validateRequest } from "@/lib/auth"
import db from "@/lib/db"
import { appointmentTable, doctorTable, userMedicalFilesTable, userMedicalFoldersTable, userTable } from "@/lib/db/schema"
import { sql } from "drizzle-orm"
import PatientInfo from "@/app/_components/appointment/PatientInfo"
import Diagnosis from "@/app/_components/appointment/Diagnosis"
import { redirect } from "next/navigation"
import { TAppointment } from "@/types/index.types"

const getInfo = async (appointmentId: string | number) => {
    const info = await db.query.appointmentTable.findFirst({
        with: {
            reservation: {
                with: {
                    prescription: true
                }
            }
        },
        where: sql`${appointmentTable.id} = ${appointmentId}`
    })

    if (info == null) throw new Error('Failed to get appointment info');
    if (info.status === 'completed') return redirect('/dashboard/appointments')

    const patient = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${info?.userId}`,
        with: {
            folders: {
                with: {
                    files: true
                }
            }
        }
    })

    const doctor = await db.query.doctorTable.findFirst({
        where: sql`${doctorTable.id} = ${info?.doctorId}`
    })


    // if (info.reservation, info.reservation?.prescription) {
    //     const prescriptionTypes = ['laboratory', 'radiology', 'medicine'];
    //     const prescriptionTypesKeys = Object.keys(info.reservation).filter(key => prescriptionTypes.includes(key));

    //     // Check if any prescription type has a value in reservation but not in prescription
    //     for (const type of prescriptionTypesKeys) {
    //         const reservationHasValue = info.reservation[type] && info.reservation[type].trim() !== '';
    //         const prescriptionHasValue = info.reservation?.prescription && info.reservation?.prescription[type] && info.reservation?.prescription[type].trim() !== '';

    //         if (reservationHasValue && !prescriptionHasValue) {
    //             // Redirect based on the type
    //             if (type === 'laboratory') {
    //                 redirect(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/laboratory`);
    //             } else if (type === 'radiology') {
    //                 redirect(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/radiology`);
    //             } else if (type === 'medicine') {
    //                 redirect(`/dashboard/appointments/reservation/${appointmentId}/prescriptions/medicine`);
    //             }
    //         }
    //     }
    // }

    if (!patient || !doctor) throw new Error('Failed to get appointment info');
    return {
        patient,
        doctor,
        reservation: info.reservation,
        prescription: info.reservation?.prescription
    };
}

export default async function StartPage({ params: { appointmentId } }: { params: { appointmentId: number } }) {
    const { user } = await validateRequest()
    const info = await getInfo(appointmentId);

    if (!user || user.id !== info?.doctor?.userId) throw new Error('Unauthorized');
    if (!info) throw new Error('Failed to get appointment info');

    return (
        <Tabs defaultValue="info" className="w-[100%]">
            <TabsList className="w-[100%]">
                <TabsTrigger className="w-[100%]" value="info">Patient Info</TabsTrigger>
                <TabsTrigger className="w-[100%]" value="diagnosis">Diagnosis</TabsTrigger>
            </TabsList>
            <TabsContent value="info"><PatientInfo patient={info.patient} folders={info.patient.folders} /></TabsContent>
            <TabsContent value="diagnosis"><Diagnosis appointmentId={appointmentId} view={false} /></TabsContent>
        </Tabs>
    )
}