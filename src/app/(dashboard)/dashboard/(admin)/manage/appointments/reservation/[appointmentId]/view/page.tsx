import View from "@/app/_components/appointment/View";

export default async function ViewPage({ params: { appointmentId } }: { params: { appointmentId: number } }) {
    return (
        <View appointmentId={appointmentId} />
    )
}