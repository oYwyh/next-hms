import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { validateRequest } from "@/lib/auth"
import db from "@/lib/db"
import { appointmentTable, userTable } from "@/lib/db/schema"
import { sql } from "drizzle-orm"
import { redirect } from "next/navigation"
import { PatientInfo } from "./PatientInfo"
import { Diagnosis } from "./Diagnosis"
import Prescriptions from "./Prescriptions"

const getInfo = async (appointmentId: string | number) => {
    const info = await db.query.appointmentTable.findFirst({
        columns: {
            user_id: true,
            doctor_id: true,
            status: true
        },
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

    const patient = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${info?.user_id}`
    })

    const doctor = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${info?.doctor_id}`
    })

    if (!patient || !doctor) throw new Error('Failed to get appointment info');
    return {
        patient,
        doctor,
        reservation: info.reservation,
        prescription: info.reservation?.prescription
    };
}

export default async function View({ appointmentId }: { appointmentId: string | number }) {
    const { user } = await validateRequest()
    const info = await getInfo(appointmentId);

    if (user && user.role == 'doctor') if (!user || user.id !== info?.doctor?.id) throw new Error('Unauthorized');
    if (!info) throw new Error('Failed to get appointment info');

    return (
        <Tabs defaultValue="info" className="w-[100%]">
            <TabsList className="w-[100%]">
                <TabsTrigger className="w-[100%]" value="info">Patient Info</TabsTrigger>
                <TabsTrigger className="w-[100%]" value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger className="w-[100%]" value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="info"><PatientInfo patient={info.patient} /></TabsContent>
            <TabsContent value="diagnosis"><Diagnosis appointmentId={appointmentId} reservation={info.reservation} view={true} /></TabsContent>
            <TabsContent value="prescriptions"><Prescriptions reservation={info.reservation} prescriptions={info.prescription} /></TabsContent>
        </Tabs>
    )
}