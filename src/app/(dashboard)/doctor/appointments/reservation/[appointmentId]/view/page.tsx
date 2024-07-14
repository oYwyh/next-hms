import View from "@/app/(dashboard)/_components/View";

export default async function ViewPage({ params: { appointmentId } }: { params: { appointmentId: string } }) {
    return (
        <View appointmentId={appointmentId} />
    )
}