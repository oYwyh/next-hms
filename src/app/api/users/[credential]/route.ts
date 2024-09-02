import { checkCredit } from "@/actions/index.actions";
import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { UniqueColumns } from "@/types/index.types";
import { and, eq, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params: { credential } }: { params: { credential: string } }) {
    const result = await checkCredit({ credential });

    if (!result || !result.exists || !result.column || !(result.column in userTable)) {
        return NextResponse.json({});
    }

    // Use ILIKE for case-insensitive and partial matches
    const users = await db.query.userTable.findMany({
        where: and(ilike(userTable[result.column as UniqueColumns], `%${credential}%`), eq(userTable.role, 'user')),
        limit: 10
    });

    return NextResponse.json(users);
}