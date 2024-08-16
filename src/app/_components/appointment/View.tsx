import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { validateRequest } from "@/lib/auth"
import db from "@/lib/db"
import { appointmentTable, doctorTable, userMedicalFoldersTable, userTable } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import PatientInfo from "./PatientInfo"
import Diagnosis from "./Diagnosis"
import Prescriptions from "./Prescriptions"
import RatingModal from "@/components/ui/custom/RatingModal"
import { redirect } from "next/navigation"

const getInfo = async (appointmentId: number) => {
    const info = await db.query.appointmentTable.findFirst({
        with: {
            reservation: {
                with: {
                    prescription: true
                }
            },
            review: true
        },
        where: sql`${appointmentTable.id} = ${appointmentId}`
    })

    if (info == null) throw new Error('Failed to get appointment info');
    // if (info.status === 'completed') return redirect('/dashboard/appointments')

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

    return {
        patient,
        doctor,
        review: info.review,
        reservation: info.reservation,
        prescription: info.reservation?.prescription
    };
}

export default async function View({ appointmentId }: { appointmentId: number }) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized');
    const info = await getInfo(appointmentId);

    if (!info || !info.patient || !info.doctor) throw new Error('Failed to get appointment info');
    if (user && user.role == 'doctor') if (!user /* || user.id !== info?.doctor?.doctor.id */) throw new Error('Unauthorized');

    return (
        <>
            {!info.review && (
                <RatingModal user={user} appointmentId={appointmentId} doctorId={info.doctor.id} />
            )}
            <Tabs defaultValue={user && user.role != 'user' ? "info" : "diagnosis"} className="w-[100%]">
                <TabsList className="w-[100%]">
                    {user && user.role != 'user' && <TabsTrigger className="w-[100%]" value="info">Patient Info</TabsTrigger>}
                    <TabsTrigger className="w-[100%]" value="diagnosis">Diagnosis</TabsTrigger>
                    <TabsTrigger className="w-[100%]" value="prescriptions">Prescriptions</TabsTrigger>
                </TabsList>
                {user && user.role != 'user' && <TabsContent value="info"><PatientInfo patient={info.patient} folders={info.patient.folders} /></TabsContent>}
                <TabsContent value="diagnosis"><Diagnosis appointmentId={appointmentId} reservation={info.reservation} view={true} /></TabsContent>
                <TabsContent value="prescriptions"><Prescriptions reservation={info.reservation} prescriptions={info.prescription} /></TabsContent>
            </Tabs>
        </>
    )
}