'use client'

import { TReview, TUser } from "@/types/index.types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react"
import { useEffect, useState } from "react";
import { useInView } from 'react-intersection-observer';
import { Rating } from "react-simple-star-rating";

export default function Reviews({ doctor, reviews: reviewsForRating }: { doctor: any, reviews: any }) {
    const [averageRating, setAverageRating] = useState(0);

    const fetchReviews = async ({ pageParam = 1 }) => {
        const response = await fetch(`/api/dr/${doctor.id}/reviews?pageParam=${pageParam}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    };


    const {
        data: reviews,
        isLoading,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['reviews', doctor.id],
        queryFn: fetchReviews,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    })

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView]);

    useEffect(() => {
        if (reviews) {
            const totalRating = reviewsForRating.reduce((sum: any, { review }: { review: any }) => {
                return sum + parseFloat(review.rating);
            }, 0);
            const avgRating = totalRating / reviewsForRating.length;
            setAverageRating(avgRating);
        }
    }, [reviews]);

    if (isLoading) return <div>Loading...</div>

    return (
        <>
            {reviews && (
                <div className="flex flex-col gap-4 bg-white rounded-md w-full py-4 px-4">
                    <div className="flex flex-row gap-2 items-center"><Star color="gold" fill="gold" /> <span className="text-[15px] font-bold text-[#6D6E7A]">Patients' Reviews</span></div>
                    <div className="flex flex-col gap-2 items-center">
                        <Rating
                            readonly
                            SVGclassName='inline-block'
                            initialValue={averageRating}
                            allowFraction
                            size={30}
                        />
                        <p className='text-gray-500 text-sm'>Overall rating</p>
                        <p className='text-gray-500 text-sm'>from {reviewsForRating.length} reviews</p>
                    </div>
                    <div className="">
                        {reviews?.pages.map((page: any) => (
                            <>
                                < div key={page.currentPage} className="flex flex-col gap-4 bg-white rounded-md w-full py-4 px-4" >
                                    {
                                        page.data.map(({ review, user }: { review: TReview, user: TUser }) => (
                                            <div key={review.id} className="flex flex-col border p-4 rounded-md">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <img src={user.picture ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/${user.picture}` : 'default.jpg'} alt={user.username} className="w-12 h-12 rounded-full" />
                                                    <div>
                                                        <div className="text-lg font-semibold">{user.firstname} {user.lastname}</div>
                                                        <div className="text-sm text-gray-600">{user.email}</div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-100 p-4 rounded-md">
                                                    <div className="text-sm text-gray-800"><strong>id:</strong> {review.id}</div>
                                                    <div className="text-sm text-gray-800"><strong>Rating:</strong> {review.rating}</div>
                                                    <div className="text-sm text-gray-800"><strong>Review:</strong> {review.review}</div>
                                                    <div className="text-xs text-gray-500"><strong>Created at:</strong> {new Date(review.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div >
                            </>
                        ))}
                    </div>
                    <div ref={ref}>{isFetchingNextPage && 'Loading...'}</div>
                </div>
            )}
        </>
    )
}
