import { validateRequest } from "@/lib/auth";
import { TUser } from "@/types/index.types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { user } = await validateRequest()

    return NextResponse.json(user)
}