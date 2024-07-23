import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { reviewTable, userTable } from "@/lib/db/schema";
import { TReview } from "@/types/index.types";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params: { id } }: { params: { id: number } }) {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('pageParam') || 1;
    const LIMIT = 2
    const OFFSET = (Number(pageParam) - 1) * LIMIT;

    const reviews = await db.select().from(reviewTable)
        .where(sql`${reviewTable.doctorId} = ${id}`)
        .leftJoin(userTable, eq(userTable.id, reviewTable.userId))

    const response = {
        data: reviews.slice(Number(pageParam) * LIMIT - LIMIT, Number(pageParam) * LIMIT),
        reviewsArrFormat: reviews,
        currentPage: Number(pageParam),
        nextPage: OFFSET + LIMIT < reviews.length ? Number(pageParam) + 1 : null,
    }

    return NextResponse.json(response)
}