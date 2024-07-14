import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { user } = await validateRequest()

    return NextResponse.json(user)
}