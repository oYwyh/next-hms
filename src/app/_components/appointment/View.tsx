import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { validateRequest } from "@/lib/auth"
import db from "@/lib/db"
import { appointmentTable, doctorTable, userMedicalFoldersTable, userTable } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import PatientInfo from "./PatientInfo"
import Diagnosis from "./Diagnosis"
import Prescriptions from "./Prescriptions"
import RatingModal from "../RatingModal"

const getInfo = async (appointmentId: number) => {
    const info = await db.query.appointmentTable.findFirst({
        columns: {
            userId: true,
            doctorId: true,
            status: true
        },
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

    const patient = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${info?.userId}`
    })

    const [doctor] = await db.select().from(userTable).where(sql`${userTable.id} = ${info?.doctorId}`)
        .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))

    const folders = await db.query.userMedicalFoldersTable.findMany({
        with: {
            files: true
        },
        where: sql`${userMedicalFoldersTable.userId} = ${info?.userId}`,
    })


    if (!patient || !doctor) throw new Error('Failed to get appointment info');
    return {
        patient,
        doctor,
        folders,
        review: info.review,
        reservation: info.reservation,
        prescription: info.reservation?.prescription
    };
}

export default async function View({ appointmentId }: { appointmentId: number }) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized');
    const info = await getInfo(appointmentId);

    if (!info || !info.doctor.doctor) throw new Error('Failed to get appointment info');
    if (user && user.role == 'doctor') if (!user /* || user.id !== info?.doctor?.doctor.id */) throw new Error('Unauthorized');

    return (
        <>
            {!info.review && (
                <RatingModal user={user} appointmentId={appointmentId} doctorId={info.doctor.doctor.id} />
            )}
            <Tabs defaultValue={user && user.role != 'user' ? "info" : "diagnosis"} className="w-[100%]">
                <TabsList className="w-[100%]">
                    {user && user.role != 'user' && <TabsTrigger className="w-[100%]" value="info">Patient Info</TabsTrigger>}
                    <TabsTrigger className="w-[100%]" value="diagnosis">Diagnosis</TabsTrigger>
                    <TabsTrigger className="w-[100%]" value="prescriptions">Prescriptions</TabsTrigger>
                </TabsList>
                {user && user.role != 'user' && <TabsContent value="info"><PatientInfo patient={info.patient} folders={info.folders} /></TabsContent>}
                <TabsContent value="diagnosis"><Diagnosis appointmentId={appointmentId} reservation={info.reservation} view={true} /></TabsContent>
                <TabsContent value="prescriptions"><Prescriptions reservation={info.reservation} prescriptions={info.prescription} /></TabsContent>
            </Tabs>
        </>
    )
}