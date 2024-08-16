import Reservation from "@/app/_components/Reservation";
import Receipt from "@/app/_components/Receipt";

export default function ReservationPage() {
    return (
        <div className="flex justify-center items-center h-screen p-5">
            <div className="container flex flex-col gap-10">
                <Reservation />
                <Receipt />
            </div>
        </div>
    )
}