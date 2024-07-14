import Prescription from "../Prescription";
import { getInfo } from "../funcs";



export default async function PrescriptionPage({ params: { appointmentId } }: { params: { appointmentId: string } }) {
    const info = await getInfo(appointmentId);

    return (
        <Prescription
            appointmentId={appointmentId}
            reservation={info.reservation}
            prescription={info.prescription}
            patient={info.patient}
            diagnosis={info.reservation.diagnosis}
            prescriptionType={'laboratory'}
        />
    )
}