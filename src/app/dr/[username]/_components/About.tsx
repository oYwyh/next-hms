import { TDoctor } from "@/types/index.types";
import { Info } from "lucide-react";

export default function About({ doctor }: { doctor: TDoctor }) {
    return (
        <div className="flex flex-col gap-4 bg-white rounded-md py-4 px-4 w-full">
            <div className="flex flex-row gap-2 items-center"><Info color="#661D6E" /> <span className="text-[15px] font-bold text-[#6D6E7A]">About The Doctor</span></div>
            <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-600 capitalize">{doctor.specialty.replace(/_/g, ' ')}</div>
            </div>
        </div>
    )
}