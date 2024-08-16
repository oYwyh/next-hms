'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { getAverageRating } from "@/lib/funcs";
import { TDoctor, TReview, TUser } from "@/types/index.types";
import { useEffect, useState } from "react";
import { Rating } from "react-simple-star-rating";

export default function Card({ user, doctor, reviews }: { user: TUser, doctor: TDoctor, reviews: any }) {
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (reviews.length > 0) {
            const avgRating = getAverageRating(reviews)
            setAverageRating(avgRating);
        }
    }, [reviews]);

    return (
        <div className="flex flex-row gap-4 bg-white rounded-md w-full py-4 px-4">
            <Avatar className="w-[130px] h-[130px]">
                <AvatarImage alt="Avatar" src={user.picture ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/${user.picture}` : 'default.jpg'} />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-3 justify-between text-[#808183]">
                <div className="flex flex-col gap-3">
                    <h1 className="capitalize text-2xl">{user.username}</h1>
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-500">Professor and Consultant of <strong className="capitalize">{doctor.specialty.replace(/_/g, ' ')}</strong> & Cardiovascular diseases - AL Azhar university</div>
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <Rating
                        readonly
                        SVGclassName='inline-block'
                        initialValue={averageRating}
                        allowFraction
                        size={30}
                    />
                    <p>Overall rating from {reviews.length} reviews</p>
                </div>
            </div >
        </div >
    )
}